import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { PageProps } from '@inertiajs/core';
import { useAppearance } from '@/hooks/use-appearance';
import Button from '@/components/ui/button-create-edit-form';
import { QRCode } from 'react-qrcode-logo';
import LogoNegroKdosh from '@/assets/NEGRO_KDOSH.png?inline';

interface QrCodePageProps extends PageProps {
    qrCode?: { id: number; qr_code: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Código QR', href: '/qr-codes' },
];

export default function QrCodes() {
    const { props } = usePage<QrCodePageProps>();
    const { qrCode } = props;
    const [isEditing, setIsEditing] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ qr_code: qrCode?.qr_code || '' });
    const { effectiveTheme } = useAppearance();
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/qr-codes', {
            onSuccess: () => { toast.success('QR actualizado correctamente'); setIsEditing(false); },
            onError: () => toast.error('Error al actualizar el QR'),
        });
    };

    const handleEdit = () => { setIsEditing(true); setData('qr_code', qrCode?.qr_code || ''); };
    const handleCancel = () => { setIsEditing(false); setData('qr_code', qrCode?.qr_code || ''); };

    const getDataUrl = () => {
        const canvas = canvasWrapperRef.current?.querySelector('canvas');
        return canvas?.toDataURL('image/png') || '';
    };

    const handleDownload = () => {
        const url = getDataUrl(); if (!url) return;
        const link = document.createElement('a');
        link.href = url; link.download = `qr-${qrCode?.qr_code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const url = getDataUrl(); if (!url) return;
        const w = window.open('', '_blank');
        w?.document.write(`
      <html><head><title>Imprimir QR</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}img{width:350px;height:350px;}</style>
      </head><body><img src="${url}" alt="QR Code"/></body></html>
    `);
        w?.document.close(); w?.focus(); w?.print(); w?.close();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Código QR" />
            <ToastContainer />
            <div className="p-4">
                <div className={`rounded-lg ${effectiveTheme === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} border shadow-sm`}>
                    <div className="flex justify-between items-center p-6">
                        <h1 className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-neutral-100' : 'text-neutral-700'}`}>Código QR</h1>
                        {!isEditing && <Button label={qrCode ? 'Editar QR' : 'Crear QR'} type="button" variant="primary" onClick={handleEdit} size="md" />}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <label className="block text-sm font-medium">Nuevo Código</label>
                            <input
                                value={data.qr_code}
                                onChange={e => setData('qr_code', e.target.value)}
                                className="w-full border border-neutral-300 rounded-md p-2"
                                required
                            />
                            {errors.qr_code && <p className="text-red-500 text-sm">{errors.qr_code}</p>}
                            <div className="flex gap-3">
                                <Button
                                    label={processing ? 'Guardando...' : 'Guardar'}
                                    type="submit"
                                    variant="primary"
                                    onClick={() => { }}
                                />
                                <Button label="Cancelar" type="button" variant="secondary" onClick={handleCancel} />
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 p-6 flex flex-col items-center">
                            {qrCode ? (
                                <>
                                    <div
                                        ref={canvasWrapperRef}
                                        className="relative bg-white rounded-2xl"
                                    >
                                        <div style={{ position: 'relative', width: 260, height: 260 }}>
                                            <QRCode
                                                value={qrCode.qr_code}
                                                size={260}
                                                quietZone={6}
                                                logoImage={LogoNegroKdosh}
                                                logoWidth={60}
                                                logoHeight={52}
                                                logoPadding={8}
                                                logoPaddingStyle="circle"
                                                qrStyle="dots"
                                            />
                                        </div>
                                    </div>
                                    <p className={`text-sm font-mono ${effectiveTheme === 'dark' ? 'text-neutral-100' : 'text-neutral-700'}`}>{qrCode.qr_code}</p>
                                    <div className="flex gap-3">
                                        <Button label="Descargar QR" onClick={handleDownload} variant="secondary" size="sm" />
                                        <Button label="Copiar Código" onClick={() => { navigator.clipboard.writeText(qrCode.qr_code); toast.success('Código copiado'); }} variant="secondary" size="sm" />
                                        <Button
                                            label="Imprimir QR"
                                            onClick={handlePrint}
                                            variant="secondary"
                                            size="sm"
                                            disabled={processing}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[260px] w-full">
                                    <div className="text-center text-neutral-500 mb-9">No hay código QR registrado. Haz clic en "Crear QR".</div>
                                </div>
                            )}
                            <div className={`text-sm ${effectiveTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                <p>• Este es el código QR único que se usará para el registro de asistencias</p>
                                <p>• Los usuarios pueden escanear este código para marcar su asistencia</p>
                                <p>• Haz clic en "Editar QR" para cambiar el código</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
