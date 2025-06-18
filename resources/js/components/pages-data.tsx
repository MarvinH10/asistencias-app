import React, { useEffect, useState, useRef } from 'react';
import type { ReactNode, ReactElement, } from 'react';
import Table from '@/components/ui/table';
import type { Column } from '@/types/components/ui/table';
import { Download, Copy, Trash2, X, Cog } from 'lucide-react';

export type CustomAction =
    | {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
        className?: string;
    }
    | ReactElement;

interface PagesDataProps<T extends { id: string | number }> {
    title: string;
    breadcrumb?: ReactNode;
    fetchData: () => Promise<T[]>;
    columns: Column<T>[];
    onExport?: (selectedIds: (string | number)[]) => void;
    onDuplicate?: (selectedIds: (string | number)[]) => void;
    onDelete?: (selectedIds: (string | number)[]) => void;
    onSelectAllPages?: () => Promise<(string | number)[]>;
    pageSize?: number;
    onRowClick?: (row: T) => void;
    customActions?: CustomAction[];
    loading?: boolean;
}

function PagesData<T extends { id: string | number }>({
    title,
    breadcrumb,
    fetchData,
    columns,
    onExport,
    onDuplicate,
    onDelete,
    onSelectAllPages,
    pageSize = 13,
    onRowClick,
    loading = false,
    customActions = [],
}: PagesDataProps<T>) {
    const [data, setData] = useState<T[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [currentVisibleIds, setCurrentVisibleIds] = useState<(string | number)[]>([]);
    const [allPagesSelected, setAllPagesSelected] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData().then(setData);
    }, [fetchData]);

    useEffect(() => {
        setSelectedRows(new Set());
        setIsActionsOpen(false);
        setAllPagesSelected(false);
    }, [data]);

    useEffect(() => {
        if (data.length > 0 && selectedRows.size === data.length) {
            setAllPagesSelected(true);
        } else {
            setAllPagesSelected(false);
        }
    }, [selectedRows.size, data.length]);

    const handleAction = (action: 'export' | 'duplicate' | 'delete') => {
        const selectedIds = Array.from(selectedRows);
        if (action === 'export') onExport?.(selectedIds);
        if (action === 'duplicate') onDuplicate?.(selectedIds);
        if (action === 'delete') onDelete?.(selectedIds);
        setIsActionsOpen(false);
    };

    const handleSelectAll = async () => {
        if (shouldShowSelectAll && onSelectAllPages) {
            try {
                const allIds = await onSelectAllPages();
                setSelectedRows(new Set(allIds));
            } catch (error) {
                console.error('Error al seleccionar todos:', error);
            }
        }
    };

    const handleClearSelection = () => {
        setSelectedRows(new Set());
    };

    const handleTableHeaderSelect = () => {
        const visibleSelected = currentVisibleIds.filter(id => selectedRows.has(id));

        if (visibleSelected.length === currentVisibleIds.length && selectedRows.size > currentVisibleIds.length) {
            setSelectedRows(new Set());
        }
        else if (visibleSelected.length === currentVisibleIds.length) {
            const newSelected = new Set(selectedRows);
            currentVisibleIds.forEach(id => newSelected.delete(id));
            setSelectedRows(newSelected);
        }
        else {
            const newSelected = new Set(selectedRows);
            currentVisibleIds.forEach(id => newSelected.add(id));
            setSelectedRows(newSelected);
        }
    };

    const visibleSelectedCount = currentVisibleIds.filter(id => selectedRows.has(id)).length;
    const isAllVisibleSelected = currentVisibleIds.length > 0 && visibleSelectedCount === currentVisibleIds.length;
    const isIndeterminate = visibleSelectedCount > 0 && visibleSelectedCount < currentVisibleIds.length;
    const hasMoreData = data.length > pageSize;
    const shouldShowSelectAll = hasMoreData && isAllVisibleSelected && onSelectAllPages && !allPagesSelected;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
                setIsActionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <section>
            <div className="mb-4">
                <div className="text-center sm:text-left -mb-1">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                        {breadcrumb && (
                            <div className="text-sm text-[#6a7282] items-center">
                                {breadcrumb}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex justify-center mt-1">
                        {selectedRows.size > 0 && (
                            <div className="flex items-center gap-3">
                                {allPagesSelected ? (
                                    <>
                                        <div className="bg-gray-200 border border-gray-600 rounded-sm flex items-center gap-3 px-3 py-[6.6px]">
                                            <span className="text-[#6a7282] text-[14px] font-medium">
                                                Todos {data.length} seleccionados
                                            </span>
                                            <button
                                                onClick={handleClearSelection}
                                                className="text-[#6a7282] hover:text-gray-800 cursor-pointer"
                                                aria-label="Clear selection"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gray-200 border border-gray-600 rounded-sm flex items-center gap-3 px-3 py-1.5">
                                            <span className="text-[#6a7282] text-[14px] font-medium">
                                                {selectedRows.size} seleccionado{selectedRows.size > 1 ? 's' : ''}
                                            </span>
                                            {shouldShowSelectAll && (
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="flex cursor-pointer items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-[2px] rounded-sm text-[13px] font-medium"
                                                >
                                                    Seleccionar todos ({data.length})
                                                </button>
                                            )}
                                            <button
                                                onClick={handleClearSelection}
                                                className="text-[#6a7282] hover:text-gray-800 cursor-pointer"
                                                aria-label="Clear selection"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </>
                                )}

                                <div className="relative inline-block" ref={actionsRef}>
                                    <button
                                        onClick={() => setIsActionsOpen(prev => !prev)}
                                        className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-sm text-[#6a7282] text-sm bg-gray-200 hover:bg-gray-300 \
                                            ${isActionsOpen ? 'border border-gray-600' : 'border border-gray-200'}`}
                                    >
                                        <Cog size={16} />
                                        Acciones
                                    </button>
                                    {isActionsOpen && (
                                        <div className="absolute -right-[95px] mt-2 w-48 bg-white shadow-lg rounded-sm border border-gray-300 z-10">
                                            {onExport && (
                                                <button
                                                    onClick={() => handleAction('export')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-left text-[#6a7282] cursor-pointer"
                                                >
                                                    <Download size={14} /> Exportar
                                                </button>
                                            )}
                                            {onDuplicate && (
                                                <button
                                                    onClick={() => handleAction('duplicate')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-left text-[#6a7282] cursor-pointer"
                                                >
                                                    <Copy size={14} /> Duplicar
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => handleAction('delete')}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-left text-[#6a7282] cursor-pointer"
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 sm:mt-1 xl:mt-0">
                        {customActions.map((action, idx) => {
                            if (React.isValidElement(action)) {
                                return React.cloneElement(action, { key: idx });
                            }
                            const { label, icon, onClick, className } = action as Exclude<CustomAction, ReactElement>;
                            return (
                                <button key={idx} onClick={onClick} className={className}>
                                    {icon}
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Table
                columns={columns}
                data={data}
                pageSize={pageSize}
                selectedRows={selectedRows}
                onSelectedRowsChange={setSelectedRows}
                onSelectAll={handleTableHeaderSelect}
                isAllSelected={isAllVisibleSelected}
                isIndeterminate={isIndeterminate}
                onVisibleIdsChange={setCurrentVisibleIds}
                onRowClick={onRowClick}
                isLoading={loading}
            />
        </section>
    );
}

export default PagesData;
