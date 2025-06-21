import React from 'react';
import { useForm, router } from '@inertiajs/react';
import {default as SubmitButton} from '@/components/ui/button-create-edit-form';
import { Button } from '@/components/ui/button';
import type { CreateEditFormProps as OriginalCreateEditFormProps, FormField } from '@/types/components/ui/form';
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type FormValue = string | number | boolean | File | null;

interface AttendanceMethod {
    id: number;
    nombre: string;
    clave: string;
}

interface CreateEditFormProps extends OriginalCreateEditFormProps {
    attendanceMethods?: AttendanceMethod[];
}

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
    attendanceMethods = [],
}) => {
    const getInitialData = () => {
        const initialFormState: Record<string, FormValue> = isEdit
            ? { ...initialData }
            : Object.fromEntries(fields.map(f => [f.name, f.type === 'checkbox' ? true : '']));

        if (!isEdit && title === 'Registro de asistencia' && attendanceMethods.length > 0) {
            const manualMethod = attendanceMethods.find(m => m.clave === 'MANUAL');
            if (manualMethod) {
                initialFormState['attendance_method_id'] = manualMethod.id;
            }
        }
        
        return initialFormState;
    };

    const { data, setData, errors, processing, post, put } = useForm<Record<string, FormValue>>(getInitialData());

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
                if (isEdit) {
                    window.location.href = `${urlView}?edit_success=true`;
                }
            },
            onError: (error) => {
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

    const selectedAttendanceMethodId = data['attendance_method_id'];
    const selectedMethod = attendanceMethods.find(m => String(m.id) === String(selectedAttendanceMethodId));
    const isManualMethod = selectedMethod?.clave === 'MANUAL';

    const conditionalFields = ['ip_address', 'qr_token', 'latitude', 'longitude'];

    const renderField = (field: FormField) => {
        const getFieldValue = (fieldName: string): string => {
            const value = data[fieldName];
            if (value === null || value === undefined) {
                return '';
            }

            const fieldType = fields.find(f => f.name === fieldName)?.type;

            if (fieldType === 'datetime-local') {
                return toDatetimeLocal(value as string);
            }
            if (fieldType === 'date') {
                return toDateInput(value as string);
            }
            return String(value);
        };

        const commonProps = {
            name: field.name,
            id: field.name,
            value: getFieldValue(field.name),
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const value = e.target.value;
                setData(field.name, value === '' ? null : value);
            },
            required: field.required,
            placeholder: field.placeholder,
        };

        switch (field.type) {
            case 'select':
                return (
                    <Select
                        name={field.name}
                        value={getFieldValue(field.name)}
                        onValueChange={(value) => setData(field.name, value)}
                        required={field.required}
                        disabled={field.readonly}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={field.placeholder || `Seleccione ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'textarea':
                return (
                    <Textarea
                        {...commonProps}
                        rows={4}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                        disabled={field.readonly}
                    />
                );

            case 'number':
                return (
                    <Input
                        {...commonProps}
                        type="number"
                        min={field.validation?.min}
                        max={field.validation?.max}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                        disabled={field.readonly}
                    />
                );

            case 'checkbox':
                return (
                    <Switch
                        checked={Boolean(data[field.name])}
                        onCheckedChange={(checked) => setData(field.name, checked)}
                        name={field.name}
                        id={field.name}
                        disabled={field.readonly}
                    />
                );

            case 'file':
                return (
                    <Input
                        type="file"
                        name={field.name}
                        id={field.name}
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files?.[0] || null;
                            setData(field.name, file);
                        }}
                        disabled={field.readonly}
                    />
                );

            case 'password':
                return (
                    <Input
                        {...commonProps}
                        type="password"
                        disabled={field.readonly}
                    />
                );

            case 'date': {
                const rawValue = data[field.name] as string | null;
                const dateValue = rawValue ? rawValue.split('T')[0] : null;
                const selected = dateValue ? new Date(`${dateValue}T00:00:00`) : undefined;

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !dateValue && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateValue ? format(selected!, 'PPP', { locale: es }) : <span>Seleccione una fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selected}
                                onSelect={(date) => setData(field.name, date ? format(date, 'yyyy-MM-dd') : null)}
                                initialFocus
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                );
            }

            case 'datetime-local': {
                const selectedDate = data[field.name] ? new Date(data[field.name] as string) : null;
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !selectedDate && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, 'PPP p', { locale: es }) : <span>Seleccione fecha y hora</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate || undefined}
                                onSelect={(date) => {
                                    const newDate = date ? new Date(date) : new Date();
                                    const currentVal = selectedDate || new Date();
                                    newDate.setHours(currentVal.getHours());
                                    newDate.setMinutes(currentVal.getMinutes());
                                    setData(field.name, format(newDate, "yyyy-MM-dd'T'HH:mm"));
                                }}
                                initialFocus
                                locale={es}
                            />
                            <div className="p-2 border-t border-border flex items-center justify-center gap-2">
                                <Select
                                    value={selectedDate ? String(selectedDate.getHours()).padStart(2, '0') : '00'}
                                    onValueChange={hour => {
                                        const newDate = selectedDate || new Date();
                                        newDate.setHours(parseInt(hour, 10));
                                        setData(field.name, format(newDate, "yyyy-MM-dd'T'HH:mm"));
                                    }}
                                >
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                :
                                <Select
                                    value={selectedDate ? String(selectedDate.getMinutes()).padStart(2, '0') : '00'}
                                    onValueChange={min => {
                                        const newDate = selectedDate || new Date();
                                        newDate.setMinutes(parseInt(min, 10));
                                        setData(field.name, format(newDate, "yyyy-MM-dd'T'HH:mm"));
                                    }}
                                >
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </PopoverContent>
                    </Popover>
                )
            }

            case 'time': {
                const timeValue = data[field.name] as string | null;
                const [hour, minute] = timeValue ? timeValue.split(':') : ['00', '00'];

                const handleTimeChange = (part: 'hour' | 'minute', value: string) => {
                    let newHour = hour;
                    let newMinute = minute;

                    if (part === 'hour') {
                        newHour = value;
                    } else {
                        newMinute = value;
                    }
                    setData(field.name, `${newHour}:${newMinute}`);
                };

                return (
                    <div className="flex items-center gap-2">
                        <Select
                            value={hour}
                            onValueChange={value => handleTimeChange('hour', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        :
                        <Select
                            value={minute}
                            onValueChange={value => handleTimeChange('minute', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )
            }

            case 'datetime':
                return (
                    <Input
                        {...commonProps}
                        type="datetime"
                    />
                );

            case 'text':
            case 'email':
                return (
                    <Input
                        {...commonProps}
                        type={field.type}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        pattern={field.validation?.pattern}
                        onChange={e => setData(field.name, e.target.value === '' ? null : e.target.value)}
                        disabled={field.readonly}
                    />
                );
                
            default:
                return (
                    <Input
                        {...commonProps}
                        type={field.type}
                        minLength={field.validation?.minLength}
                        maxLength={field.validation?.maxLength}
                        pattern={field.validation?.pattern}
                        disabled={field.readonly}
                    />
                );
        }
    };

    const checkboxFields = fields.filter(f => f.type === 'checkbox');
    const otherFields = fields.filter(f => f.type !== 'checkbox' && (!isManualMethod || !conditionalFields.includes(f.name)));

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
                    <div key={`${field.name}-${data[field.name]}`} className="flex flex-col">
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

                <div className="col-span-full flex justify-end gap-4 mt-6">
                    <SubmitButton
                        label="Cancelar"
                        type="button"
                        size="md"
                        variant="secondary"
                        onClick={handleCancel}
                    />
                    <SubmitButton
                        label={isEdit ? 'Actualizar' : 'Crear'}
                        type="button"
                        size="md"
                        variant="primary"
                        disabled={processing}
                        onClick={handleSubmit}
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateEditForm;