export interface Position {
    id: number;
    nombre: string;
    descripcion: string;
    estado: boolean;
    company_id: number | null;
    department_id: number | null;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
    company?: {
        id: number;
        razon_social: string;
    };
    department?: {
        id: number;
        nombre: string;
    };
    parent?: {
        id: number;
        nombre: string;
    };
}