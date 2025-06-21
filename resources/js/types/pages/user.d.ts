export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    qr_code_id: number;
    company_id: number;
    department_id: number;
    position_id: number;
    fecha_ingreso: string;
    fecha_retiro: string;
    fecha_cumpleanos?: string | null;
    device_uid?: string | null;
    firma_digital?: string | null;
    dni: string;
    estado: boolean;
    created_at: string;
    updated_at: string;
    qrCode?: { qr_code: string } | null;
    department?: { nombre: string } | null;
    company?: { razon_social: string } | null;
    position?: { nombre: string } | null;
}