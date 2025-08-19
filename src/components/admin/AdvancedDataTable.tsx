/**
 * AdvancedDataTable Component
 * Table component with column selection, sorting, and pagination controls
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/src/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  Columns,
} from 'lucide-react';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  width?: string;
  hidden?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
}

interface AdvancedDataTableProps {
  title: string;
  description?: string;
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: React.ReactNode;
  pageSizeOptions?: number[];
  allowColumnToggle?: boolean;
}

export const AdvancedDataTable = ({
  title,
  description,
  columns: initialColumns,
  data,
  loading = false,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortColumn,
  sortDirection,
  actions,
  pageSizeOptions = [10, 20, 50, 100],
  allowColumnToggle = true,
}: AdvancedDataTableProps) => {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.filter(col => !col.hidden).map(col => col.key))
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Filter columns based on visibility
  const columns = useMemo(
    () => initialColumns.filter(col => visibleColumns.has(col.key)),
    [initialColumns, visibleColumns]
  );

  const handleSort = (column: string) => {
    if (!onSort) return;

    if (sortColumn === column) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column, newDirection);
    } else {
      onSort(column, 'asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className='h-4 w-4' />;
    return sortDirection === 'asc' ? (
      <ArrowUp className='h-4 w-4' />
    ) : (
      <ArrowDown className='h-4 w-4' />
    );
  };

  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (checked) {
      newVisibleColumns.add(columnKey);
    } else {
      newVisibleColumns.delete(columnKey);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const resetColumns = () => {
    setVisibleColumns(
      new Set(initialColumns.filter(col => !col.hidden).map(col => col.key))
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className='animate-pulse'>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-12 rounded bg-muted' />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className='flex items-center space-x-2'>
            {allowColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Columns className='mr-2 h-4 w-4' />
                    Colonnes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {initialColumns.map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumns.has(column.key)}
                      onCheckedChange={checked =>
                        handleColumnToggle(column.key, checked)
                      }
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetColumns}>
                    Réinitialiser
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {actions && <div className='flex space-x-2'>{actions}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead
                    key={column.key}
                    className={`${column.className || ''} ${
                      column.sortable ? 'cursor-pointer select-none hover:bg-muted' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className='flex items-center space-x-1'>
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='py-8 text-center'>
                    <div className='text-muted-foreground'>
                      Aucune donnée disponible
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={row.id || index}>
                    {columns.map(column => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className='flex items-center justify-between space-x-2 py-4'>
          <div className='flex items-center space-x-2'>
            <div className='text-sm text-muted-foreground'>
              Affichage de {startItem} à {endItem} sur {totalCount} résultats
            </div>
            {onPageSizeChange && (
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-muted-foreground'>Lignes par page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={value => onPageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <div className='flex items-center space-x-1'>
                <span className='text-sm'>Page</span>
                <Badge variant='outline'>
                  {currentPage} / {totalPages}
                </Badge>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
