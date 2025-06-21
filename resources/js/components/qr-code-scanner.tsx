import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats, type CameraDevice } from 'html5-qrcode';
import { Link as LinkIcon } from 'lucide-react';
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

    const handleCodeDetected = useCallback(
        async (code: string) => {
            if (isProcessing) return;
            setIsProcessing(true);
            if (onRegister) {
                await onRegister(code);
            } else {
                onCodeDetected(code);
            }
            setIsProcessing(false);
            if (isActive && onToggle) {
                onToggle();
            }
        },
        [isProcessing, onRegister, onCodeDetected, isActive, onToggle],
    );

    const startScanner = useCallback(async () => {
        if (!currentCameraId || !isActive || isProcessing) return;
        setError(null);
        try {
            if (scannerRef.current) {
                try {
                    await stopScanner();
                } catch (e) {
                    console.error('Error al limpiar escáner previo:', e);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            scannerRef.current = new Html5Qrcode('qr-reader', {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false,
            });

            const config = {
                fps: 5,
                qrbox: 180,
            };

            await scannerRef.current.start(
                currentCameraId,
                config,
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
                () => {},
            );
        } catch (err) {
            const msg = (err instanceof Error ? err.message : String(err)) || 'No se pudo iniciar la cámara';
            setError(msg);

            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                    scannerRef.current = null;
                } catch (clearErr) {
                    console.error('Error al limpiar recursos del escáner:', clearErr);
                }
            }
        }
    }, [currentCameraId, isActive, isProcessing, handleCodeDetected]);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
                scannerRef.current = null;
                return true;
            } catch (err) {
                console.error('Error al detener el escáner:', err);
                return false;
            }
        }
        return true;
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

    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devices) => {
                setCameras(devices);

                const backCamera = devices.find((d) => {
                    const label = d.label.toLowerCase();
                    return label.includes('back') || label.includes('rear') || label.includes('trasera') || label.includes('posterior');
                });

                if (backCamera) {
                    setCurrentCameraId(backCamera.id);
                } else if (devices.length > 0) {
                    setCurrentCameraId(devices[0].id);
                } else {
                    setError('No se encontraron cámaras en el dispositivo.');
                }
            })
            .catch((err) => {
                setError('No se pudieron listar las cámaras disponibles. ' + (err instanceof Error ? err.message : String(err)));
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
        <div className="fixed right-0 bottom-0 left-0 z-50 mx-auto mb-4 flex w-full max-w-xs rounded-2xl bg-[#1b1b1b] p-2 shadow-inner">
            <button
                type="button"
                className={`flex-1 cursor-pointer rounded-xl py-5 text-base font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === 'scan' ? 'bg-gradient-to-tr from-neutral-700 to-neutral-500 text-white shadow' : 'text-neutral-400'
                }`}
                onClick={() => handleTabChange('scan')}
                disabled={activeTab === 'scan'}
            >
                Escanear QR
            </button>
            <button
                type="button"
                className={`flex-1 cursor-pointer rounded-xl py-3 text-base font-semibold transition-all duration-200 focus:outline-none ${
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
        <div className="relative mt-6 flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b1b1b] shadow-lg" />
            <div className="absolute top-1/2 left-1/2 h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 opacity-20" />
            <button
                type="button"
                className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#1b1b1b] shadow-lg"
            >
                <LinkIcon className="z-10 h-6 w-6 cursor-pointer text-neutral-300" />
                <span className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-60">
                    <span className="animate-gloss block h-full w-full bg-gradient-to-t from-white/60 via-white/10 to-transparent blur-sm" />
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
        <div className="relative flex h-full w-full flex-col items-center justify-center">
            <div className="flex-grow w-full flex flex-col items-center justify-center gap-4">
                {activeTab === 'scan' ? (
                    <>
                        {hasCameras ? (
                            !isActive ? (
                                <div className="text-center">
                                    <button
                                        onClick={onToggle}
                                        className="mb-4 transform rounded-lg bg-gradient-to-tr from-neutral-700 to-neutral-500 px-6 py-3 font-semibold text-white shadow transition-all duration-300 hover:scale-105 hover:brightness-110"
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Activar Cámara
                                        </div>
                                    </button>
                                    <p className="text-sm text-neutral-300">Haga clic para iniciar el escáner de QR</p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-4 border-neutral-700 bg-black shadow-lg sm:h-60 sm:w-60">
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
                                        {isActive && !error && (
                                            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                                                <div className="bg-opacity-50 rounded-full bg-black px-3 py-1 text-xs text-white">
                                                    Cámara activada...
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <LinkButton />
                                    <p className="max-w-xs text-center text-sm text-neutral-300">El código QR se detectará automáticamente</p>
                                    {error && (
                                        <div className="mt-4 w-full rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
                                            <p className="font-medium">Error de cámara:</p>
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <>
                                <QRCode value="DEMO-QR" bgColor="transparent" fgColor="#fff" size={180} />
                                <LinkButton />
                                <p className="max-w-xs text-center text-sm text-neutral-300">
                                    No se detectaron cámaras, active los permisos o use la entrada manual.
                                </p>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <div className="mb-4">
                            <QRCode value={manualCode || ' '} bgColor="transparent" fgColor="#fff" size={180} />
                        </div>
                        <form onSubmit={handleManualSubmit} className="flex w-full max-w-xs flex-col items-center justify-center gap-4">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Ingresa el código manualmente"
                                className="flex-1 rounded-lg border border-gray-700 bg-neutral-800 px-4 py-2 text-base text-white placeholder-gray-400 focus:border-gray-500 focus:ring-0 focus:outline-none"
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
            </div>
            <div className="flex-shrink-0" style={{ height: '110px' }} />
            <TabButtons />
        </div>
    );
};

export default QRCapture;
