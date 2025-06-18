import { useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import LogoKdoshBlanco from '@/assets/BLANCO_KDOSH.png';

interface AppLogoProps {
    collapsed?: boolean;
}

export default function AppLogo({ collapsed = false }: AppLogoProps) {
    const { appearance } = useAppearance();
    const [systemDark, setSystemDark] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const update = () => setSystemDark(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' && systemDark);

    return (
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div
                className={`flex aspect-square ${collapsed ? 'size-10' : 'size-8'} items-center justify-center rounded-md ${
                    isDark ? 'bg-neutral-900' : 'bg-neutral-900'
                } text-white overflow-hidden transition-all duration-200`}
            >
                <img
                    src={LogoKdoshBlanco}
                    alt="Logo Kdosh"
                    className={`${collapsed ? 'size-8' : 'size-7'} object-contain transition-all duration-200`}
                />
            </div>
            {!collapsed && (
                <div className="ml-1 mt-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">Registro de Asistencias</span>
                </div>
            )}
        </div>
    );
}