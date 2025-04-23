"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { PaginationLocal } from "../ui/local/PaginationLocal";

type Cliente = {
  clienteId: number;
  nombre: string;
  cuit: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto_principal: string;
  fecha_registro: string;
  estado: "ACTIVO" | "INACTIVO" | string;
};

interface ListadoClientesComponentProps {
  data: Cliente[];
  itemsPerPage?: number;
}

export default function ListadoClientesComponent({
  data,
  itemsPerPage = 15,
}: ListadoClientesComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cuit.includes(searchTerm) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <Card className="w-full shadow-md border">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold">Listado de Clientes</h2>
          <Input
            type="text"
            placeholder="Buscar por nombre, CUIT o email"
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((cliente) => (
                  <TableRow key={cliente.clienteId}>
                    <TableCell className="font-medium">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell>{cliente.cuit}</TableCell>
                    <TableCell>{cliente.direccion}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.contacto_principal}</TableCell>
                    <TableCell>
                      {new Date(cliente.fecha_registro).toLocaleDateString(
                        "es-AR"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cliente.estado === "ACTIVO" ? "default" : "outline"
                        }
                      >
                        {cliente.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
            onChangePage={(page: number) => setCurrentPage(page)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
