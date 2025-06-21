import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { Department } from '@/types/pages/department';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';

interface DepartmentsPageProps extends PageProps {
    departments: Department[];
    parents: { id: number; nombre: string }[];
    companies: { id: number; razon_social: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departamentos',
        href: '/departments',
    },
];

export default function Department() {
    const { props } = usePage<DepartmentsPageProps>();
    const { departments } = props;

    const routes = {
        export: '/departments/export',
        duplicate: '/departments/duplicate',
        delete: '/departments/bulk-delete',
        create: '/departments/create',
        show: '/departments/:id',
        edit: '/departments/:id/edit',
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
        data: departments,
        entityDisplayName: 'departamento',
        entityDisplayNamePlural: 'departamentos',
        routes,
    });

    const columns: Column<Department>[] = [
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
            key: 'codigo',
            header: 'Código',
            sortable: true,
        },
        {
            key: 'company_id',
            header: 'Compañía',
            sortable: true,
            render: (_, row) => row.company ? row.company.razon_social : '—',
        },
        {
            key: 'parent_id',
            header: 'Departamento Padre',
            sortable: true,
            render: (_, row) => row.parent ? row.parent.nombre : '—',
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
            <Head title="Departamentos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Departamentos"
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