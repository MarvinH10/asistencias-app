import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { Company } from '@/types/pages/company';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CompaniesPageProps extends PageProps {
    companies: Company[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Compañias',
        href: '/companies',
    },
];

export default function Companies() {
    const { props } = usePage<CompaniesPageProps>();
    const { companies } = props;

    const routes = {
        export: '/companies/export',
        duplicate: '/companies/duplicate',
        delete: '/companies/bulk-delete',
        create: '/companies/create',
        show: '/companies/:id',
        edit: '/companies/:id/edit',
    };

    const {
        handleExport,
        handleDuplicate,
        handleDelete,
        handleRowClick,
        handleCreate,
        handleSelectAllPages,
        fetchData,
        DeleteConfirmationModal,
    } = useTableActions({
        data: companies,
        entityDisplayName: 'compañía',
        entityDisplayNamePlural: 'compañías',
        routes,
        onSuccess: (action) => {
            if (action === 'delete') {
                router.reload({ only: ['companies'] });
            } else if (action === 'duplicate') {
                router.reload({ only: ['companies'] });
            }
        },
        onError: (action) => {
            let msg = 'Ocurrió un error.';
            if (action === 'export') msg = 'Error al exportar las compañías';
            else if (action === 'duplicate') msg = 'Error al duplicar las compañías';
            else if (action === 'delete') msg = 'Error al eliminar las compañías';
            toast.error(msg);
        },
    });

    const columns: Column<Company>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'razon_social',
            header: 'Razón Social',
            sortable: true,
        },
        {
            key: 'ruc',
            header: 'RUC',
            sortable: true,
        },
        {
            key: 'estado',
            header: 'Estado',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {value ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Fecha Creación',
            sortable: true,
            render: (value) => new Date(value as string).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compañias" />
            <ToastContainer />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Compañías"
                    fetchData={fetchData}
                    columns={columns}
                    onExport={handleExport}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onSelectAllPages={handleSelectAllPages}
                    onRowClick={handleRowClick}
                    pageSize={13}
                    customActions={[
                        <Button
                            key="crear"
                            label="Nuevo"
                            type="button"
                            size="md"
                            variant="primary"
                            onClick={handleCreate}
                        />,
                    ]}
                />
                
                <DeleteConfirmationModal />
            </div>
        </AppLayout>
    );
}