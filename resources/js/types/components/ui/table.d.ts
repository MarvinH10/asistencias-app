import React from 'react';

export interface Column<T> {
    key: keyof T;
    header: string;
    render?: <K extends keyof T>(value: T[K], row: T) => React.ReactNode;
    sortable?: boolean;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    pageSize?: number;
    selectedRows?: Set<string | number>;
    onSelectedRowsChange?: (selected: Set<string | number>) => void;
    onSelectAll?: () => void;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
    onVisibleIdsChange?: (visibleIds: (string | number)[]) => void;
    onRowClick?: (row: T) => void;
}