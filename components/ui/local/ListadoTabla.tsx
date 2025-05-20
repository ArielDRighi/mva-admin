import { useMemo, useState, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationLocal } from "./PaginationLocal";

interface Column {
  title: string;
  key: string;
  className?: string;
}

interface ListadoTablaProps<T> {
  title?: string;
  data: T[];
  columns: Column[];
  renderRow: (item: T) => ReactNode;
  itemsPerPage?: number;
  searchableKeys?: (keyof T)[];
  remotePagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  addButton?: ReactNode;
}

export function ListadoTabla<T>({
  title = "Listado",
  data = [],
  columns,
  renderRow,
  itemsPerPage = 15,
  searchableKeys = [],
  remotePagination = false,
  totalItems,
  currentPage: externalPage,
  onPageChange,
  onSearchChange,
  onEdit,
  onDelete,
  addButton,
}: ListadoTablaProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = remotePagination ? externalPage ?? 1 : internalPage;

  const filteredData = useMemo(() => {
    if (remotePagination) return data;
    if (searchableKeys.length === 0 || searchTerm.trim() === "") return data;

    return data.filter((item) =>
      searchableKeys.some((key) => {
        const value = String(item[key] ?? "").toLowerCase();
        return value.includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, data, searchableKeys, remotePagination]);

  const totalPages = remotePagination
    ? Math.ceil((totalItems ?? 0) / itemsPerPage)
    : Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    if (remotePagination) return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage, remotePagination]);

  const handlePageChange = (page: number) => {
    if (remotePagination && onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  };

  return (
    <Card className="w-full shadow-md border @container">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4 flex-col lg:flex-row">
            <h2 className="text-xl font-semibold">{title}</h2>
            {addButton}
          </div>
          {searchableKeys.length > 0 && (
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </form>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.title}
                  </TableHead>
                ))}
                {(onEdit || onDelete) && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    {renderRow(item)}
                    {(onEdit || onDelete) && (
                      <TableCell className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 hover:underline"
                          >
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "¿Estás seguro que deseas eliminar este ítem?"
                                )
                              ) {
                                onDelete(item);
                              }
                            }}
                            className="text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center">
          <PaginationLocal
            total={totalPages}
            currentPage={currentPage}
            onChangePage={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
