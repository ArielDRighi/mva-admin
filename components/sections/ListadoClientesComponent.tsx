"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { Cliente, ClienteFormulario } from "@/types/types";
import { TableCell } from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import {
  createClient,
  getClients,
  deleteClient,
  editClient,
} from "@/app/actions/clientes";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createClientSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),

    cuit: z
      .string()
      .regex(
        /^\d{2}-\d{8}-\d$/,
        "Formato de CUIT incorrecto, debe ser xx-xxxxxxxx-x"
      )
      .or(z.string().regex(/^\d{11}$/, "Debe tener 11 dígitos, sin guiones")),

    direccion: z.string().min(1, "La dirección es obligatoria"),

    telefono: z
      .string()
      .regex(
        /^\d{3}-\d{4}-\d{4}$/,
        "Formato de teléfono incorrecto, debe ser xxx-xxxx-xxxx"
      )
      .or(z.string().regex(/^\d{12}$/, "Debe tener 12 dígitos, sin barras")),

    email: z
      .string()
      .regex(
        /^[^@]+@[^@]+\.[^@]+$/,
        "Formato de email inválido, ejemplo: contacto@empresa.com"
      ),

    contacto_principal: z.string().min(1, "El contacto es obligatorio"),

    estado: z.enum(["ACTIVO", "INACTIVO"], {
      errorMap: () => ({ message: "El estado es obligatorio" }),
    }),
  });

  const form = useForm<z.infer<typeof createClientSchema>>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      nombre: "",
      cuit: "",
      direccion: "",
      telefono: "",
      email: "",
      contacto_principal: "",
      estado: "ACTIVO",
    },
  });

  const { handleSubmit, setValue, control, reset } = form;

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
    setIsCreating(false);

    const camposFormulario: (keyof ClienteFormulario)[] = [
      "nombre",
      "cuit",
      "direccion",
      "telefono",
      "email",
      "contacto_principal",
      "estado",
    ];

    camposFormulario.forEach((key) => setValue(key, cliente[key]));
  };

  const handleCreateClick = () => {
    reset({
      nombre: "",
      cuit: "",
      direccion: "",
      telefono: "",
      email: "",
      contacto_principal: "",
      estado: "ACTIVO",
    });
    setSelectedClient(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteClient(id);
      toast.success("Cliente eliminado", {
        description: "El cliente se ha eliminado correctamente.",
      });
      await fetchClients();
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      toast.error("Error", { description: "No se pudo eliminar el cliente." });
    }
  };

  const onSubmit = async (data: z.infer<typeof createClientSchema>) => {
    try {
      if (selectedClient && selectedClient.clienteId) {
        await editClient(selectedClient.clienteId, data);
        toast.success("Cliente actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createClient(data);
        toast.success("Cliente creado", {
          description: "El cliente se ha agregado correctamente.",
        });
      }

      await fetchClients();
      setIsCreating(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedClient
          ? "No se pudo actualizar el cliente."
          : "No se pudo crear el cliente.",
      });
    }
  };

  const fetchClients = useCallback(async () => {
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
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
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
              {cliente.fecha_registro &&
                new Date(cliente.fecha_registro).toLocaleDateString("es-AR")}
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
                onClick={() =>
                  cliente.clienteId && handleDeleteClick(cliente.clienteId)
                }
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar cliente
          </Button>
        }
      />

      <FormDialog
        open={isCreating || selectedClient !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedClient(null);
          }
        }}
        title={selectedClient ? "Editar Cliente" : "Crear Cliente"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["nombre", "Nombre"],
              ["cuit", "CUIT"],
              ["direccion", "Dirección"],
              ["telefono", "Teléfono"],
              ["email", "Email"],
              ["contacto_principal", "Contacto Principal"],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label={label}
                  name={name}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          ))}

          {/* Campo para el estado */}
          <Controller
            name="estado"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Estado"
                name="estado"
                fieldType="select"
                value={field.value || ""} // Asegúrate de que sea un valor primitivo (cadena o número)
                onChange={(selectedValue: string) =>
                  field.onChange(selectedValue)
                } // Solo pasa el valor, no el objeto
                options={[
                  { label: "ACTIVO", value: "ACTIVO" },
                  { label: "INACTIVO", value: "INACTIVO" },
                ]}
                error={fieldState.error?.message} // Manejo de errores
              />
            )}
          />
        </>
      </FormDialog>
    </>
  );
}
