import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CreateEditForm from '@/components/ui/create-edit-form';
import type { FormField } from '@/types/components/ui/form';
import type { PageProps } from '@inertiajs/core';

interface Props extends PageProps {
    id: number | string;
    title: string;
    urlView: string;
    breadcrumb?: string;
    fields: FormField[];
    companies: { id: number; razon_social: string }[];
    parents: { id: number; nombre: string }[];
    initialData: Record<string, string | number | boolean | null>;
}

export default function DepartmentsEdit() {
    const { props } = usePage<Props>();
    const { title, urlView, breadcrumb, fields, companies, parents, initialData } = props;

    return (
        <AppLayout>
            <Head title={`Editar ${title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <CreateEditForm
                    title={title}
                    urlView={urlView}
                    breadcrumb={breadcrumb}
                    initialData={initialData}
                    isEdit={true}
                    fields={[
                        ...fields.filter(f => f.name !== 'company_id' && f.name !== 'parent_id'),
                        {
                            name: 'company_id',
                            label: 'Compañía',
                            type: 'select',
                            required: true,
                            options: (companies ?? []).map(c => ({ value: String(c.id), label: c.razon_social })),
                        },
                        {
                            name: 'parent_id',
                            label: 'Departamento Padre',
                            type: 'select',
                            required: false,
                            options: (parents ?? []).map(p => ({ value: String(p.id), label: p.nombre })),
                        },
                    ]}
                    className="p-4"
                />
            </div>
        </AppLayout>
    );
}
