import QRCapture from '@/components/qr-code-scanner';
import { Head } from '@inertiajs/react';
import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ScannerPage: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [err, setLocationError] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: string; lng: string } | null>(null);

    const registerAttendance = async (code: string, type: 'Entrada' | 'Salida', latitude?: string, longitude?: string) => {
        try {
            const response = await fetch('/scann-attendance/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ qr_code: code, type, latitude, longitude }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: data.message,
                    user_name: data.user_name,
                    latitude: latitude,
                    longitude: longitude,
                    warning: data.warning,
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Error desconocido',
                };
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            return {
                success: false,
                error: 'Error de conexión al servidor',
            };
        }
    };

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Este navegador no soporta geolocalización.');
            setIsGettingLocation(false);
            return Promise.reject(new Error('Geolocalización no soportada'));
        }

        return new Promise<{lat: string, lng: string}>((resolve, reject) => {
            console.log('🔍 Solicitando permisos de geolocalización...');
            setIsGettingLocation(true);
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toString();
                    const lng = position.coords.longitude.toString();

                    console.log(`✅ Ubicación obtenida: ${lat}, ${lng} (precisión: ${position.coords.accuracy}m)`);
                    setCurrentLocation({ lat, lng });
                    setIsGettingLocation(false);
                    resolve({ lat, lng });
                },
                (err) => {
                    console.error('❌ Error al obtener ubicación:', err);
                    let errorMessage = 'No se pudo obtener la ubicación.';

                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage = 'Permiso de ubicación denegado.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage = 'Información de ubicación no disponible.';
                            break;
                        case err.TIMEOUT:
                            errorMessage = 'Tiempo de espera agotado para obtener ubicación.';
                            break;
                    }

                    setLocationError(errorMessage);
                    setIsGettingLocation(false);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                },
            );
        });
    }, []);

    const handleCodeDetected = useCallback(
        async (code: string) => {
            setLocationError(null);

            const addRecord = async (lat?: string, lng?: string) => {
                try {
                    const result = await registerAttendance(code, 'Entrada', lat, lng);
                    if (result.success) {
                        toast.success(result.message || '¡Asistencia registrada correctamente!');
                    } else {
                        toast.error(result.error || 'No se pudo registrar la asistencia.');
                    }
                } catch (e) {
                    console.error("Error de conexión al registrar asistencia", e);
                    toast.error('Error de conexión al registrar asistencia');
                } finally {
                    setIsGettingLocation(false);
                    setIsCameraActive(false);
                }
            };

            if (currentLocation) {
                await addRecord(currentLocation.lat, currentLocation.lng);
                return;
            }

            setIsGettingLocation(true);
            
            try {
                const locationPromise = getLocation();
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout obteniendo ubicación')), 5000);
                });
                
                const location = await Promise.race([locationPromise, timeoutPromise]);
                
                await addRecord(location.lat, location.lng);
            } catch (e) {
                let errorMessage = 'No se pudo obtener la ubicación. El registro se guardará sin coordenadas.';
                
                if (e instanceof Error) {
                    if (e.message.includes('denied')) {
                        errorMessage = 'Permiso de ubicación denegado. El registro se guardará sin coordenadas.';
                    } else if (e.message.includes('unavailable')) {
                        errorMessage = 'Información de ubicación no disponible. El registro se guardará sin coordenadas.';
                    } else if (e.message.includes('timeout')) {
                        errorMessage = 'Tiempo de espera agotado para obtener ubicación. El registro se guardará sin coordenadas.';
                    }
                }
                
                setLocationError(errorMessage);
                console.error(e);
                setTimeout(async () => {
                    await addRecord();
                }, 1000);
            }
        },
        [currentLocation, getLocation],
    );

    const handleCameraToggle = useCallback(() => {
        const newCameraState = !isCameraActive;
        setIsCameraActive(newCameraState);
        setLocationError(null);

        if (newCameraState && !currentLocation) {
            setTimeout(() => {
                getLocation().catch((e) => {
                    console.error("Error de geolocalización en segundo plano:", e);
                });
            }, 500);
        }
    }, [isCameraActive, currentLocation, getLocation]);

    const handleRegister = async (code: string) => {
        let lat = currentLocation?.lat;
        let lng = currentLocation?.lng;
        let result;
        
        try {
            if (!lat || !lng) {
                setIsGettingLocation(true);
                
                try {
                    const locationPromise = getLocation();
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout obteniendo ubicación')), 3000);
                    });
                    
                    const location = await Promise.race([locationPromise, timeoutPromise]);
                    
                    lat = location.lat;
                    lng = location.lng;
                } catch (e) {
                    toast.info('Registrando sin ubicación. Para mejor precisión, intente nuevamente permitiendo el acceso a la ubicación.');
                    console.error(e);
                } finally {
                    setIsGettingLocation(false);
                }
            }
            
            result = await registerAttendance(code, 'Entrada', lat, lng);
        } catch (e) {
            result = {
                success: false,
                error: 'Error en el proceso de registro: ' + (e instanceof Error ? e.message : String(e))
            };
        } finally {
            setIsGettingLocation(false);
            setIsCameraActive(false);
        }
        
        if (result?.success) {
            toast.success(result.message || '¡Se ha registrado correctamente!');
        } else {
            toast.error(result?.error || 'No se pudo registrar la asistencia.');
        }
        
        return result;
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isGettingLocation) {
                setLocationError('Debes mantener la pestaña activa para obtener la ubicación.');
                setIsGettingLocation(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isGettingLocation]);

    return (
        <div className="h-screen overflow-hidden w-full bg-black bg-gradient-to-tl from-neutral-700 via-neutral-800 to-neutral-900 flex flex-col">
            <Head title="Escáner" />
            <div className="flex-shrink-0 text-center w-full max-w-md pt-6 px-4">
                <h1 className="text-2xl font-bold text-white mb-4">Escanee el código QR</h1>

                {err && (
                    <div className="my-4">
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-100 p-3 text-yellow-800 shadow-md">{err}</div>
                        <button
                            onClick={() => {
                                setLocationError(null);
                                getLocation().catch(() => {});
                            }}
                            className="mt-2 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-white shadow-md hover:bg-yellow-500 transition-colors duration-300"
                        >
                            Intentar obtener ubicación
                        </button>
                    </div>
                )}

                {isGettingLocation && (
                    <div className="my-4 flex items-center justify-center p-2 bg-black bg-opacity-20 rounded-lg">
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="text-sm text-white">Obteniendo ubicación...</span>
                    </div>
                )}
            </div>

            <div className="flex-grow w-full max-w-md flex items-center justify-center mx-auto px-4">
                <QRCapture
                    onCodeDetected={isGettingLocation ? () => {} : handleCodeDetected}
                    isActive={isCameraActive}
                    onToggle={handleCameraToggle}
                    onRegister={handleRegister}
                />
            </div>
        </div>
    );
};

export default ScannerPage;
