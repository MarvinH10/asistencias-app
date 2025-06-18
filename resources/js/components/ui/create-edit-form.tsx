import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/button-create-edit-form';
import type { CreateEditFormProps, FormField } from '@/types/components/ui/form';
import { Switch } from "@/components/ui/switch"

type FormValue = string | number | boolean | File | null;

function toDatetimeLocal(value: string | null | undefined): string {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
        return value.slice(0, 16);
    }
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) {
        return value;
    }
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const CreateEditForm: React.FC<CreateEditFormProps> = ({
    title,
    urlView = '',
    breadcrumb,
    initialData = {},
    isEdit = false,
    fields = [],
    className = '',
    onSubmit,
    onCancel,
}) => {
    const { data, setData, errors, processing, post, put } = useForm<Record<string, FormValue>>(
        isEdit
            ? { ...initialData }
            : Object.fromEntries(fields.map(f => [
                f.name,
                f.type === 'checkbox' ? true : ''
            ] as [string, FormValue]))
    );

    const recordId = isEdit ? (data.id as string | number | undefined) : undefined;

    const handleSubmit = (
        e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
    ) => {
        e?.preventDefault();
        if (onSubmit) {
            onSubmit(data);
            return;
        }

        const endpoint = isEdit && recordId ? `${urlView}/${recordId}` : urlView;
        const action = isEdit ? put : post;

        action(endpoint, {
            onSuccess: () => {
                const successMessage = isEdit
                    ? `${title} actualizado exitosamente.`
                    : `${title} creado exitosamente.`;
                toast.success(successMessage);
            },
            onError: (error) => {
                const errorMessage = isEdit
                    ? `Error al actualizar ${title.toLowerCase()}`
                    : `Error al crear ${title.toLowerCase()}`;
                toast.error(errorMessage);
                console.error(`Error ${isEdit ? 'updating' : 'creating'} ${title}:`, error);
            }
        });
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.visit(urlView);
        }
    };

    const renderField = (field: FormField) => {
        const getFieldValue = (fieldName: string): string | number => {
            const value = data[fieldName];
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            if (value === null || value === undefined) return '';
            if (value instanceof File) return '';
            const fieldType = fields.find(f => f.name === fieldName)?.type;
            if (fieldType === 'datetime-local') {
                return toDatetimeLocal(value as string);
            }
            if (fieldType === 'date') {
                return toDateInput(value as string);
            }
            return value;
        };

        const commonProps = {
            name: field.name,
            id: field.name,
            value: getFieldValue(field.name),
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const value = e.target.value;
                setData(field.name, value === '' ? null : value);
            },
            className: `mt-1 block w-full rounded-md border border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:ring-0 focus:ring-gray-400 focus:outline-none sm:text-sm p-2 transition-all duration-200 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 ${errors[field.name]
                ? 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-200'
                : ''
                }`,
            required: field.required,
            placeholder: field.placeholder,
        };

        switch (field.type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        {(!field.required || !getFieldValue(field.name)) && (
                            <option value="">
                                {field.placeholder || `Seleccione ${field.label}`}
                            </option>
                        )}
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows={4}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                    />
                );

            case 'number':
                return (
                    <input
                        {...commonProps}
                        type="number"
                        min={field.validation?.min}
                        max={field.validation?.max}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                    />
                );

            case 'checkbox':
                return (
                    <Switch
                        checked={Boolean(data[field.name])}
                        onCheckedChange={(checked) => setData(field.name, checked)}
                        name={field.name}
                        id={field.name}
                    />
                );

            case 'file':
                return (
                    <input
                        type="file"
                        name={field.name}
                        id={field.name}
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files?.[0] || null;
                            setData(field.name, file);
                        }}
                        className={commonProps.className}
                    />
                );

            case 'password':
                return (
                    <input
                        {...commonProps}
                        type="password"
                    />
                );

            case 'datetime-local':
                return (
                    <input
                        {...commonProps}
                        type="datetime-local"
                    />
                );

            case 'datetime':
                return (
                    <input
                        {...commonProps}
                        type="datetime"
                    />
                );

            case 'text':
            case 'email':
                return (
                    <input
                        {...commonProps}
                        type={field.type}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        pattern={field.validation?.pattern}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                    />
                );
                
            default:
                return (
                    <input
                        {...commonProps}
                        type={field.type}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        pattern={field.validation?.pattern}
                    />
                );
        }
    };

    const checkboxFields = fields.filter(f => f.type === 'checkbox');
    const otherFields = fields.filter(f => f.type !== 'checkbox');

    return (
        <div className={`${className} bg-white dark:bg-neutral-900 rounded-lg`}>
            <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
                {isEdit ? `Editar ${title}` : `Crear ${title}`}
            </h1>

            {breadcrumb && (
                <div className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
                    {breadcrumb}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherFields.map((field) => {
                    if (field.name === 'activa' && !isEdit) return null;
                    return (
                        <div key={field.name} className="flex flex-col">
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderField(field)}
                            {errors[field.name] && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
                            )}
                        </div>
                    );
                })}

                {isEdit && checkboxFields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
                        )}
                    </div>
                ))}

                <div className="col-span-full flex justify-end gap-4 mt-4">
                    <Button
                        type="button"
                        size="md"
                        variant="primary"
                        label={isEdit ? 'Actualizar' : 'Crear'}
                        disabled={processing}
                        onClick={handleSubmit}
                    />
                    <Button
                        type="button"
                        label="Cancelar"
                        variant="secondary"
                        onClick={handleCancel}
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateEditForm;