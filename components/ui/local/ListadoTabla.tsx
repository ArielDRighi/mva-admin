// components/ui/local/ListadoTabla.tsx
"use client";

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
}

export function ListadoTabla<T>({
  title = "Listado",
  data,
  columns,
  renderRow,
  itemsPerPage = 15,
  searchableKeys = [],
}: ListadoTablaProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (searchableKeys.length === 0 || searchTerm.trim() === "") return data;
    return data.filter((item) =>
      searchableKeys.some((key) => {
        const value = String(item[key] ?? "").toLowerCase();
        return value.includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, data, searchableKeys]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <Card className="w-full shadow-md border">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {searchableKeys.length > 0 && (
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="max-w-sm"
            />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={index}>{renderRow(item)}</TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
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
            onChangePage={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
