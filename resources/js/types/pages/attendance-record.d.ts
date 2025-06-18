export interface AttendanceRecord {
    id: number;
    user_id: number;
    attendance_method_id: number;
    timestamp: string;
    ip_address: string;
    qr_token: string;
    latitude: number;
    longitude: number;
    status: string;
    notas: string;
    estado: boolean;
    created_at: string;
    updated_at: string;
    user?: { name: string } | null;
    attendanceMethod?: { nombre: string } | null;
}