"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/types/types";
import { TableCell } from "../ui/table";
import { useEffect, useState } from "react";
import { getClients } from "@/app/actions/clientes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Usamos sonner para los toasts
import { deleteClient, editClient } from "@/app/actions/clientes"; // Si no lo tenías, lo agregamos
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Label } from "../ui/label";

export default function ListadoClientesComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Cliente[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clients, setClients] = useState<Cliente[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);

  // Estado para manejar el cliente seleccionado y el diálogo
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Cliente | null>(null);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`?${params.toString()}`);
  };

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", search);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleEditClick = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setFormData(cliente);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = "name" in e ? e : e.target; // Esto maneja ambos casos
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteClient(id);
      toast.success("Cliente eliminado", {
        description: "El cliente se ha eliminado correctamente.",
      });
      // Recarga los clientes después de eliminar
      setClients(clients.filter((client) => client.clienteId !== id));
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el cliente.",
      });
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData) return;

    try {
      await editClient(formData.clienteId, formData);
      toast.success("Cliente actualizado", {
        description: "Los cambios se han guardado correctamente.",
      });
      setSelectedClient(null);

      setClients((prev) =>
        prev.map((client) =>
          client.clienteId === formData.clienteId ? formData : client
        )
      );
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el cliente.",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const currentPage = Number(searchParams.get("page")) || 1;
      const search = searchParams.get("search") || "";

      setLoading(true);

      try {
        const fetchedClients = await getClients(
          currentPage,
          itemsPerPage,
          search
        );
        setClients(fetchedClients.items);
        setTotal(fetchedClients.total);
        setPage(fetchedClients.page);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, itemsPerPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!clients || clients.length === 0) {
    return <div>No hay clientes disponibles.</div>;
  }

  return (
    <>
      <ListadoTabla
        title="Listado de Clientes"
        data={clients}
        itemsPerPage={itemsPerPage}
        searchableKeys={["nombre", "cuit", "email"]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "Nombre", key: "nombre" },
          { title: "CUIT", key: "cuit" },
          { title: "Dirección", key: "direccion" },
          { title: "Teléfono", key: "telefono" },
          { title: "Email", key: "email" },
          { title: "Contacto", key: "contacto_principal" },
          { title: "Registro", key: "fecha_registro" },
          { title: "Estado", key: "estado" },
          { title: "Acciones", key: "acciones" },
        ]}
        renderRow={(cliente) => (
          <>
            <TableCell className="font-medium">{cliente.nombre}</TableCell>
            <TableCell>{cliente.cuit}</TableCell>
            <TableCell>{cliente.direccion}</TableCell>
            <TableCell>{cliente.telefono}</TableCell>
            <TableCell>{cliente.email}</TableCell>
            <TableCell>{cliente.contacto_principal}</TableCell>
            <TableCell>
              {new Date(cliente.fecha_registro).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              <Badge
                variant={cliente.estado === "ACTIVO" ? "default" : "outline"}
              >
                {cliente.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(cliente)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(cliente.clienteId)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
      />

      {/* Diálogo de edición */}
      <Dialog
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Editá los datos del cliente y guardá los cambios.
            </DialogDescription>
          </DialogHeader>

          {selectedClient ? (
            <form className="space-y-4 mt-4" onSubmit={handleEditSubmit}>
              <div>
                <Label htmlFor="nombre" className="block font-medium">
                  Nombre:
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData?.nombre || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cuit" className="block font-medium">
                  CUIT:
                </Label>
                <Input
                  id="cuit"
                  name="cuit"
                  value={formData?.cuit || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="direccion" className="block font-medium">
                  Dirección:
                </Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData?.direccion || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefono" className="block font-medium">
                  Teléfono:
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData?.telefono || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="block font-medium">
                  Email:
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData?.email || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="contacto_principal"
                  className="block font-medium"
                >
                  Contacto Principal:
                </Label>
                <Input
                  id="contacto_principal"
                  name="contacto_principal"
                  value={formData?.contacto_principal || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fecha_registro" className="block font-medium">
                  Fecha de Registro:
                </Label>
                <Input
                  id="fecha_registro"
                  name="fecha_registro"
                  type="date"
                  value={
                    formData?.fecha_registro
                      ? formData.fecha_registro.slice(0, 10)
                      : ""
                  }
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="estado" className="block font-medium">
                  Estado:
                </Label>
                <Select
                  value={formData?.estado || ""}
                  onValueChange={(value) =>
                    handleChange({ name: "estado", value })
                  }
                  required
                >
                  <SelectTrigger>
                    <span>{formData?.estado || "Seleccionar Estado"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                    <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div>No hay datos disponibles.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
