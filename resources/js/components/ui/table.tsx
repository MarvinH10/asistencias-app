import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowDownUp, ArrowUp, ArrowDown } from 'lucide-react';
import type { TableProps } from '@/types/components/ui/table';
import { useAppearance } from '@/hooks/use-appearance';

type SortConfig<T> = {
    key: keyof T;
    direction: 'desc' | 'asc';
};

function Table<T extends { id: string | number }>({
    columns,
    data,
    pageSize = 13,
    selectedRows,
    onSelectedRowsChange,
    onSelectAll,
    isAllSelected: propIsAllSelected,
    isIndeterminate: propIsIndeterminate,
    onVisibleIdsChange,
    onRowClick,
    isLoading = false,
}: TableProps<T> & { isLoading?: boolean }) {
    const [internalSelected, setInternalSelected] = useState<
        Set<string | number>
    >(new Set());
    const selected = selectedRows ?? internalSelected;
    const setSelected = onSelectedRowsChange ?? setInternalSelected;

    const [currentPage, setCurrentPage] = useState(1);
    const defaultSortKey = (columns.find(c => c.key === 'id')?.key as keyof T) ?? columns[0].key;
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: defaultSortKey, direction: 'desc' });

    const { appearance } = useAppearance();

    useEffect(() => {
        setCurrentPage(1);
        setSortConfig({ key: defaultSortKey, direction: 'desc' });
    }, [data, defaultSortKey]);

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        return sortedData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [sortedData, currentPage, pageSize]);

    const visibleIds = useMemo(() => {
        return paginatedData.map((row) => row.id);
    }, [paginatedData]);

    const memoizedOnVisibleIdsChange = useCallback(
        (ids: (string | number)[]) => {
            if (onVisibleIdsChange) {
                onVisibleIdsChange(ids);
            }
        },
        [onVisibleIdsChange]
    );

    useEffect(() => {
        memoizedOnVisibleIdsChange(visibleIds);
    }, [visibleIds, memoizedOnVisibleIdsChange]);

    const handleSort = (key: keyof T) => {
        if (isLoading) return;
        setSortConfig((current) => {
            if (current.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' };
        });
    };

    const toggleRowSelection = (id: string | number) => {
        if (isLoading) return;
        const newSet = new Set(selected);
        if (newSet.has(id)) {
            newSet.delete(id);
            setSelected(newSet);
        } else {
            newSet.add(id);
            setSelected(newSet);
        }
    };

    const goFirst = () => {
        if (isLoading) return;
        setCurrentPage(1);
    };

    const goLast = () => {
        if (isLoading) return;
        setCurrentPage(totalPages);
    };

    const toggleAllSelectionLocal = () => {
        if (isLoading) return;
        const visibleSelected = visibleIds.filter((id) => selected.has(id));

        if (
            visibleSelected.length === visibleIds.length &&
            selected.size > visibleIds.length
        ) {
            setSelected(new Set());
        } else if (visibleSelected.length === visibleIds.length) {
            const newSet = new Set(selected);
            visibleIds.forEach((id) => newSet.delete(id));
            setSelected(newSet);
        } else {
            const newSet = new Set(selected);
            visibleIds.forEach((id) => newSet.add(id));
            setSelected(newSet);
        }
    };

    const handleSelectAll = onSelectAll || toggleAllSelectionLocal;

    const visibleSelectedCount = visibleIds.filter((id) =>
        selected.has(id)
    ).length;

    const isAllSelected =
        propIsAllSelected !== undefined
            ? propIsAllSelected
            : visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;

    const isIndeterminate =
        propIsIndeterminate !== undefined
            ? propIsIndeterminate
            : visibleSelectedCount > 0 && visibleSelectedCount < visibleIds.length;

    return (
        <div className={`rounded-lg dark:bg-neutral-800`}>
            <div className="px-4 flex flex-wrap items-center justify-end gap-3 border-b border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-medium text-[#6a7282] whitespace-nowrap">
                    {isLoading ? "Cargando..." : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, sortedData.length)} de ${sortedData.length}`}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() =>
                            currentPage === 1
                                ? goLast()
                                : setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={totalPages <= 1 || isLoading}
                        className="p-1 cursor-pointer rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-default"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={() =>
                            currentPage === totalPages
                                ? goFirst()
                                : setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={totalPages <= 1 || isLoading}
                        className="p-1 cursor-pointer rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-default"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
            
            <div className={`overflow-x-auto border-b border-neutral-200 dark:border-neutral-700`}>
                <table className={`min-w-full divide-y ${appearance === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={`font-bold text-neutral-700 dark:text-neutral-100`}>
                        <tr>
                            <th className="px-4 py-3 text-left w-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isIndeterminate;
                                        }}
                                        onChange={handleSelectAll}
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={isLoading}
                                        className="sr-only peer"
                                    />
                                    <span className={`w-[16px] h-[16px] border border-gray-500 peer-checked:bg-gray-500 peer-checked:border-gray-500 peer-focus:ring-opacity-50 flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isAllSelected ? (
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="3"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        ) : isIndeterminate ? (
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="3"
                                                    d="M4 12h16"
                                                />
                                            </svg>
                                        ) : null}
                                    </span>
                                </label>
                            </th>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 text-left text-xs text-[#6a7282] uppercase tracking-wider ${col.sortable !== false && !isLoading
                                        ? "cursor-pointer hover:bg-gray-50"
                                        : isLoading ? "cursor-wait" : ""
                                        }`}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable !== false && (
                                            <span className="text-[#6a7282]">
                                                {sortConfig?.key === col.key
                                                    ? sortConfig.direction === "asc"
                                                        ? <ArrowUp className="w-3 h-3 inline" />
                                                        : <ArrowDown className="w-3 h-3 inline" />
                                                    : <ArrowDownUp className="w-3 h-3 inline" />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-100`}>
                        {isLoading ? (
                            <>
                                {[...Array(pageSize)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3">
                                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        </td>
                                        {columns.map((_, idx) => (
                                            <td key={idx} className="px-4 py-3">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-4 py-3 text-center text-sm text-neutral-400 dark:text-neutral-500">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => {
                                        if (onRowClick && !isLoading) {
                                            onRowClick(row);
                                        }
                                    }}
                                    className={`
                                        ${isLoading ? 'cursor-wait opacity-75' : 'cursor-pointer'}
                                        ${selected.has(row.id) ? "bg-gray-200 border-t border-b border-gray-300 dark:bg-neutral-700" : ""}
                                        hover:bg-neutral-100
                                        dark:hover:bg-neutral-800 dark:hover:text-neutral-100
                                    `}
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(row.id)}
                                                onChange={() => toggleRowSelection(row.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={isLoading}
                                                className="sr-only peer"
                                            />
                                            <span className={`w-[16px] h-[16px] border border-gray-500 peer-checked:bg-gray-500 peer-checked:border-gray-500 peer-focus:ring-opacity-50 flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {selected.has(row.id) && (
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="3"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </span>
                                        </label>
                                    </td>
                                    {columns.map((col, colIndex) => {
                                        const value = row[col.key];
                                        return (
                                            <td key={colIndex} className="px-4 py-3 text-sm">
                                                {col.render
                                                    ? col.render(value, row)
                                                    : React.isValidElement(value)
                                                        ? value
                                                        : value == null
                                                            ? ''
                                                            : typeof value === 'object'
                                                                ? JSON.stringify(value, null, 2)
                                                                : String(value)
                                                }
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Table;