"use client";

import {
  getInProgressServices,
  updateService,
  deleteService,
  changeServiceStatus,
} from "@/app/actions/services";
import { Service, UpdateServiceDto, ServiceState } from "@/types/serviceTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Loader from "../ui/local/Loader";
import { ListadoTabla } from "../ui/local/ListadoTabla";
import { TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserRound,
  Search,
  RefreshCcw,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  Calendar,
  Building,
  MapPin,
  ClipboardList,
  FileText,
  Plus,
} from "lucide-react";

export default function ListadoServiciosActivosComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Service[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Asegurarnos de que data siempre sea un array
  const safeData = Array.isArray(data) ? data : [];

  const [servicios, setServicios] = useState<Service[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");

  // Esquema de validación para la actualización de servicios
  const updateServiceSchema = z.object({
    clienteId: z.number().optional(),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    fechaProgramada: z.string().optional(),
    ubicacion: z.string().optional(),
    tipoServicio: z.string().optional(),
    notas: z.string().optional(),
    cantidadBanos: z.number().optional(),
    cantidadEmpleados: z.number().optional(),
    cantidadVehiculos: z.number().optional(),
    estado: z
      .enum([
        "PROGRAMADO",
        "EN_PROGRESO",
        "COMPLETADO",
        "CANCELADO",
        "SUSPENDIDO",
      ])
      .optional(),
  });

  const form = useForm({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      clienteId: undefined,
      fechaInicio: "",
      fechaFin: "",
      fechaProgramada: "",
      ubicacion: "",
      tipoServicio: "",
      notas: "",
      cantidadBanos: undefined,
      cantidadEmpleados: undefined,
      cantidadVehiculos: undefined,
      estado: "EN_PROGRESO" as ServiceState,
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleEditClick = (servicio: Service) => {
    setSelectedService(servicio);
    setIsCreating(false);

    reset({
      clienteId: servicio.clienteId,
      fechaInicio:
        servicio.fechaInicio instanceof Date
          ? servicio.fechaInicio.toISOString()
          : servicio.fechaInicio || undefined,
      fechaFin:
        servicio.fechaFin instanceof Date
          ? servicio.fechaFin.toISOString()
          : servicio.fechaFin || undefined,
      fechaProgramada:
        servicio.fechaProgramada instanceof Date
          ? servicio.fechaProgramada.toISOString()
          : servicio.fechaProgramada || undefined,
      ubicacion: servicio.ubicacion,
      tipoServicio: servicio.tipoServicio,
      notas: servicio.notas ?? undefined,
      cantidadBanos: servicio.cantidadBanos,
      cantidadEmpleados: servicio.cantidadEmpleados,
      cantidadVehiculos: servicio.cantidadVehiculos,
      estado: servicio.estado as ServiceState,
    });
  };

  const handleChangeStatus = async (id: number, estado: ServiceState) => {
    try {
      await changeServiceStatus(id, estado);
      toast.success("Estado actualizado", {
        description: `El servicio ha cambiado a estado ${estado}.`,
      });
      await fetchServicios();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      toast.error("Error", {
        description: "No se pudo cambiar el estado del servicio.",
      });
    }
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteService(id);
      toast.success("Servicio eliminado", {
        description: "El servicio se ha eliminado correctamente.",
      });
      await fetchServicios();
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      toast.error("Error", { description: "No se pudo eliminar el servicio." });
    }
  };

  const onSubmit = async (data: z.infer<typeof updateServiceSchema>) => {
    try {
      if (selectedService && selectedService.id) {
        await updateService(selectedService.id, data as UpdateServiceDto);
        toast.success("Servicio actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      }

      await fetchServicios();
      setIsCreating(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: "No se pudo actualizar el servicio.",
      });
    }
  };

  const fetchServicios = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedServices = await getInProgressServices();

      if (fetchedServices.items && Array.isArray(fetchedServices.items)) {
        setServicios(fetchedServices.items);
        setTotal(fetchedServices.total || 0);
        setPage(fetchedServices.page || 1);
      } else if (fetchedServices.data && Array.isArray(fetchedServices.data)) {
        setServicios(fetchedServices.data);
        setTotal(fetchedServices.totalItems || 0);
        setPage(fetchedServices.currentPage || 1);
      } else if (Array.isArray(fetchedServices)) {
        setServicios(fetchedServices);
        setTotal(fetchedServices.length);
        setPage(currentPage);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedServices);
      }
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los servicios.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchServicios();
    }
  }, [fetchServicios, isFirstLoad]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "default" | "outline" | "secondary" | "destructive"
    > = {
      PROGRAMADO: "outline",
      EN_PROGRESO: "default",
      COMPLETADO: "secondary",
      CANCELADO: "destructive",
      SUSPENDIDO: "outline",
    };
    return variants[status] || "outline";
  };

  const filteredServicios =
    activeTab === "todos"
      ? servicios
      : servicios.filter(
          (service) => service.estado === activeTab.toUpperCase()
        );

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Servicios Activos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra los servicios en progreso y programados
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push("/admin/dashboard/servicios/crear")}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-5 w-[600px]">
              <TabsTrigger value="todos" className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="en_progreso" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                En Progreso
              </TabsTrigger>
              <TabsTrigger value="programado" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Programados
              </TabsTrigger>
              <TabsTrigger value="suspendido" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Suspendidos
              </TabsTrigger>
              <TabsTrigger value="cancelado" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancelados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex justify-end mb-4">
          <Button
            onClick={fetchServicios}
            className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredServicios}
            itemsPerPage={itemsPerPage}
            searchableKeys={["ubicacion", "tipoServicio", "clienteId"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "ID", key: "id" },
              { title: "Cliente", key: "cliente.nombre" },
              { title: "Ubicación", key: "ubicacion" },
              { title: "Tipo", key: "tipoServicio" },
              { title: "Fecha inicio", key: "fechaInicio" },
              { title: "Fecha fin", key: "fechaFin" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(servicio) => (
              <>
                <TableCell className="font-medium">{servicio.id}</TableCell>
                <TableCell className="min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {servicio.cliente?.nombre ||
                          `Cliente ID: ${servicio.clienteId}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {servicio.fechaProgramada && (
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {new Date(
                              servicio.fechaProgramada
                            ).toLocaleDateString("es-AR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">
                      {servicio.ubicacion}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <ClipboardList className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{servicio.tipoServicio}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {servicio.fechaInicio && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {new Date(servicio.fechaInicio).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {servicio.fechaFin && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {new Date(servicio.fechaFin).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(servicio.estado)}
                    className={
                      servicio.estado === "EN_PROGRESO"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : servicio.estado === "SUSPENDIDO"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : servicio.estado === "PROGRAMADO"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : servicio.estado === "CANCELADO"
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {servicio.estado}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(servicio)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      servicio.id && handleDeleteClick(servicio.id)
                    }
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>

                  <div className="ml-1">
                    {servicio.estado === "EN_PROGRESO" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          servicio.id &&
                          handleChangeStatus(
                            servicio.id,
                            ServiceState.COMPLETADO
                          )
                        }
                        className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Completar
                      </Button>
                    )}

                    {servicio.estado === "EN_PROGRESO" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          servicio.id &&
                          handleChangeStatus(
                            servicio.id,
                            ServiceState.SUSPENDIDO
                          )
                        }
                        className="cursor-pointer ml-1"
                      >
                        <PauseCircle className="h-3.5 w-3.5 mr-1" />
                        Suspender
                      </Button>
                    )}
                  </div>
                </TableCell>
              </>
            )}
          />
        </div>
      </CardContent>

      <FormDialog
        open={selectedService !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedService(null);
          }
        }}
        title="Editar Servicio"
        description="Modifica la información del servicio seleccionado"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Controller
            name="clienteId"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Cliente ID"
                name="clienteId"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="tipoServicio"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Tipo de Servicio"
                name="tipoServicio"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaInicio"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de Inicio"
                name="fechaInicio"
                type="date"
                value={field.value ? field.value.split("T")[0] : ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaFin"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de Fin"
                name="fechaFin"
                type="date"
                value={field.value ? field.value.split("T")[0] : ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaProgramada"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha Programada"
                name="fechaProgramada"
                type="date"
                value={field.value ? field.value.split("T")[0] : ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="ubicacion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Ubicación"
                name="ubicacion"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="cantidadBanos"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Cantidad de Baños"
                name="cantidadBanos"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="cantidadEmpleados"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Cantidad de Empleados"
                name="cantidadEmpleados"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="cantidadVehiculos"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Cantidad de Vehículos"
                name="cantidadVehiculos"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="notas"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Notas/Observaciones"
                name="notas"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
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
                  { label: "Programado", value: "PROGRAMADO" },
                  { label: "En progreso", value: "EN_PROGRESO" },
                  { label: "Completado", value: "COMPLETADO" },
                  { label: "Cancelado", value: "CANCELADO" },
                  { label: "Suspendido", value: "SUSPENDIDO" },
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
