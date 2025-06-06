"use client";

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { type Language, type Pagination } from "@/hooks/use-languages"; // Imported types

interface LanguagesTableProps {
  // These props will be replaced by data from useLanguages hook
  data: Language[];
  pagination: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: string, sortOrder?: 'asc' | 'desc') => void; // Updated to allow undefined for clearing sort
  onEdit: (language: Language) => void;
  onDelete: (language: Language) => void; // This will trigger a confirmation
}

export function LanguagesTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onSortChange,
  onEdit,
  onDelete,
}: LanguagesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({}); // If row selection is needed

  // Columns Definition
  const columns: ColumnDef<Language>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const currentSort = column.getIsSorted();
              let newSortOrder: 'asc' | 'desc' | undefined;
              if (currentSort === "asc") {
                newSortOrder = "desc";
              } else if (currentSort === "desc") {
                newSortOrder = undefined; // Clear sort
              } else {
                newSortOrder = "asc";
              }
              onSortChange(column.id, newSortOrder);
              // No longer calling column.toggleSorting() directly here as manualSorting is true
              // The sorting state will be updated via props from the parent.
            }}
          >
            Name
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const currentSort = column.getIsSorted();
              let newSortOrder: 'asc' | 'desc' | undefined;
              if (currentSort === "asc") {
                newSortOrder = "desc";
              } else if (currentSort === "desc") {
                newSortOrder = undefined; // Clear sort
              } else {
                newSortOrder = "asc";
              }
              onSortChange(column.id, newSortOrder);
            }}
          >
            Code
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("code")}</div>,
    },
    {
      accessorKey: "flagUrl",
      header: "Flag",
      cell: ({ row }) => {
        const flagUrl = row.getValue("flagUrl") as string | undefined | null;
        return flagUrl ? (
          <img src={flagUrl} alt={row.original.name} className="h-6 w-10 object-contain" />
        ) : (
          <span>-</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(row.original)}
            // disabled={deleteMutation.isPending} // Assuming a delete mutation from a hook
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
    manualFiltering: true, // Server-side filtering
    pageCount: pagination.totalPages,
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearchChange]);

  if (isLoading && !data.length) {
    return <div>Loading table data...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search languages (name or code)..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
        {/* Future: Dropdown for column visibility, etc. */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} records)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
         <select
            value={pagination.limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
            }}
            className="p-2 border rounded text-sm"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
      </div>
    </div>
  );
}
