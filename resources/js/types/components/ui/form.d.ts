import type { ReactNode } from 'react';
export type FormValue = string | number | boolean | File | null;

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'datetime-local' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox' | 'file' | 'password' | 'datetime';
    required?: boolean;
    showWhenEdit?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface CreateEditFormProps {
    title: string;
    urlView?: string;
    breadcrumb?: ReactNode;
    initialData?: Record<string, FormValue> | null;
    isEdit?: boolean;
    fields: FormField[];
    className?: string;
    onSubmit?: (data: Record<string, FormValue>) => void | Promise<void>;
    onCancel?: () => void;
}
