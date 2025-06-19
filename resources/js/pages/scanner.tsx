import QRCapture from '@/components/qr-code-scanner';
import { Head } from '@inertiajs/react';
import React, { useCallback, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ScannerPage: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
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

    const handleCodeDetected = useCallback(
        (code: string) => {
            setLocationError(null);

            const addRecord = (lat?: string, lng?: string) => {
                registerAttendance(code, 'Entrada', lat, lng).then(() => {
                    setIsGettingLocation(false);
                });
            };

            if (currentLocation) {
                addRecord(currentLocation.lat, currentLocation.lng);
                return;
            }

            setIsGettingLocation(true);

            const getLocationWithRetry = () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude.toString();
                            const lng = position.coords.longitude.toString();

                            setCurrentLocation({ lat, lng });
                            addRecord(lat, lng);
                        },
                        (error) => {
                            console.error('Error de geolocalización:', error);
                            let errorMessage = 'No se pudo obtener la ubicación. El registro se guardará sin latitud/longitud.';

                            switch (error.code) {
                                case error.PERMISSION_DENIED:
                                    errorMessage = 'Permiso de ubicación denegado. El registro se guardará sin coordenadas.';
                                    break;
                                case error.POSITION_UNAVAILABLE:
                                    errorMessage = 'Información de ubicación no disponible. El registro se guardará sin coordenadas.';
                                    break;
                                case error.TIMEOUT:
                                    errorMessage = 'Tiempo de espera agotado para obtener ubicación. El registro se guardará sin coordenadas.';
                                    break;
                            }

                            setLocationError(errorMessage);
                            addRecord();
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0,
                        },
                    );
                } else {
                    setLocationError('Este navegador no soporta geolocalización.');
                    addRecord();
                }
            };

            getLocationWithRetry();
        },
        [currentLocation],
    );

    const handleCameraToggle = useCallback(() => {
        const newCameraState = !isCameraActive;
        setIsCameraActive(newCameraState);
        setLocationError(null);

        if (newCameraState && !currentLocation) {
            setIsGettingLocation(true);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude.toString();
                        const lng = position.coords.longitude.toString();

                        console.log(`📍 Ubicación obtenida: ${lat}, ${lng} (precisión: ${position.coords.accuracy}m)`);
                        setCurrentLocation({ lat, lng });
                        setIsGettingLocation(false);
                    },
                    (error) => {
                        console.error('❌ Error al obtener ubicación:', error);
                        let errorMessage = 'No se pudo obtener la ubicación.';

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Permiso de ubicación denegado.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Información de ubicación no disponible.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Tiempo de espera agotado para obtener ubicación.';
                                break;
                        }

                        setLocationError(errorMessage);
                        setIsGettingLocation(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    },
                );
            } else {
                setLocationError('Este navegador no soporta geolocalización.');
                setIsGettingLocation(false);
            }
        }
    }, [isCameraActive, currentLocation]);

    const handleRegister = async (code: string) => {
        let lat = currentLocation?.lat;
        let lng = currentLocation?.lng;
        let result;
        setIsGettingLocation(true);
        try {
            if (!lat || !lng) {
                await new Promise((resolve) => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                lat = position.coords.latitude.toString();
                                lng = position.coords.longitude.toString();
                                setCurrentLocation({ lat, lng });
                                resolve(null);
                            },
                            () => resolve(null),
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                        );
                    } else {
                        resolve(null);
                    }
                });
            }
            result = await registerAttendance(code, 'Entrada', lat, lng);
        } finally {
            setIsGettingLocation(false);
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
        <div className="min-h-screen w-full bg-black bg-gradient-to-tl from-neutral-700 via-neutral-800 to-neutral-900 py-8">
            <Head title="Escáner" />
            <div className="mx-auto max-w-2xl px-4">
                <div className="mb-8 text-center mt-6">
                    <h1 className="mb-8 text-2xl font-bold text-white">Escanee el código QR</h1>
                    {locationError && (
                        <div>
                            <div className="mb-4 rounded border border-yellow-300 bg-yellow-100 p-2 text-yellow-800">{locationError}</div>
                            <button
                                onClick={() => {
                                    setLocationError(null);
                                    setIsGettingLocation(true);
                                }}
                                className="mt-2 rounded bg-yellow-400 px-4 py-2 font-bold text-white"
                            >
                                Intentar de nuevo
                            </button>
                        </div>
                    )}
                    <QRCapture
                        onCodeDetected={isGettingLocation ? () => {} : (code) => handleCodeDetected(code)}
                        isActive={isCameraActive && !isGettingLocation}
                        onToggle={handleCameraToggle}
                        onRegister={handleRegister}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
