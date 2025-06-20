import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { PageProps } from '@inertiajs/core';
import { useAppearance } from '@/hooks/use-appearance';
import Button from '@/components/ui/button-create-edit-form';
import { QRCode } from 'react-qrcode-logo';

interface QrCodePageProps extends PageProps {
    qrCodes: { id: number; qr_code: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Código QR', href: '/qr-codes' },
];

export default function QrCodes() {
    const { props } = usePage<QrCodePageProps>();
    const { qrCodes } = props;
    const [isCreating, setIsCreating] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ qr_code: '' });
    const { effectiveTheme } = useAppearance();
    const canvasRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/qr-codes', {
            onSuccess: () => { toast.success('QR creado correctamente'); setIsCreating(false); reset(); },
            onError: () => toast.error('Error al crear el QR'),
        });
    };

    const handleCancel = () => { setIsCreating(false); reset(); };

    const getDataUrl = (id: number) => {
        const canvas = canvasRefs.current[id]?.querySelector('canvas');
        return canvas?.toDataURL('image/png') || '';
    };

    const handleDownload = (qr_code: string, id: number) => {
        const url = getDataUrl(id); if (!url) return;
        const link = document.createElement('a');
        link.href = url; link.download = `qr-${qr_code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = (qr_code: string, id: number) => {
        const url = getDataUrl(id);
        if (!url) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
      <html>
        <head>
          <title>Imprimir QR</title>
          <style>
            body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}
            img{width:350px;height:350px;}
          </style>
        </head>
        <body>
          <img id="qr-img" src="${url}" alt="QR Code"/>
          <script>
            window.onload = function() {
              var img = document.getElementById('qr-img');
              if (img) {
                img.onload = function() {
                  window.focus();
                  window.print();
                  window.close();
                };
                // Si la imagen ya está cargada (por cache), dispara manualmente
                if (img.complete) {
                  img.onload();
                }
              } else {
                window.print();
                window.close();
              }
            };
          </script>
        </body>
      </html>
    `);
        w.document.close();
    };

    const handleEdit = (qr: { id: number; qr_code: string }) => {
        setEditingId(qr.id);
        setEditValue(qr.qr_code);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            router.put(`/qr-codes/${editingId}`, { qr_code: editValue }, {
                onSuccess: () => {
                    toast.success('QR actualizado correctamente');
                    setEditingId(null);
                    setEditValue('');
                },
                onError: () => toast.error('Error al actualizar el QR'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Código QR" />
            <ToastContainer />
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${effectiveTheme === 'dark' ? 'text-neutral-100' : 'text-neutral-700'}`}>Códigos QR</h1>
                    <Button label="Crear uno nuevo" type="button" variant="primary" onClick={() => setIsCreating(true)} size="md" />
                </div>

                {isCreating && (
                    <div className={`rounded-lg ${effectiveTheme === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} border shadow-sm mb-8`}>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <label className="block text-sm font-medium">Nuevo Código</label>
                            <input
                                value={data.qr_code}
                                onChange={e => setData('qr_code', e.target.value)}
                                className="border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300 w-full"
                                required
                            />
                            {errors.qr_code && <p className="text-red-500 text-sm">{errors.qr_code}</p>}
                            <div className="flex gap-3">
                                <Button
                                    label={processing ? 'Guardando' : 'Guardar'}
                                    type="submit"
                                    variant="primary"
                                    onClick={() => {}}
                                />
                                <Button label="Cancelar" type="button" variant="secondary" onClick={handleCancel} />
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qrCodes.length === 0 && (
                        <div className="col-span-full text-center text-neutral-500">No hay códigos QR registrados.</div>
                    )}
                    {qrCodes.map(qr => (
                        <div key={qr.id} className={`rounded-lg ${effectiveTheme === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} border shadow-sm flex flex-col items-center p-6`}>
                            <div
                                ref={(el) => { canvasRefs.current[qr.id] = el; }}
                                className="relative bg-white rounded-2xl mb-4"
                            >
                                <div style={{ position: 'relative', width: 260, height: 260 }}>
                                    <QRCode
                                        value={qr.qr_code}
                                        size={260}
                                        quietZone={6}
                                    />
                                </div>
                            </div>
                            <p className={`text-sm font-mono ${effectiveTheme === 'dark' ? 'text-neutral-100' : 'text-neutral-700'}`}>{qr.qr_code}</p>
                            <div className="grid grid-cols-2 gap-2 w-full mt-3">
                                <Button label="Descargar" onClick={() => handleDownload(qr.qr_code, qr.id)} variant="secondary" />
                                <Button label="Copiar" onClick={() => { navigator.clipboard.writeText(qr.qr_code); toast.success('Código copiado'); }} variant="secondary" />
                                <Button
                                    label="Imprimir"
                                    onClick={() => handlePrint(qr.qr_code, qr.id)}
                                    variant="secondary"
                                    disabled={processing}
                                />
                                <Button label="Editar" onClick={() => handleEdit(qr)} variant="primary" />
                            </div>
                            {editingId === qr.id ? (
                                <form onSubmit={handleEditSubmit} className="w-full space-y-4 mb-4 mt-4">
                                    <label className="block text-sm font-medium">Editar Código</label>
                                    <input
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <Button label="Guardar" type="submit" variant="primary" onClick={() => {}} />
                                        <Button label="Cancelar" type="button" variant="secondary" onClick={handleEditCancel} />
                                    </div>
                                </form>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
