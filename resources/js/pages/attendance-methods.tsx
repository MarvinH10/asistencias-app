import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { AttendanceMethod } from '@/types/pages/attendance-method';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';
import { toast } from 'react-toastify';

interface AttendanceMethodsPageProps extends PageProps {
    attendanceMethods: AttendanceMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Métodos de Marcado',
        href: '/attendance-methods',
    },
];

export default function AttendanceMethods() {
    const { props } = usePage<AttendanceMethodsPageProps>();
    const { attendanceMethods } = props;

    const routes = {
        export: '/attendance-methods/export',
        duplicate: '/attendance-methods/duplicate',
        delete: '/attendance-methods/bulk-delete',
        create: '/attendance-methods/create',
        show: '/attendance-methods/:id',
        edit: '/attendance-methods/:id/edit',
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
        data: attendanceMethods,
        entityDisplayName: 'método de marcado',
        entityDisplayNamePlural: 'métodos de marcado',
        routes,
        onSuccess: (action) => {
            if (action === 'delete') {
                router.reload({ only: ['attendance-methods'] });
            } else if (action === 'duplicate') {
                router.reload({ only: ['attendance-methods'] });
            }
        },
        onError: (action) => {
            let msg = 'Ocurrió un error.';
            if (action === 'export') msg = 'Error al exportar los métodos de marcado';
            else if (action === 'duplicate') msg = 'Error al duplicar los métodos de marcado';
            else if (action === 'delete') msg = 'Error al eliminar los métodos de marcado';
            toast.error(msg);
        },
    });

    const columns: Column<AttendanceMethod>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'clave',
            header: 'Clave',
            sortable: true,
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
            <Head title="Métodos de Marcado" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Métodos de Marcado"
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