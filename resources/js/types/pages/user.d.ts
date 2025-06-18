export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    company_id: number;
    department_id: number;
    position_id: number;
    fecha_ingreso: string;
    fecha_retiro: string;
    estado: boolean;
    created_at: string;
    updated_at: string;
    department?: { nombre: string } | null;
    company?: { razon_social: string } | null;
    position?: { nombre: string } | null;
}