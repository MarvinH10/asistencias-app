import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    device_id: string | null;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

class DeviceFingerprinter {
    private static async getCanvasFingerprint(): Promise<string> {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return 'no-canvas';

            canvas.width = 200;
            canvas.height = 50;
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Device fingerprint 🔒', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Security check', 4, 45);

            return canvas.toDataURL();
        } catch {
            return 'canvas-error';
        }
    }

    private static async getWebGLFingerprint(): Promise<string> {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
            
            if (!gl) return 'no-webgl';

            const vendor = gl.getParameter(gl.VENDOR);
            const renderer = gl.getParameter(gl.RENDERER);
            
            return `${vendor}|${renderer}`;
        } catch {
            return 'webgl-error';
        }
    }

    private static getScreenFingerprint(): string {
        return [
            screen.width,
            screen.height,
            screen.colorDepth,
            screen.pixelDepth,
            window.devicePixelRatio || 1
        ].join('x');
    }

    private static getTimezoneFingerprint(): string {
        try {
            return [
                new Date().getTimezoneOffset(),
                Intl.DateTimeFormat().resolvedOptions().timeZone
            ].join('|');
        } catch {
            return new Date().getTimezoneOffset().toString();
        }
    }

    private static getNavigatorFingerprint(): string {
        return [
            navigator.userAgent,
            navigator.language,
            navigator.languages?.join(',') || '',
            navigator.platform,
            navigator.cookieEnabled,
            navigator.hardwareConcurrency || 0,
            (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
            navigator.maxTouchPoints || 0
        ].join('|');
    }

    private static async hashString(str: string): Promise<string> {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }
    }

    public static async generateDeviceFingerprint(): Promise<string> {
        try {
            const components = [
                this.getNavigatorFingerprint(),
                this.getScreenFingerprint(),
                this.getTimezoneFingerprint(),
                await this.getCanvasFingerprint(),
                await this.getWebGLFingerprint(),
                Date.now().toString()
            ];
            const fingerprintString = components.join('::');
            const hashedFingerprint = await this.hashString(fingerprintString);
            return `fp_${hashedFingerprint.substring(0, 16)}`;
        } catch (error) {
            console.error('Error generating fingerprint:', error);
            return `fp_fallback_${Date.now().toString(36)}`;
        }
    }

    public static async getDeviceIdentifier(): Promise<string> {
        let persistentId = localStorage.getItem('deviceId');
        if (!persistentId) {
            if (window.crypto && window.crypto.randomUUID) {
                persistentId = `uuid_${window.crypto.randomUUID()}`;
            } else {
                persistentId = `id_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            }
            localStorage.setItem('deviceId', persistentId);
        }
        const currentFingerprint = await this.generateDeviceFingerprint();
        return `${persistentId}|${currentFingerprint}`;
    }
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
        device_id: null,
    });

    useEffect(() => {
        const initializeDeviceId = async () => {
            try {
                const deviceId = await DeviceFingerprinter.getDeviceIdentifier();
                setData('device_id', deviceId);
            } catch (error) {
                console.error('Error initializing device ID:', error);
                const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36)}`;
                setData('device_id', fallbackId);
            }
        };
        initializeDeviceId();
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            const deviceId = await DeviceFingerprinter.getDeviceIdentifier();
            setData('device_id', deviceId);
        } catch (error) {
            console.error('Error getting device ID on submit:', error);
        }
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Inicia sesión en tu cuenta" description="Ingresa tu correo electrónico y contraseña para acceder">
            <Head title="Iniciar sesión" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Contraseña</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    ¿Olvidaste tu contraseña?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Recuérdame</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Iniciar sesión
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Regístrate
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
