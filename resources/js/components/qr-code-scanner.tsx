import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, type CameraDevice } from 'html5-qrcode';
import { Link as LinkIcon, Repeat } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

interface QRCaptureProps {
    onCodeDetected: (code: string) => void;
    isActive: boolean;
    onToggle: () => void;
    onRegister?: (code: string) => Promise<{ success: boolean; message?: string; error?: string; warning?: string } | void>;
}

const QRCapture: React.FC<QRCaptureProps> = ({ onCodeDetected, isActive, onToggle, onRegister }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const lastDetectedRef = useRef<{ code: string; timestamp: number }>({
        code: '',
        timestamp: 0,
    });
    const [activeTab, setActiveTab] = useState<'scan' | 'search'>('scan');
    const [manualCode, setManualCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCodeDetected = async (code: string) => {
        if (isProcessing) return;
        setIsProcessing(true);
        if (onRegister) {
            await onRegister(code);
        } else {
            onCodeDetected(code);
        }
        setIsProcessing(false);
    };

    const startScanner = useCallback(async () => {
        if (!currentCameraId || !isActive || isProcessing) return;
        setError(null);
        try {
            scannerRef.current = new Html5Qrcode('qr-reader', {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128],
                verbose: false,
            });
            await scannerRef.current.start(
                { deviceId: { exact: currentCameraId } },
                {
                    fps: 5,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText: string) => {
                    const now = Date.now();
                    if (decodedText !== lastDetectedRef.current.code || now - lastDetectedRef.current.timestamp > 2000) {
                        lastDetectedRef.current = {
                            code: decodedText,
                            timestamp: now,
                        };
                        handleCodeDetected(decodedText);
                    }
                },
                (errorMsg: string) => {
                    if (!errorMsg.includes('No QR code found')) {
                        console.warn('⚠️ Escaneo fallido:', errorMsg);
                    }
                },
            );
        } catch (err) {
            const msg = (err instanceof Error ? err.message : String(err)) || 'No se pudo iniciar la cámara';
            setError(msg);
        }
    }, [currentCameraId, isActive, isProcessing]);

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                scannerRef.current = null;
            } catch (err) {
                console.warn('⚠️ Error al detener el escáner:', err);
            }
        }
    };

    useEffect(() => {
        if (isActive && activeTab === 'scan') {
            startScanner();
        } else {
            stopScanner();
        }
        return () => {
            stopScanner();
        };
    }, [isActive, currentCameraId, startScanner, activeTab]);

    const toggleCamera = () => {
        if (cameras.length < 2) return;
        const currentIndex = cameras.findIndex((cam) => cam.id === currentCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        setCurrentCameraId(cameras[nextIndex].id);
    };

    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devices) => {
                setCameras(devices);
                const backCamera = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
                setCurrentCameraId(backCamera?.id || devices[0]?.id || null);
            })
            .catch((err) => {
                console.error('❌ No se pudo obtener cámaras:', err);
                setError('No se pudieron listar las cámaras disponibles.');
            });
    }, []);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            await handleCodeDetected(manualCode.trim());
            setManualCode('');
        }
    };

    const handleTabChange = (newTab: 'scan' | 'search') => {
        setActiveTab(newTab);
        if (newTab === 'scan' && !isActive) {
            onToggle();
        } else if (newTab === 'search' && isActive) {
            onToggle();
        }
    };

    const hasCameras = cameras.length > 0;

    const TabButtons = () => (
        <div className="fixed right-0 bottom-0 left-0 z-50 mx-auto mb-5 flex w-full max-w-xs rounded-2xl bg-[#1b1b1b] p-2 shadow-inner">
            <button
                type="button"
                className={`flex-1 rounded-xl py-5 text-base font-semibold transition-all duration-200 focus:outline-none cursor-pointer ${
                    activeTab === 'scan' ? 'bg-gradient-to-tr from-neutral-700 to-neutral-500 text-white shadow' : 'text-neutral-400'
                }`}
                onClick={() => handleTabChange('scan')}
                disabled={activeTab === 'scan'}
            >
                Escanear QR
            </button>
            <button
                type="button"
                className={`flex-1 rounded-xl py-3 text-base font-semibold transition-all duration-200 focus:outline-none cursor-pointer ${
                    activeTab === 'search' ? 'bg-gradient-to-tr from-neutral-700 to-neutral-500 text-white shadow' : 'text-neutral-400'
                }`}
                onClick={() => handleTabChange('search')}
                disabled={activeTab === 'search'}
            >
                Manual
            </button>
        </div>
    );

    const LinkButton = () => (
        <div className="relative flex items-center justify-center mt-6 mb-2">
            <div className="absolute left-1/2 top-1/2 w-[60px] h-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b1b1b] shadow-lg" />
            <div className="absolute left-1/2 top-1/2 w-[50px] h-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 opacity-20" />
            <button
                type="button"
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#1b1b1b] shadow-lg overflow-hidden group"
            >
                <LinkIcon className="h-6 w-6 cursor-pointer text-neutral-300 z-10" />
                <span className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                    <span className="block h-full w-full bg-gradient-to-t from-white/60 via-white/10 to-transparent blur-sm animate-gloss" />
                </span>
            </button>
            <style>{`
                @keyframes gloss {
                    0% { transform: translateY(100%) rotate(-8deg); opacity: 0.2; }
                    60% { opacity: 0.7; }
                    100% { transform: translateY(-100%) rotate(-8deg); opacity: 0; }
                }
                .animate-gloss {
                    animation: gloss 1s linear;
                }
                .group:hover .animate-gloss {
                    animation: gloss 1s linear;
                }
            `}</style>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center px-4 py-6">
            <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-6">
                {activeTab === 'scan' ? (
                    <>
                        {hasCameras ? (
                            <>
                                <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl border-4 border-neutral-700 bg-black shadow-lg">
                                    {isActive && !error && (
                                        <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-full">
                                            <div
                                                className="animate-scanline absolute left-0 h-1 w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent"
                                                style={{ top: '50%' }}
                                            />
                                        </div>
                                    )}
                                    <div className="absolute top-0 left-0 h-6 w-6 rounded-tl-xl border-t-4 border-l-4 border-white" />
                                    <div className="absolute top-0 right-0 h-6 w-6 rounded-tr-xl border-t-4 border-r-4 border-white" />
                                    <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-white" />
                                    <div className="absolute right-0 bottom-0 h-6 w-6 rounded-br-xl border-r-4 border-b-4 border-white" />
                                    <div id="qr-reader" className="z-10 h-full w-full" />
                                </div>
                                <LinkButton />
                                <p className="mt-15 max-w-xs text-center text-sm text-neutral-300">
                                    El código QR se detectará automáticamente cuando lo posiciones entre las líneas guía
                                </p>
                                {isActive && cameras.length > 1 && (
                                    <div className="mt-4 flex w-full gap-2">
                                        <button
                                            onClick={toggleCamera}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white hover:bg-gray-600"
                                        >
                                            <Repeat className="h-5 w-5" />
                                            Cambiar Cámara
                                        </button>
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-4 w-full rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
                                        <p className="font-medium">Error de cámara:</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="mt-9">
                                    <QRCode value="DEMO-QR" bgColor="transparent" fgColor="#fff" size={200} />
                                </div>
                                <LinkButton />
                                <p className="mt-15 max-w-xs text-center text-sm text-neutral-300">
                                    El código QR se detectará automáticamente cuando lo posiciones entre las líneas guía
                                </p>
                            </>
                        )}
                    </>
                ) : (
                    <div className="mt-[40px] flex flex-col items-center justify-center">
                        <div className="mb-10">
                            <QRCode value={manualCode || ' '} bgColor="transparent" fgColor="#fff" size={200} />
                        </div>
                        <form onSubmit={handleManualSubmit} className="flex w-full max-w-xs flex-col items-center justify-center gap-4">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Ingresa el código manualmente"
                                className="flex-1 rounded-lg border border-gray-700 bg-neutral-800 px-4 py-2 text-base text-white placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-neutral-700 to-neutral-500 px-4 py-2 font-semibold text-white shadow hover:brightness-110 sm:w-auto"
                            >
                                Registrarme
                            </button>
                            <LinkButton />
                        </form>
                    </div>
                )}

                <TabButtons />
            </div>

            <style>{`
                @keyframes scanline {
                    0% { top: 10%; }
                    100% { top: 80%; }
                }
                .animate-scanline {
                    animation: scanline 1.5s infinite alternate cubic-bezier(0.4,0,0.2,1);
                }
            `}</style>
        </div>
    );
};

export default QRCapture;
