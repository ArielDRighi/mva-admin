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
import { createEmailSchema, createCUITSchema, createPhoneSchema } from "@/lib/formValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { processErrorForToast } from "@/lib/errorUtils";
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
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createClient,
  deleteClient,
  editClient,
  getClients,
} from "@/app/actions/clientes";
import { getServices } from "@/app/actions/services";

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
  const [isMounted, setIsMounted] = useState(false); // Estados para manejo de confirmación de eliminación
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);
  // Estados para el modal de visualización
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClientForView, setSelectedClientForView] =
    useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  // Estados para los servicios del cliente
  const [clientServices, setClientServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const createClientSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    cuit: createCUITSchema(),
    direccion: z.string().min(1, "La dirección es obligatoria"),
    telefono: createPhoneSchema(),
    email: createEmailSchema("Formato de email inválido, ejemplo: contacto@empresa.com"),
    contacto_principal: z.string().min(1, "El contacto es obligatorio"),
    contacto_principal_telefono: z.string().optional(),
    contactoObra1: z.string().optional(),
    contacto_obra1_telefono: z.string().optional(),
    contactoObra2: z.string().optional(),
    contacto_obra2_telefono: z.string().optional(),
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
      contacto_principal_telefono: "",
      contactoObra1: "",
      contacto_obra1_telefono: "",
      contactoObra2: "",
      contacto_obra2_telefono: "",
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
    // Solo actualizar el estado local, no la URL
    // La URL se actualizará cuando el debounce del ListadoTabla termine
    setSearchTerm(search);

    // Actualizar URL cuando llegue la llamada desde ListadoTabla (ya con debounce)
    const params = new URLSearchParams(searchParams.toString());

    if (!search || search.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", search);
    }

    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
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
      "contacto_principal_telefono",
      "contactoObra1",
      "contacto_obra1_telefono",
      "contactoObra2",
      "contacto_obra2_telefono",
      "estado",
    ];

    // Establecer todos los campos del formulario
    camposFormulario.forEach((key) => {
      setValue(key, cliente[key] || "");
    });
  };

  const handleViewClick = async (cliente: Cliente) => {
    setSelectedClientForView(cliente);
    setIsViewModalOpen(true);
    
    // Cargar los servicios próximos del cliente
    if (cliente.clienteId) {
      await loadClientServices(cliente.clienteId);
    }
  };

  const loadClientServices = async (clienteId: number) => {
    setLoadingServices(true);
    try {
      // Obtener servicios del cliente (filtrando por clienteId en el futuro)
      const result = await getServices(1, 50, ""); // Obtener más servicios para filtrar
      
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        // Filtrar servicios del cliente específico y próximos
        const today = new Date();
        const responseData = result as any;
        const services = responseData.data?.data || responseData.data?.items || responseData.data || [];
        
        const filteredServices = services.filter((service: any) => {
          const serviceDate = new Date(service.fechaProgramada);
          return service.clienteId === clienteId && serviceDate >= today;
        }).slice(0, 10); // Limitar a 10 próximos servicios
        
        setClientServices(filteredServices);
      } else {
        setClientServices([]);
        toast.error("Error al cargar los servicios del cliente");
      }
    } catch (error) {
      console.error("Error loading client services:", error);
      setClientServices([]);
      toast.error("Error al cargar los servicios del cliente");
    } finally {
      setLoadingServices(false);
    }
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
      contacto_principal_telefono: "",
      contactoObra1: "",
      contacto_obra1_telefono: "",
      contactoObra2: "",
      contacto_obra2_telefono: "",
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
      const errorConfig = processErrorForToast(error, 'eliminar cliente');
      
      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: errorConfig.duration,
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

      // Los datos ya vienen en el formato correcto del formulario
      const clientData = data;

      if (selectedClient && selectedClient.clienteId) {
        await editClient(selectedClient.clienteId.toString(), clientData);
        toast.success("Cliente actualizado", {
          description: "Los cambios se han guardado correctamente.",
          duration: 3000,
        });
      } else {
        await createClient(clientData);
        toast.success("Cliente creado", {
          description: "El cliente se ha agregado correctamente.",
          duration: 3000,
        });
      }

      await fetchClients();
      setIsCreating(false);
      setSelectedClient(null);
    } catch (error) {
      const errorConfig = processErrorForToast(
        error, 
        selectedClient ? 'actualizar cliente' : 'crear cliente'
      );
      
      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: errorConfig.duration,
      });
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
      const errorConfig = processErrorForToast(error, 'cargar clientes');
      
      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: errorConfig.duration,
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl md:text-2xl font-bold truncate">
              Gestión de Clientes
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              Administra la información de clientes de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto"
          >
            <UserPlus className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="todos" className="flex items-center">
                <UserCheck className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Todos</span>
                <span className="sm:hidden">Todo</span>
              </TabsTrigger>
              <TabsTrigger value="activo" className="flex items-center">
                <CheckCircle className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Activos</span>
                <span className="sm:hidden">Act.</span>
              </TabsTrigger>
              <TabsTrigger value="inactivo" className="flex items-center">
                <XCircle className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Inactivos</span>
                <span className="sm:hidden">Inac.</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>{" "}
      <CardContent className="p-4 md:p-6">
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
            searchValue={searchTerm}
            onSearchClear={handleClearSearch}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por nombre, CUIT, email, contacto o dirección... (presiona Enter)"
            columns={[
              { title: "Cliente", key: "cliente" },
              { title: "Contacto", key: "contacto", className: "hidden md:table-cell" },
              { title: "Información", key: "informacion", className: "hidden lg:table-cell" },
              { title: "Estado", key: "estado", className: "hidden sm:table-cell" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(cliente) => (
              <>
                <TableCell
                  className="min-w-[180px] md:min-w-[250px] cursor-pointer hover:bg-slate-50"
                  onClick={() => handleViewClick(cliente)}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm md:text-base truncate">{cliente.nombre}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CreditCard className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-muted-foreground" />
                          <span className="truncate">{cliente.cuit}</span>
                        </span>
                      </div>
                      {/* Información adicional en móvil */}
                      <div className="md:hidden text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div className="sm:hidden">
                          <Badge
                            variant={cliente.estado === "ACTIVO" ? "default" : "outline"}
                            className={`text-xs ${
                              cliente.estado === "ACTIVO"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cliente.estado === "ACTIVO" ? "Act." : "Inac."}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="truncate">{cliente.telefono}</span>
                        </div>
                        <div className="lg:hidden flex items-center">
                          <User2 className="h-3 w-3 mr-1" />
                          <span className="truncate">{cliente.contacto_principal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell
                  className="min-w-[200px] md:min-w-[220px] cursor-pointer hover:bg-slate-50 hidden md:table-cell"
                  onClick={() => handleViewClick(cliente)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate">{cliente.telefono}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell
                  className="min-w-[180px] lg:min-w-[200px] cursor-pointer hover:bg-slate-50 hidden lg:table-cell"
                  onClick={() => handleViewClick(cliente)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate">{cliente.contacto_principal}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate max-w-[150px]">
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

                <TableCell
                  className="cursor-pointer hover:bg-slate-50 hidden sm:table-cell"
                  onClick={() => handleViewClick(cliente)}
                >
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

                <TableCell className="flex flex-wrap gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(cliente);
                    }}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-0 md:mr-1" />
                    <span className="hidden md:inline">Editar</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cliente.clienteId) {
                        handleDeleteClick(cliente.clienteId.toString());
                      }
                    }}
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-0 md:mr-1" />
                    <span className="hidden md:inline">Eliminar</span>
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
        {" "}
        <div className="space-y-6">
          {/* Información de la Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller
              name="nombre"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Nombre de la Empresa"
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
          </div>

          <div className="grid grid-cols-1 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Controller
              name="telefono"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Teléfono de la Empresa"
                  name="telefono"
                  value={field.value?.toString() || ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Teléfono de la empresa"
                  helperText="Ingrese el teléfono en el formato que prefiera"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Email Corporativo"
                  name="email"
                  value={field.value?.toString() || ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="correo@ejemplo.com"
                />
              )}
            />
          </div>

          {/* Contacto Principal */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <User2 className="h-5 w-5 mr-2 text-green-600" />
              Contacto Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Controller
                name="contacto_principal"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Nombre y Apellido"
                    name="contacto_principal"
                    value={field.value?.toString() || ""}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Nombre completo del contacto"
                  />
                )}
              />
              <Controller
                name="contacto_principal_telefono"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Teléfono"
                    name="contacto_principal_telefono"
                    value={field.value?.toString() || ""}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    placeholder="Teléfono del contacto (opcional)"
                    helperText="Si no se especifica, se usará el teléfono de la empresa"
                  />
                )}
              />
            </div>
          </div>

          {/* Contactos de Obra */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-orange-600" />
              Contactos de Obra (Opcional)
            </h3>

            {/* Contacto de Obra #1 */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3 text-muted-foreground">
                Contacto de Obra #1
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Controller
                  name="contactoObra1"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Nombre y Apellido"
                      name="contactoObra1"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Nombre del contacto de obra"
                    />
                  )}
                />
                <Controller
                  name="contacto_obra1_telefono"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Teléfono"
                      name="contacto_obra1_telefono"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Teléfono del contacto"
                    />
                  )}
                />
              </div>
            </div>

            {/* Contacto de Obra #2 */}
            <div>
              <h4 className="text-md font-medium mb-3 text-muted-foreground">
                Contacto de Obra #2
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Controller
                  name="contactoObra2"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Nombre y Apellido"
                      name="contactoObra2"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Nombre del contacto de obra"
                    />
                  )}
                />
                <Controller
                  name="contacto_obra2_telefono"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Teléfono"
                      name="contacto_obra2_telefono"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      placeholder="Teléfono del contacto"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
          </div>
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
          </p>{" "}
          <p>¿Estás seguro de que deseas continuar?</p>
        </div>
      </FormDialog>
      {/* Modal para ver detalles completos del cliente */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Información Completa del Cliente
            </DialogTitle>
            <DialogDescription>
              Todos los detalles y contactos registrados
            </DialogDescription>
          </DialogHeader>

          {selectedClientForView && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    {selectedClientForView.nombre}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        selectedClientForView.estado === "ACTIVO"
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedClientForView.estado === "ACTIVO"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {selectedClientForView.estado}
                    </Badge>
                    {selectedClientForView.fecha_registro && (
                      <span className="text-sm text-muted-foreground">
                        Registrado el{" "}
                        {new Date(
                          selectedClientForView.fecha_registro
                        ).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tabs para organizar la información */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Información del Cliente</TabsTrigger>
                  <TabsTrigger value="services">Próximos Servicios</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de la Empresa */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-md mb-3 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-600" />
                        Información de la Empresa
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-xs uppercase font-medium text-muted-foreground">
                            CUIT
                          </h5>
                          <p className="text-sm font-medium mt-1 flex items-center">
                            <CreditCard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            {selectedClientForView.cuit}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs uppercase font-medium text-muted-foreground">
                            Dirección
                          </h5>
                          <p className="text-sm font-medium mt-1 flex items-start">
                            <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{selectedClientForView.direccion}</span>
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs uppercase font-medium text-muted-foreground">
                            Email Corporativo
                          </h5>
                          <p className="text-sm font-medium mt-1 flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            {selectedClientForView.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Contacto Principal */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-md mb-3 flex items-center">
                        <User2 className="h-4 w-4 mr-2 text-green-600" />
                        Contacto Principal
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <h5 className="text-xs uppercase font-medium text-muted-foreground">
                              Nombre y Apellido
                            </h5>
                            <p className="text-sm font-medium mt-1">
                              {selectedClientForView.contacto_principal}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs uppercase font-medium text-muted-foreground">
                              Teléfono
                            </h5>
                            <p className="text-sm font-medium mt-1 flex items-center">
                              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              {selectedClientForView.contacto_principal_telefono ||
                                "No especificado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Contactos de Obra */}
                  {(selectedClientForView.contactoObra1 ||
                    selectedClientForView.contacto_obra1_telefono ||
                    selectedClientForView.contactoObra2 ||
                    selectedClientForView.contacto_obra2_telefono) && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-md mb-3 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-orange-600" />
                        Contactos de Obra
                      </h4>
                      <div className="space-y-4">
                        {(selectedClientForView.contactoObra1 ||
                          selectedClientForView.contacto_obra1_telefono) && (
                          <div className="bg-slate-50 rounded-md border p-3">
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">
                              Contacto de Obra #1
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Nombre y Apellido
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  {selectedClientForView.contactoObra1 ||
                                    "No especificado"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Teléfono
                                </p>
                                <div className="flex items-center text-sm font-medium mt-1">
                                  <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  <span>
                                    {selectedClientForView.contacto_obra1_telefono ||
                                      "No especificado"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {(selectedClientForView.contactoObra2 ||
                          selectedClientForView.contacto_obra2_telefono) && (
                          <div className="bg-slate-50 rounded-md border p-3">
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">
                              Contacto de Obra #2
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Nombre y Apellido
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  {selectedClientForView.contactoObra2 ||
                                    "No especificado"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Teléfono
                                </p>
                                <div className="flex items-center text-sm font-medium mt-1">
                                  <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  <span>
                                    {selectedClientForView.contacto_obra2_telefono ||
                                      "No especificado"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="services" className="space-y-4 mt-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-md mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      Próximos Servicios Programados
                    </h4>
                    
                    {loadingServices ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Cargando servicios...
                        </span>
                      </div>
                    ) : clientServices.length > 0 ? (
                      <div className="space-y-3">
                        {clientServices.map((service: any, index: number) => (
                          <div key={service.id || index} className="bg-slate-50 rounded-md border p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Fecha Programada
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  {new Date(service.fechaProgramada).toLocaleDateString("es-AR", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Tipo de Servicio
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {service.tipoServicio}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Estado
                                </p>
                                <Badge 
                                  variant={service.estado === 'PROGRAMADO' ? 'default' : 'outline'}
                                  className="mt-1"
                                >
                                  {service.estado}
                                </Badge>
                              </div>
                            </div>
                            {service.ubicacion && (
                              <div className="mt-2">
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Ubicación
                                </p>
                                <p className="text-sm mt-1 flex items-start">
                                  <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <span>{service.ubicacion}</span>
                                </p>
                              </div>
                            )}
                            {service.notas && (
                              <div className="mt-2">
                                <p className="text-xs uppercase font-medium text-muted-foreground">
                                  Notas
                                </p>
                                <p className="text-sm mt-1 text-muted-foreground">
                                  {service.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No hay servicios próximos programados para este cliente.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="flex justify-between mt-6">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditClick(selectedClientForView);
                    }}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      if (selectedClientForView.clienteId) {
                        handleDeleteClick(
                          selectedClientForView.clienteId.toString()
                        );
                      }
                    }}
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
