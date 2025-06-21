import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import PagesData from '@/components/pages-data';
import type { Column } from '@/types/components/ui/table';
import type { PageProps } from '@inertiajs/core';
import type { AttendanceRecord } from '@/types/pages/attendance-record';
import { useTableActions } from '@/hooks/use-table-actions';
import Button from '@/components/ui/button-create-edit-form';

interface AttendanceRecordsPageProps extends PageProps {
    attendanceRecords: AttendanceRecord[];
    users: { id: number; name: string }[];
    attendanceMethods: { id: number; nombre: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Registros de Asistencia',
        href: '/attendance-records',
    },
];

export default function AttendanceRecords() {
    const { props } = usePage<AttendanceRecordsPageProps>();
    const { attendanceRecords } = props;

    const routes = {
        export: '/attendance-records/export',
        duplicate: '/attendance-records/duplicate',
        delete: '/attendance-records/bulk-delete',
        create: '/attendance-records/create',
        show: '/attendance-records/:id',
        edit: '/attendance-records/:id/edit',
    };

    const {
        handleExport,
        handleDuplicate,
        handleDelete,
        handleRowClick,
        handleCreate,
        handleSelectAllPages,
        DeleteConfirmationModal,
    } = useTableActions({
        data: attendanceRecords,
        entityDisplayName: 'registro de asistencia',
        entityDisplayNamePlural: 'registros de asistencia',
        routes,
    });

    const columns: Column<AttendanceRecord>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
        },
        {
            key: 'user_id',
            header: 'Usuario',
            sortable: true,
            render: (_, row) => row.user ? row.user.name : '—',
        },
        {
            key: 'attendance_method_id',
            header: 'Método de Marcado',
            sortable: true,
            render: (_, row) => {
                const r = row as AttendanceRecord & { attendance_method?: { nombre: string } };
                return r.attendanceMethod?.nombre || r.attendance_method?.nombre || '—';
            },
        },
        {
            key: 'timestamp',
            header: 'Fecha y Hora',
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
        {
            key: 'status',
            header: 'Tipo de registro',
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
            <Head title="Registros de Asistencia" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PagesData
                    title="Registros de Asistencia"
                    data={attendanceRecords}
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