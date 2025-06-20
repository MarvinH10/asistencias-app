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

    // Función para obtener la ubicación de forma independiente
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
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Aumentado a 15 segundos
                    maximumAge: 0,
                },
            );
        });
    }, []);

    const handleCodeDetected = useCallback(
        async (code: string) => {
            setLocationError(null);

            // Función para registrar asistencia
            const addRecord = async (lat?: string, lng?: string) => {
                try {
                    const result = await registerAttendance(code, 'Entrada', lat, lng);
                    if (result.success) {
                        toast.success(result.message || '¡Asistencia registrada correctamente!');
                    } else {
                        toast.error(result.error || 'No se pudo registrar la asistencia.');
                    }
                } catch (error) {
                    toast.error('Error de conexión al registrar asistencia');
                } finally {
                    setIsGettingLocation(false);
                    // Desactivar la cámara después de registrar
                    setIsCameraActive(false);
                }
            };

            // Si ya tenemos ubicación, usarla directamente
            if (currentLocation) {
                await addRecord(currentLocation.lat, currentLocation.lng);
                return;
            }

            // Intentar obtener ubicación con un timeout corto
            setIsGettingLocation(true);
            
            try {
                // Intentamos obtener la ubicación con un timeout de 5 segundos
                const locationPromise = getLocation();
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout obteniendo ubicación')), 5000);
                });
                
                const location = await Promise.race([locationPromise, timeoutPromise]);
                
                await addRecord(location.lat, location.lng);
            } catch (error) {
                let errorMessage = 'No se pudo obtener la ubicación. El registro se guardará sin coordenadas.';
                
                if (error instanceof Error) {
                    if (error.message.includes('denied')) {
                        errorMessage = 'Permiso de ubicación denegado. El registro se guardará sin coordenadas.';
                    } else if (error.message.includes('unavailable')) {
                        errorMessage = 'Información de ubicación no disponible. El registro se guardará sin coordenadas.';
                    } else if (error.message.includes('timeout')) {
                        errorMessage = 'Tiempo de espera agotado para obtener ubicación. El registro se guardará sin coordenadas.';
                    }
                }
                
                setLocationError(errorMessage);
                // Registrar sin coordenadas después de un breve retraso para permitir que el usuario vea el mensaje
                setTimeout(async () => {
                    await addRecord(); // Registrar sin coordenadas
                }, 1000);
            }
        },
        [currentLocation, getLocation],
    );

    // Función para activar/desactivar la cámara
    const handleCameraToggle = useCallback(() => {
        const newCameraState = !isCameraActive;
        setIsCameraActive(newCameraState);
        setLocationError(null);

        // Si estamos activando la cámara y no tenemos ubicación, intentamos obtenerla
        // pero no bloqueamos la activación de la cámara
        if (newCameraState && !currentLocation) {
            // Usar setTimeout para asegurar que la activación de la cámara no se bloquee
            setTimeout(() => {
                getLocation().catch(err => {
                    // No bloqueamos la activación de la cámara si falla la geolocalización
                });
            }, 500);
        }
    }, [isCameraActive, currentLocation, getLocation]);

    const handleRegister = async (code: string) => {
        let lat = currentLocation?.lat;
        let lng = currentLocation?.lng;
        let result;
        
        try {
            // Si no tenemos ubicación, intentamos obtenerla pero con un timeout más corto
            if (!lat || !lng) {
                setIsGettingLocation(true);
                
                try {
                    // Intentamos obtener la ubicación con un timeout más corto (3 segundos)
                    const locationPromise = getLocation();
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout obteniendo ubicación')), 3000);
                    });
                    
                    const location = await Promise.race([locationPromise, timeoutPromise]);
                    
                    lat = location.lat;
                    lng = location.lng;
                } catch (locationError) {
                    // Mostramos un mensaje pero continuamos sin ubicación
                    toast.info('Registrando sin ubicación. Para mejor precisión, intente nuevamente permitiendo el acceso a la ubicación.');
                } finally {
                    setIsGettingLocation(false);
                }
            }
            
            // Registramos la asistencia con o sin ubicación
            result = await registerAttendance(code, 'Entrada', lat, lng);
        } catch (error) {
            result = {
                success: false,
                error: 'Error en el proceso de registro: ' + (error instanceof Error ? error.message : String(error))
            };
        } finally {
            setIsGettingLocation(false);
            // Desactivar la cámara después de registrar
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
        <div className="min-h-screen w-full bg-black bg-gradient-to-tl from-neutral-700 via-neutral-800 to-neutral-900 py-8">
            <Head title="Escáner" />
            <div className="mx-auto max-w-2xl px-4">
                <div className="mb-8 text-center mt-6">
                    <h1 className="mb-8 text-2xl font-bold text-white">Escanee el código QR</h1>
                    
                    {/* Botón para activar la cámara cuando no está activa */}
                    {!isCameraActive && (
                        <div className="mb-6 flex flex-col items-center justify-center">
                            <button
                                onClick={handleCameraToggle}
                                className="mb-4 rounded-lg bg-gradient-to-tr from-neutral-700 to-neutral-500 px-6 py-3 font-semibold text-white shadow hover:brightness-110 transition-all duration-300 transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    Activar Cámara
                                </div>
                            </button>
                            <p className="text-sm text-neutral-300">Haga clic para iniciar el escáner de QR</p>
                        </div>
                    )}
                    
                    {/* Mensaje de error de ubicación */}
                    {locationError && (
                        <div className="mb-4">
                            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-100 p-3 text-yellow-800 shadow-md">{locationError}</div>
                            <button
                                onClick={() => {
                                    setLocationError(null);
                                    getLocation().catch(err => {
                                        // Error al obtener ubicación
                                    });
                                }}
                                className="mt-2 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-white shadow-md hover:bg-yellow-500 transition-colors duration-300"
                            >
                                Intentar obtener ubicación
                            </button>
                        </div>
                    )}
                    
                    {/* Indicador de carga mientras se obtiene la ubicación */}
                    {isGettingLocation && (
                        <div className="mb-4 flex items-center justify-center p-2 bg-black bg-opacity-20 rounded-lg">
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span className="text-sm text-white">Obteniendo ubicación...</span>
                        </div>
                    )}
                    
                    {/* Componente de escáner QR */}
                    <QRCapture
                        onCodeDetected={isGettingLocation ? () => {} : (code) => handleCodeDetected(code)}
                        isActive={isCameraActive}
                        onToggle={handleCameraToggle}
                        onRegister={handleRegister}
                    />
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
