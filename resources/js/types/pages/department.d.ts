export interface Department {
    id: number;
    nombre: string;
    codigo: string;
    direccion: string;
    descripcion: string;
    estado: boolean;
    parent_id: number;
    company_id: number;
    created_at: string;
    updated_at: string;
    parent?: { nombre: string } | null;
    company?: { razon_social: string } | null;
}