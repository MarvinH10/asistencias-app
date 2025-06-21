import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CreateEditForm from '@/components/ui/create-edit-form';
import type { FormField } from '@/types/components/ui/form';
import type { PageProps } from '@inertiajs/core';

interface AttendanceMethod {
    id: number;
    nombre: string;
    clave: string;
}

interface Props extends PageProps {
    title: string;
    urlView: string;
    breadcrumb?: string;
    fields: FormField[];
    attendanceMethods: AttendanceMethod[];
    users: { id: number; name: string }[];
}

export default function AttendanceRecordsCreate() {
    const { props } = usePage<Props>();
    const { title, urlView, breadcrumb, fields, attendanceMethods, users } = props;

    const fieldsWithOptions = fields.map(field => {
        if (field.name === 'user_id') {
            return { ...field, options: users.map(u => ({ value: String(u.id), label: u.name })) };
        }
        if (field.name === 'attendance_method_id') {
            return { ...field, options: attendanceMethods.map(a => ({ value: String(a.id), label: a.nombre })) };
        }
        return field;
    });

    return (
        <AppLayout>
            <Head title={`Crear ${title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <CreateEditForm
                    title={title}
                    urlView={urlView}
                    breadcrumb={breadcrumb}
                    initialData={null}
                    isEdit={false}
                    fields={fieldsWithOptions}
                    attendanceMethods={attendanceMethods}
                    className="p-4"
                />
            </div>
        </AppLayout>
    );
}
