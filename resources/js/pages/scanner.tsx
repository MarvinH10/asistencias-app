import React, { useState, useCallback } from 'react';
import { AlertCircle, Wifi, WifiOff, Clock, UserCheck, LogIn, LogOut } from 'lucide-react';
// Aquí deberías importar tu hook de conexión al servidor y el componente de QR
// import { useServerStatus } from '../hooks/useServerStatus';
// import QRCapture from '../components/QRCapture';

interface AttendanceRecord {
    code: string;
    timestamp: number;
    status: 'pending' | 'success' | 'error';
    type: 'entrada' | 'salida';
    error?: string;
}

const ScannerPage: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceType, setAttendanceType] = useState<'entrada' | 'salida'>('entrada');
    // Simulación de estado de conexión
    const isOnline = true;
    const lastChecked = new Date();

    // Simula el registro de asistencia (reemplaza por tu lógica real)
    const registerAttendance = async (code: string, type: 'entrada' | 'salida') => {
        // Aquí deberías hacer la petición al backend
        // Simulación de éxito/fracaso
        return new Promise<{ success: boolean; error?: string }>((resolve) => {
            setTimeout(() => {
                if (code.startsWith('ERR')) {
                    resolve({ success: false, error: 'Código inválido o ya registrado.' });
                } else {
                    resolve({ success: true });
                }
            }, 800);
        });
    };

    const handleCodeDetected = useCallback((code: string) => {
        setAttendanceRecords(prev => {
            if (prev.some(item => item.code === code && item.type === attendanceType)) {
                return prev;
            }
            return [{
                code,
                timestamp: Date.now(),
                status: 'pending',
                type: attendanceType,
            }, ...prev];
        });
        // Llama al registro
        registerAttendance(code, attendanceType).then(result => {
            setAttendanceRecords(prev => prev.map(item =>
                item.code === code && item.type === attendanceType
                    ? result.success
                        ? { ...item, status: 'success' }
                        : { ...item, status: 'error', error: result.error || 'Error desconocido' }
                    : item
            ));
        });
    }, [attendanceType]);

    const removeRecord = useCallback((code: string, type: 'entrada' | 'salida') => {
        setAttendanceRecords(prev => prev.filter(item => !(item.code === code && item.type === type)));
    }, []);

    const clearAll = useCallback(() => {
        setAttendanceRecords([]);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
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
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${attendanceType === 'entrada' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setAttendanceType('entrada')}
                        >
                            <LogIn className="w-4 h-4" /> Entrada
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${attendanceType === 'salida' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setAttendanceType('salida')}
                        >
                            <LogOut className="w-4 h-4" /> Salida
                        </button>
                    </div>
                    {/* QRCapture debe ser tu componente de escaneo QR */}
                    <div className="mb-4">
                        {/* <QRCapture
              onCodeDetected={handleCodeDetected}
              isActive={isCameraActive}
              onToggle={() => setIsCameraActive(!isCameraActive)}
            /> */}
                        <div className="text-gray-400 text-center border border-dashed border-gray-300 rounded-lg p-8">
                            [Aquí va el componente de escaneo QR]
                        </div>
                        <button
                            className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium"
                            onClick={() => setIsCameraActive(a => !a)}
                        >
                            {isCameraActive ? 'Detener cámara' : 'Activar cámara'}
                        </button>
                    </div>
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
                            <li key={item.code + item.type} className="py-3 flex items-center gap-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${item.type === 'entrada' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.type === 'entrada' ? <LogIn className="w-4 h-4 mr-1" /> : <LogOut className="w-4 h-4 mr-1" />}
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{item.code}</span>
                                <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                {item.status === 'success' && <span className="ml-2 text-green-600">✓</span>}
                                {item.status === 'pending' && <span className="ml-2 text-yellow-500">Procesando...</span>}
                                {item.status === 'error' && (
                                    <span className="ml-2 text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {item.error}</span>
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
