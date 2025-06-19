import React, { useState, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, Clock, UserCheck, LogIn, LogOut, LoaderCircle } from 'lucide-react';
import QRCapture from '@/components/qr-code-scanner';
import { Head } from '@inertiajs/react';

interface AttendanceRecord {
    code: string;
    timestamp: number;
    status: 'pending' | 'success' | 'error';
    type: 'Entrada' | 'Salida';
    error?: string;
    warning?: string;
    user_name?: string;
    latitude?: string;
    longitude?: string;
}

const ScannerPage: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceType, setAttendanceType] = useState<'Entrada' | 'Salida'>('Entrada');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{lat: string, lng: string} | null>(null);
    const isOnline = true;
    const lastChecked = new Date();

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
                    warning: data.warning
                };
            } else {
                return { 
                    success: false, 
                    error: data.error || 'Error desconocido' 
                };
            }
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            return { 
                success: false, 
                error: 'Error de conexión al servidor' 
            };
        }
    };

    const handleCodeDetected = useCallback((code: string) => {
        const type = attendanceType;
        const timestamp = Date.now();
        setLocationError(null);
        
        const addRecord = (lat?: string, lng?: string) => {
            setAttendanceRecords(prev => [{
                code,
                timestamp,
                status: 'pending',
                type,
                latitude: lat,
                longitude: lng,
            }, ...prev]);
            registerAttendance(code, type, lat, lng).then(result => {
                setAttendanceRecords(prev => prev.map(item =>
                    item.code === code && item.type === type && item.timestamp === timestamp
                        ? result.success
                            ? { 
                                ...item, 
                                status: 'success', 
                                user_name: result.user_name, 
                                latitude: result.latitude, 
                                longitude: result.longitude,
                                warning: result.warning
                              }
                            : { ...item, status: 'error', error: result.error || 'Error desconocido' }
                        : item
                ));
                setIsGettingLocation(false);
            });
        };
        
        // Si ya tenemos ubicación, usarla directamente
        if (currentLocation) {
            console.log(`📍 Usando ubicación guardada: ${currentLocation.lat}, ${currentLocation.lng}`);
            addRecord(currentLocation.lat, currentLocation.lng);
            return;
        }
        
        // Si no tenemos ubicación, obtenerla
        setIsGettingLocation(true);
        
        const getLocationWithRetry = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude.toString();
                        const lng = position.coords.longitude.toString();
                        
                        console.log(`📍 Ubicación obtenida al escanear: ${lat}, ${lng} (precisión: ${position.coords.accuracy}m)`);
                        setCurrentLocation({lat, lng});
                        addRecord(lat, lng);
                    },
                    (error) => {
                        console.error('Error de geolocalización:', error);
                        let errorMessage = 'No se pudo obtener la ubicación. El registro se guardará sin latitud/longitud.';
                        
                        switch(error.code) {
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
                        maximumAge: 0
                    }
                );
            } else {
                setLocationError('Este navegador no soporta geolocalización.');
                addRecord();
            }
        };

        getLocationWithRetry();
    }, [attendanceType, currentLocation]);

    const removeRecord = useCallback((code: string, type: 'Entrada' | 'Salida') => {
        setAttendanceRecords(prev => prev.filter(item => !(item.code === code && item.type === type)));
    }, []);

    const clearAll = useCallback(() => {
        setAttendanceRecords([]);
    }, []);

    const handleAttendanceTypeChange = useCallback((type: 'Entrada' | 'Salida') => {
        setAttendanceType(type);
        setLocationError(null);
    }, []);

    const handleCameraToggle = useCallback(() => {
        const newCameraState = !isCameraActive;
        setIsCameraActive(newCameraState);
        setLocationError(null);
        
        // Si estamos activando la cámara, obtener ubicación
        if (newCameraState && !currentLocation) {
            setIsGettingLocation(true);
            console.log('🔄 Obteniendo ubicación al activar cámara...');
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude.toString();
                        const lng = position.coords.longitude.toString();
                        
                        console.log(`📍 Ubicación obtenida: ${lat}, ${lng} (precisión: ${position.coords.accuracy}m)`);
                        setCurrentLocation({lat, lng});
                        setIsGettingLocation(false);
                    },
                    (error) => {
                        console.error('❌ Error al obtener ubicación:', error);
                        let errorMessage = 'No se pudo obtener la ubicación.';
                        
                        switch(error.code) {
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
                        maximumAge: 0
                    }
                );
            } else {
                setLocationError('Este navegador no soporta geolocalización.');
                setIsGettingLocation(false);
            }
        }
    }, [isCameraActive, currentLocation]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title="Escáner" />
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                        <span>Escáner de Asistencias</span>
                    </h1>
                    <p className="text-gray-600">Escanea el QR del usuario para registrar su asistencia</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {isOnline ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <Wifi className="w-4 h-4" />
                                <span className="text-sm font-medium">Servidor conectado</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                <WifiOff className="w-4 h-4" />
                                <span className="text-sm font-medium">Servidor desconectado</span>
                            </div>
                        )}
                        {lastChecked && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                <Clock className="w-3 h-3" />
                                {lastChecked.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${attendanceType === 'Entrada' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => handleAttendanceTypeChange('Entrada')}
                            disabled={isGettingLocation}
                        >
                            <LogIn className="w-4 h-4" /> Entrada
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${attendanceType === 'Salida' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => handleAttendanceTypeChange('Salida')}
                            disabled={isGettingLocation}
                        >
                            <LogOut className="w-4 h-4" /> Salida
                        </button>
                    </div>
                    {isGettingLocation && (
                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                            <LoaderCircle className="animate-spin w-5 h-5" />
                            Obteniendo ubicación...
                        </div>
                    )}
                    {locationError && (
                        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
                            {locationError}
                        </div>
                    )}
                    <QRCapture
                        onCodeDetected={isGettingLocation ? () => {} : handleCodeDetected}
                        isActive={isCameraActive && !isGettingLocation}
                        onToggle={handleCameraToggle}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Registros escaneados</h2>
                        <button
                            className="text-sm text-red-600 hover:underline"
                            onClick={clearAll}
                        >
                            Limpiar todo
                        </button>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {attendanceRecords.length === 0 && (
                            <li className="text-gray-400 text-center py-8">No hay registros</li>
                        )}
                        {attendanceRecords.map(item => (
                            <li key={item.code + item.type + item.timestamp} className="py-3 flex items-center gap-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${item.type === 'Entrada' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.type === 'Entrada' ? <LogIn className="w-4 h-4 mr-1" /> : <LogOut className="w-4 h-4 mr-1" />}
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{item.code}</span>
                                {item.user_name && (
                                    <span className="text-sm font-medium text-gray-700">{item.user_name}</span>
                                )}
                                {item.latitude && (
                                    <span className="text-xs text-gray-500">Lat: {item.latitude}</span>
                                )}
                                {item.longitude && (
                                    <span className="text-xs text-gray-500">Lng: {item.longitude}</span>
                                )}
                                <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                {item.status === 'success' && <span className="ml-2 text-green-600">✓</span>}
                                {item.status === 'pending' && <span className="ml-2 text-yellow-500">Procesando...</span>}
                                {item.status === 'error' && (
                                    <span className="ml-2 text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {item.error}</span>
                                )}
                                {item.warning && (
                                    <span className="ml-2 text-yellow-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {item.warning}</span>
                                )}
                                <button
                                    className="ml-auto text-xs text-gray-400 hover:text-red-600"
                                    onClick={() => removeRecord(item.code, item.type)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
