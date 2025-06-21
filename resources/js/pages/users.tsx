import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { User } from '@/types/pages/user';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';
import { toast } from 'react-toastify';

interface UsersPageProps extends PageProps {
    users: User[];
    companies: { id: number; razon_social: string }[];
    departments: { id: number; nombre: string }[];
    positions: { id: number; nombre: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departamentos',
        href: '/users',
    },
];

export default function Users() {
    const { props } = usePage<UsersPageProps>();
    const { users } = props;

    const routes = {
        export: '/users/export',
        duplicate: '/users/duplicate',
        delete: '/users/bulk-delete',
        create: '/users/create',
        show: '/users/:id',
        edit: '/users/:id/edit',
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
        data: users,
        entityDisplayName: 'usuario',
        entityDisplayNamePlural: 'usuarios',
        routes,
        onSuccess: (action) => {
            if (action === 'delete') {
                router.reload({ only: ['user'] });
            } else if (action === 'duplicate') {
                router.reload({ only: ['user'] });
            }
        },
        onError: (action) => {
            let msg = 'Ocurrió un error.';
            if (action === 'export') msg = 'Error al exportar los usuarios';
            else if (action === 'duplicate') msg = 'Error al duplicar los usuarios';
            else if (action === 'delete') msg = 'Error al eliminar los usuarios';
            toast.error(msg);
        },
    });

    const columns: Column<User>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'name',
            header: 'Nombre',
            sortable: true,
        },
        {
            key: 'email',
            header: 'Email',
            sortable: true,
        },
        {
            key: 'company_id',
            header: 'Compañía',
            sortable: true,
            render: (_, row) => row.company ? row.company.razon_social : '—',
        },
        {
            key: 'department_id',
            header: 'Departamento',
            sortable: true,
            render: (_, row) => row.department ? row.department.nombre : '—',
        },
        {
            key: 'position_id',
            header: 'Cargo',
            sortable: true,
            render: (_, row) => row.position ? row.position.nombre : '—',
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
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Usuarios"
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