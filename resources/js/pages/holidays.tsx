import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { Holiday } from '@/types/pages/holiday';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface HolidaysPageProps extends PageProps {
    holidays: Holiday[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Feriados',
        href: '/holidays',
    },
];

export default function Holidays() {
    const { props } = usePage<HolidaysPageProps>();
    const { holidays } = props;

    const routes = {
        export: '/holidays/export',
        duplicate: '/holidays/duplicate',
        delete: '/holidays/bulk-delete',
        create: '/holidays/create',
        show: '/holidays/:id',
        edit: '/holidays/:id/edit',
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
        data: holidays,
        entityDisplayName: 'feriado',
        entityDisplayNamePlural: 'feriados',
        routes,
        onSuccess: (action) => {
            if (action === 'delete') {
                router.reload({ only: ['holidays'] });
            } else if (action === 'duplicate') {
                router.reload({ only: ['holidays'] });
            }
        },
        onError: (action) => {
            let msg = 'Ocurrió un error.';
            if (action === 'export') msg = 'Error al exportar los feriados';
            else if (action === 'duplicate') msg = 'Error al duplicar los feriados';
            else if (action === 'delete') msg = 'Error al eliminar los feriados';
            toast.error(msg);
        },
    });

    const columns: Column<Holiday>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'fecha',
            header: 'Fecha',
            sortable: true,
            render: (value) => new Date(value as string).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
        },
        {
            key: 'nombre',
            header: 'Nombre',
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
            <Head title="Feriados" />
            <ToastContainer />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Feriados"
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