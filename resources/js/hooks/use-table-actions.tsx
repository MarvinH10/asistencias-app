import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UseTableActionsProps<T extends { id: string | number }> {
    data: T[];
    entityDisplayName: string;
    entityDisplayNamePlural: string;
    routes: {
        export?: string;
        duplicate?: string;
        delete?: string;
        create?: string;
        show?: string;
        edit?: string;
    };
    onSuccess?: (action: string, selectedIds: (string | number)[]) => void;
    onError?: (action: string, error: unknown) => void;
}

interface DeleteConfirmationState {
    isOpen: boolean;
    selectedIds: (string | number)[];
    message: string;
    count: number;
}

export function useTableActions<T extends { id: string | number }>({
    data,
    entityDisplayName,
    entityDisplayNamePlural,
    routes,
    onSuccess,
    onError,
}: UseTableActionsProps<T>) {
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
        isOpen: false,
        selectedIds: [],
        message: '',
        count: 0,
    });

    const handleExport = useCallback((selectedIds: (string | number)[]) => {
        const url = `${routes.export}?ids[]=${selectedIds.join('&ids[]=')}`;
        window.open(url, '_blank');
        onSuccess?.('export', selectedIds);
    }, [onSuccess, routes.export]);

    const handleDuplicate = useCallback(async (selectedIds: (string | number)[]) => {
        try {
            if (routes.duplicate) {
                router.post(routes.duplicate, {
                    ids: selectedIds
                }, {
                    onSuccess: () => {
                        onSuccess?.('duplicate', selectedIds);
                    },
                    onError: (errors: Record<string, string>) => {
                        onError?.('duplicate', errors);
                    }
                });
            } else {
                console.error(`Ruta de duplicación no configurada para ${entityDisplayNamePlural}`);
            }
        } catch (error) {
            console.error(`Error duplicating ${entityDisplayNamePlural}:`, error);
            onError?.('duplicate', error);
        }
    }, [entityDisplayNamePlural, routes.duplicate, onSuccess, onError]);

    const handleDelete = useCallback(async (selectedIds: (string | number)[]) => {
        try {
            const count = selectedIds.length;
            let message: string;

            if (count === 1) {
                message = `¿Estás seguro de que quieres eliminar esta ${entityDisplayName}? Esta acción no se puede deshacer.`;
            } else {
                message = `¿Estás seguro de que quieres eliminar ${count} ${entityDisplayNamePlural}? Esta acción no se puede deshacer.`;
            }

            setDeleteConfirmation({
                isOpen: true,
                selectedIds,
                message,
                count,
            });
        } catch (error) {
            console.error(`Error deleting ${entityDisplayNamePlural}:`, error);
            onError?.('delete', error);
        }
    }, [entityDisplayName, entityDisplayNamePlural, onError]);

    const confirmDelete = useCallback(async () => {
        try {
            const { selectedIds } = deleteConfirmation;

            if (routes.delete) {
                router.delete(routes.delete, {
                    data: { ids: selectedIds },
                    onSuccess: () => {
                        onSuccess?.('delete', selectedIds);
                        setDeleteConfirmation({ isOpen: false, selectedIds: [], message: '', count: 0 });
                    },
                    onError: (errors: Record<string, string>) => {
                        onError?.('delete', errors);
                        setDeleteConfirmation({ isOpen: false, selectedIds: [], message: '', count: 0 });
                    }
                });
            } else {
                console.log(`Delete route not configured for ${entityDisplayNamePlural}`);
                setDeleteConfirmation({ isOpen: false, selectedIds: [], message: '', count: 0 });
            }
        } catch (error) {
            const count = deleteConfirmation.count;
            const errorMessage = count === 1
                ? `Error al eliminar 1 ${entityDisplayName}`
                : `Error al eliminar ${count} ${entityDisplayNamePlural}`;
            console.error(errorMessage);
            onError?.('delete', error);
            setDeleteConfirmation({ isOpen: false, selectedIds: [], message: '', count: 0 });
        }
    }, [deleteConfirmation, entityDisplayName, entityDisplayNamePlural, routes.delete, onSuccess, onError]);

    const cancelDelete = useCallback(() => {
        setDeleteConfirmation({ isOpen: false, selectedIds: [], message: '', count: 0 });
    }, []);

    const handleRowClick = useCallback((item: T) => {
        if (routes.edit) {
            router.visit(routes.edit.replace(':id', String(item.id)), {
                onError: (error) => {
                    console.error(`Error al acceder a la edición de ${entityDisplayName}`);
                    onError?.('edit', error);
                }
            });
        } else if (routes.show) {
            router.visit(routes.show.replace(':id', String(item.id)), {
                onError: (error) => {
                    console.error(`Error al acceder a los detalles de ${entityDisplayName}`);
                    onError?.('show', error);
                }
            });
        }
    }, [entityDisplayName, routes.edit, routes.show, onError]);

    const handleCreate = useCallback(() => {
        if (routes.create) {
            router.visit(routes.create, {
                onError: (error) => {
                    console.error(`Error al acceder a la creación de ${entityDisplayName}`);
                    onError?.('create', error);
                }
            });
        }
    }, [entityDisplayName, routes.create, onError]);

    const handleSelectAllPages = useCallback(async (): Promise<(string | number)[]> => {
        return data.map(item => item.id);
    }, [data]);

    const fetchData = useCallback(async (): Promise<T[]> => {
        return Promise.resolve(data || []);
    }, [data]);

    const DeleteConfirmationModal = useCallback(() => (
        <Dialog open={deleteConfirmation.isOpen} onOpenChange={cancelDelete}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        Confirmar eliminación
                        {deleteConfirmation.count > 0 && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                {deleteConfirmation.count}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {deleteConfirmation.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={confirmDelete}
                        className="sm:w-auto"
                    >
                        Eliminar {deleteConfirmation.count > 1 ? `(${deleteConfirmation.count})` : ''}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancelDelete}
                        className="sm:w-auto"
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ), [deleteConfirmation, confirmDelete, cancelDelete]);

    return {
        handleExport,
        handleDuplicate,
        handleDelete,
        handleRowClick,
        handleCreate,
        handleSelectAllPages,
        fetchData,
        DeleteConfirmationModal,
        deleteConfirmation,
    };
}