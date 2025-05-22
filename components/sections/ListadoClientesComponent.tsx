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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onSubmit = async (data: z.infer<typeof createClientSchema>) => {
    try {
      if (selectedClient && selectedClient.clienteId) {
        await editClient(selectedClient.clienteId.toString(), data);
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

  const filteredClients =
    activeTab === "todos"
      ? clients
      : clients.filter((client) => client.estado === activeTab.toUpperCase());

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchClients();
    }
  }, [fetchClients, isFirstLoad]);

  if (loading) {
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
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredClients}
            itemsPerPage={itemsPerPage}
            searchableKeys={["nombre", "cuit", "email"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
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
          />

          <Controller
            name="telefono"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Teléfono"
                name="telefono"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: 123-4567-8901"
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
        </div>
      </FormDialog>
    </Card>
  );
}
