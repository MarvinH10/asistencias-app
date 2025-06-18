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
}

export default function DepartmentsCreate() {
    const { props } = usePage<Props>();
    const { title, urlView, breadcrumb, fields } = props;

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
                    fields={fields}
                    className="p-4"
                />
            </div>
        </AppLayout>
    );
}
