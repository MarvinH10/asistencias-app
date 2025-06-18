export interface Shift {
    id: number;
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
    estado: boolean;
    creado_por: number;
    created_at: string;
    updated_at: string;
    created_by?: { name: string } | null;
}