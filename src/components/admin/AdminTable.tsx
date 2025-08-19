/**
 * AdminTable Component
 * Generic table component with pagination and sorting for admin interface
 */

'use client';

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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  className?: string;
}

interface AdminTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: React.ReactNode;
}

export const AdminTable = ({
  title,
  description,
  columns,
  data,
  loading = false,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  actions,
}: AdminTableProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

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
          {actions && <div className='flex space-x-2'>{actions}</div>}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between space-x-2 py-4'>
            <div className='text-sm text-muted-foreground'>
              Affichage de {startItem} à {endItem} sur {totalCount} résultats
            </div>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
