import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CreateEditForm from '@/components/ui/create-edit-form';
import type { FormField } from '@/types/components/ui/form';
import type { PageProps } from '@inertiajs/core';

interface Props extends PageProps {
    title: string;
    urlView: string;
    breadcrumb?: string;
    fields: FormField[];
    users: { id: number; name: string }[];
}

export default function ShiftsCreate() {
    const { props } = usePage<Props>();
    const { title, urlView, breadcrumb, fields, users } = props;

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
                    fields={[
                        ...fields.filter(f => f.name !== 'creado_por'),
                        {
                            name: 'creado_por',
                            label: 'Creado por',
                            type: 'select',
                            required: true,
                            options: (users ?? []).map(u => ({ value: String(u.id), label: u.name })),
                        },
                    ]}
                    className="p-4"
                />
            </div>
        </AppLayout>
    );
}
