import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { Shift } from '@/types/pages/shift';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';

interface ShiftsPageProps extends PageProps {
    shifts: Shift[];
    users: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Turnos',
        href: '/shifts',
    },
];

export default function Department() {
    const { props } = usePage<ShiftsPageProps>();
    const { shifts } = props;

    const routes = {
        export: '/shifts/export',
        duplicate: '/shifts/duplicate',
        delete: '/shifts/bulk-delete',
        create: '/shifts/create',
        show: '/shifts/:id',
        edit: '/shifts/:id/edit',
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
        data: shifts,
        entityDisplayName: 'turno',
        entityDisplayNamePlural: 'turnos',
        routes,
    });

    const columns: Column<Shift>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'nombre',
            header: 'Nombre',
            sortable: true,
        },
        {
            key: 'hora_inicio',
            header: 'Hora de Inicio',
            sortable: true,
        },
        {
            key: 'hora_fin',
            header: 'Hora de Fin',
            sortable: true,
        },
        {
            key: 'creado_por',
            header: 'Creado por',
            sortable: true,
            render: (_, row) => (row.created_by?.name || '—'),
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
            <Head title="Turnos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Turnos"
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