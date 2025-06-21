import Table from '@/components/ui/table';
import type { Column } from '@/types/components/ui/table';
import { Cog, Copy, Download, Trash2, X } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

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
    data: T[];
    version?: string | null;
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

function renderValueToString(val: unknown): string {
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? 'Activo' : 'Inactivo';
    if (
        val &&
        typeof val === 'object' &&
        val !== null &&
        'props' in val &&
        typeof (val as { props?: unknown }).props === 'object' &&
        (val as { props?: { children?: unknown } }).props !== null &&
        'children' in (val as { props: { children?: unknown } }).props
    ) {
        const children = (val as { props: { children?: unknown } }).props.children;
        return renderValueToString(children);
    }
    if (Array.isArray(val)) return val.map(renderValueToString).join(' ');
    return '';
}

function PagesData<T extends { id: string | number }>({
    title,
    breadcrumb,
    data,
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
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [currentVisibleIds, setCurrentVisibleIds] = useState<(string | number)[]>([]);
    const [allPagesSelected, setAllPagesSelected] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState('');

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
        const visibleSelected = currentVisibleIds.filter((id) => selectedRows.has(id));

        if (visibleSelected.length === currentVisibleIds.length && selectedRows.size > currentVisibleIds.length) {
            setSelectedRows(new Set());
        } else if (visibleSelected.length === currentVisibleIds.length) {
            const newSelected = new Set(selectedRows);
            currentVisibleIds.forEach((id) => newSelected.delete(id));
            setSelectedRows(newSelected);
        } else {
            const newSelected = new Set(selectedRows);
            currentVisibleIds.forEach((id) => newSelected.add(id));
            setSelectedRows(newSelected);
        }
    };

    const visibleSelectedCount = currentVisibleIds.filter((id) => selectedRows.has(id)).length;
    const isAllVisibleSelected = currentVisibleIds.length > 0 && visibleSelectedCount === currentVisibleIds.length;
    const isIndeterminate = visibleSelectedCount > 0 && visibleSelectedCount < currentVisibleIds.length;
    const hasMoreData = data.length > pageSize;
    const shouldShowSelectAll = hasMoreData && isAllVisibleSelected && onSelectAllPages && !allPagesSelected;

    const filteredData = useMemo(() => {
        if (!search.trim() || data.length === 0) return data;
        const lower = search.toLowerCase();
        return data.filter((row: T) =>
            columns.some(col => {
                let value: unknown;
                if (col.render) {
                    value = col.render(
                        (row as Record<string, unknown>)[col.key as string] as T[keyof T],
                        row
                    );
                } else {
                    value = (row as Record<string, unknown>)[col.key as string];
                }
                return renderValueToString(value).toLowerCase().includes(lower);
            })
        );
    }, [data, search, columns]);

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
            <div className="-mb-3">
                <div className="-mb-1 text-center sm:text-left">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                        {breadcrumb && <div className="items-center text-sm text-[#6a7282]">{breadcrumb}</div>}
                    </div>
                    <div className="mt-1 flex items-center gap-2 sm:mt-1 xl:mt-0">
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
                
                <div className="mt-3 flex justify-left mb-6">
                    <Input
                        type="text"
                        placeholder="Escribe para buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:max-w-[300px]"
                    />
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                    {selectedRows.size > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mb-7">
                            {allPagesSelected ? (
                                <>
                                    <div className="flex items-center gap-3 rounded-sm border border-gray-600 bg-gray-200 px-3 py-[6.6px]">
                                        <span className="text-[14px] font-medium text-[#6a7282] whitespace-nowrap">Todos {data.length} seleccionados</span>
                                        <button
                                            onClick={handleClearSelection}
                                            className="cursor-pointer text-[#6a7282] hover:text-gray-800"
                                            aria-label="Clear selection"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 rounded-sm border border-gray-600 bg-gray-200 px-3 py-1.5">
                                        <span className="text-[14px] font-medium text-[#6a7282] whitespace-nowrap">
                                            {selectedRows.size} seleccionado{selectedRows.size > 1 ? 's' : ''}
                                        </span>
                                        {shouldShowSelectAll && (
                                            <button
                                                onClick={handleSelectAll}
                                                className="flex cursor-pointer items-center gap-1 rounded-sm bg-gray-500 px-3 py-[2px] text-[13px] font-medium text-white hover:bg-gray-600 whitespace-nowrap"
                                            >
                                                Seleccionar todos ({data.length})
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClearSelection}
                                            className="cursor-pointer text-[#6a7282] hover:text-gray-800"
                                            aria-label="Clear selection"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="relative inline-block" ref={actionsRef}>
                                <button
                                    onClick={() => setIsActionsOpen((prev) => !prev)}
                                    className={`flex cursor-pointer items-center gap-1 rounded-sm bg-gray-200 px-3 py-1.5 text-sm text-[#6a7282] hover:bg-gray-300 whitespace-nowrap ${isActionsOpen ? 'border border-gray-600' : 'border border-gray-200'}`}
                                >
                                    <Cog size={16} />
                                    Acciones
                                </button>
                                {isActionsOpen && (
                                    <div className="absolute -right-[95px] z-10 mt-2 w-48 rounded-sm border border-gray-300 bg-white shadow-lg">
                                        {onExport && (
                                            <button
                                                onClick={() => handleAction('export')}
                                                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-[#6a7282] hover:bg-gray-100"
                                            >
                                                <Download size={14} /> Exportar
                                            </button>
                                        )}
                                        {onDuplicate && (
                                            <button
                                                onClick={() => handleAction('duplicate')}
                                                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-[#6a7282] hover:bg-gray-100"
                                            >
                                                <Copy size={14} /> Duplicar
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => handleAction('delete')}
                                                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-[#6a7282] hover:bg-gray-100"
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
            </div>
            <Table
                key={JSON.stringify(data)}
                columns={columns}
                data={filteredData}
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
