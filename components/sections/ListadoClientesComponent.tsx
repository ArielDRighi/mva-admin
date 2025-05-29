"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { Cliente, ClienteFormulario } from "@/types/types";
import { TableCell } from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
  UserCheck,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Building,
  CreditCard,
  MapPin,
  User2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createClient,
  deleteClient,
  editClient,
  getClients,
} from "@/app/actions/clientes";

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

  const safeData = Array.isArray(data) ? data : [];

  const [clients, setClients] = useState<Cliente[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  // Añadir estado para controlar la hidratación
  const [isMounted, setIsMounted] = useState(false);
  // Estados para manejo de confirmación de eliminación
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);

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
        "Formato de teléfono incorrecto,ss debe ser xxx-xxxx-xxxx"
      )
      .or(z.string().regex(/^\d{10}$/, "Debe tener 12 dígitos, sin barras")),

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

    // Si no hay término de búsqueda, eliminar el parámetro
    if (!search || search.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", search);
    }

    // Siempre volver a la primera página al buscar
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };
  // Función auxiliar para quitar los guiones del número de teléfono
  /**
   * Quita todos los guiones de un número de teléfono
   * Se utiliza cuando cargamos el teléfono en el formulario de edición
   * para evitar problemas de formato
   */
  const stripPhoneFormat = (phone: string): string => {
    return phone ? phone.replace(/-/g, "") : "";
  };

  /**
   * Formatea un número de teléfono agregando guiones en el formato xxx-xxxx-xxxx
   * Se utiliza al guardar los datos para asegurar que el teléfono tenga el formato correcto
   * Convierte cualquier string de 11 dígitos al formato esperado
   */
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";

    // Quitar todos los guiones primero para asegurarnos de que no haya duplicados
    const cleaned = stripPhoneFormat(phone);

    // Si no tiene la longitud adecuada, devolver tal cual
    if (cleaned.length !== 11) return phone;

    // Formatear con guiones: xxx-xxxx-xxxx
    return `${cleaned.substring(0, 3)}-${cleaned.substring(
      3,
      7
    )}-${cleaned.substring(7)}`;
  };

  const handleEditClick = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setIsCreating(false);

    const camposFormulario: (keyof ClienteFormulario)[] = [
      "nombre",
      "cuit",
      "direccion",
      "email",
      "contacto_principal",
      "estado",
    ];

    // Establecer todos los campos excepto el teléfono que requiere procesamiento especial
    camposFormulario.forEach((key) => setValue(key, cliente[key]));

    // Manejar el teléfono de forma especial - quitar los guiones al cargar para editar
    setValue("telefono", stripPhoneFormat(cliente.telefono));
  };
  const handleCreateClick = () => {
    // Resetear el formulario con valores iniciales
    reset({
      nombre: "",
      cuit: "",
      direccion: "",
      telefono: "", // Teléfono vacío sin formato
      email: "",
      contacto_principal: "",
      estado: "ACTIVO",
    });
    setSelectedClient(null);
    setIsCreating(true);
  };
  // Esta función ahora solo muestra el diálogo de confirmación
  const handleDeleteClick = (id: string) => {
    setClienteToDelete(id);
    setConfirmDeleteDialogOpen(true);
  };

  // Función que realmente elimina después de la confirmación
  const confirmDelete = async () => {
    if (!clienteToDelete) return;

    try {
      setLoading(true);
      await deleteClient(clienteToDelete);

      toast.success("Cliente eliminado", {
        description: "El cliente se ha eliminado correctamente.",
        duration: 3000,
      });

      await fetchClients();
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);

      // Extraer el mensaje de error para mostrar información más precisa
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      toast.error("Error al eliminar cliente", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setConfirmDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  const onSubmit = async (data: z.infer<typeof createClientSchema>) => {
    try {
      setLoading(true);

      // Crear una copia de los datos para no modificar el objeto original
      const formattedData = {
        ...data,
        // Aplicar formato al teléfono antes de guardar
        telefono: formatPhoneNumber(data.telefono),
      };

      if (selectedClient && selectedClient.clienteId) {
        await editClient(selectedClient.clienteId.toString(), formattedData);
        toast.success("Cliente actualizado", {
          description: "Los cambios se han guardado correctamente.",
          duration: 3000,
        });
      } else {
        await createClient(formattedData);
        toast.success("Cliente creado", {
          description: "El cliente se ha agregado correctamente.",
          duration: 3000,
        });
      }

      await fetchClients();
      setIsCreating(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);

      // Extraer el mensaje de error para mostrar información más precisa
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      toast.error(
        selectedClient
          ? "Error al actualizar cliente"
          : "Error al crear cliente",
        {
          description: errorMessage,
          duration: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchClients = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedClients = (await getClients(
        currentPage,
        itemsPerPage,
        search
      )) as { items: Cliente[]; total: number; page: number };

      setClients(fetchedClients.items);
      setTotal(fetchedClients.total);
      setPage(fetchedClients.page);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);

      // Extraer el mensaje de error para mostrar información más precisa
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      toast.error("Error al cargar clientes", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  const filteredClients =
    activeTab === "todos"
      ? clients
      : clients.filter((client) => client.estado === activeTab.toUpperCase());
  // Utilizar useEffect para manejar la hidratación
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchClients();
    }
  }, [fetchClients, isFirstLoad]);

  // Activar el estado de montaje cuando el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  // Solo mostrar el contenido cuando el componente esté montado en el cliente
  // Esto previene problemas de hidratación
  if (!isMounted) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Gestión de Clientes
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra la información de clientes de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="todos" className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="activo" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Activos
              </TabsTrigger>
              <TabsTrigger value="inactivo" className="flex items-center">
                <XCircle className="mr-2 h-4 w-4" />
                Inactivos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>{" "}
      <CardContent className="p-6">
        <div className="rounded-md border">
          {" "}
          <ListadoTabla
            title=""
            data={filteredClients}
            itemsPerPage={itemsPerPage}
            searchableKeys={[
              "nombre",
              "cuit",
              "email",
              "contacto_principal",
              "direccion",
            ]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por nombre, CUIT, email, contacto o dirección..."
            columns={[
              { title: "Cliente", key: "cliente" },
              { title: "Contacto", key: "contacto" },
              { title: "Información", key: "informacion" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(cliente) => (
              <>
                <TableCell className="min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CreditCard className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {cliente.cuit}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[220px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{cliente.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{cliente.telefono}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{cliente.contacto_principal}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate max-w-[180px]">
                        {cliente.direccion}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {cliente.fecha_registro &&
                          new Date(cliente.fecha_registro).toLocaleDateString(
                            "es-AR"
                          )}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      cliente.estado === "ACTIVO" ? "default" : "outline"
                    }
                    className={
                      cliente.estado === "ACTIVO"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {cliente.estado}
                  </Badge>
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(cliente)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      cliente.clienteId &&
                      handleDeleteClick(cliente.clienteId.toString())
                    }
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>
                </TableCell>
              </>
            )}
          />
        </div>
      </CardContent>
      <FormDialog
        open={isCreating || selectedClient !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedClient(null);
          }
        }}
        title={selectedClient ? "Editar Cliente" : "Crear Cliente"}
        description={
          selectedClient
            ? "Modificar información del cliente en el sistema."
            : "Completa el formulario para registrar un nuevo cliente."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Controller
            name="nombre"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Nombre"
                name="nombre"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Nombre de la empresa"
              />
            )}
          />
          <Controller
            name="cuit"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="CUIT"
                name="cuit"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="xx-xxxxxxxx-x"
              />
            )}
          />
          <Controller
            name="direccion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Dirección"
                name="direccion"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Dirección completa"
              />
            )}
          />{" "}
          <Controller
            name="telefono"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Teléfono"
                name="telefono"
                value={field.value?.toString() || ""}
                onChange={(value) => {
                  // Permitir solo números para simplificar la validación
                  const numbersOnly = value.replace(/\D/g, "");
                  field.onChange(numbersOnly.substring(0, 11)); // Limitar a 11 dígitos
                }}
                error={fieldState.error?.message}
                placeholder="Ingrese solo números (sin guiones)"
                helperText="El formato xxx-xxxx-xxxx se aplicará automáticamente al guardar"
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Email"
                name="email"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="correo@ejemplo.com"
              />
            )}
          />
          <Controller
            name="contacto_principal"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Contacto Principal"
                name="contacto_principal"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Nombre del contacto"
              />
            )}
          />
          <Controller
            name="estado"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Estado"
                name="estado"
                fieldType="select"
                value={field.value || ""}
                onChange={(selectedValue: string) =>
                  field.onChange(selectedValue)
                }
                options={[
                  { label: "Activo", value: "ACTIVO" },
                  { label: "Inactivo", value: "INACTIVO" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>{" "}
      </FormDialog>
      {/* Diálogo de confirmación para eliminación */}
      <FormDialog
        open={confirmDeleteDialogOpen}
        submitButtonText="Eliminar"
        submitButtonVariant="destructive"
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDeleteDialogOpen(false);
            setClienteToDelete(null);
          }
        }}
        title="Confirmar eliminación"
        onSubmit={(e) => {
          e.preventDefault();
          confirmDelete();
        }}
      >
        <div className="space-y-4 py-4">
          <p className="text-destructive font-semibold">¡Atención!</p>
          <p>
            Esta acción eliminará permanentemente este cliente. Esta operación
            no se puede deshacer.
          </p>
          <p>¿Estás seguro de que deseas continuar?</p>
        </div>
      </FormDialog>
    </Card>
  );
}
