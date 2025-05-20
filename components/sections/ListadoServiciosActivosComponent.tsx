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
  console.log("Servicios:", servicios);

  // Esquema de validación para la actualización de servicios
  const updateServiceSchema = z.object({
    clienteId: z.number().optional(),
    // Update other field names to match API data
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
    // Remove fields not in API response or rename them
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

  return (
    <>
      <ListadoTabla
        title="Servicios Activos"
        data={Array.isArray(servicios) ? servicios : []}
        itemsPerPage={itemsPerPage}
        searchableKeys={["clienteId", "tipoServicio"]}
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
            <TableCell>
              {servicio.cliente?.nombre || servicio.clienteId}
            </TableCell>
            <TableCell>{servicio.ubicacion}</TableCell>
            <TableCell>{servicio.tipoServicio}</TableCell>
            <TableCell>
              {servicio.fechaInicio &&
                new Date(servicio.fechaInicio).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              {servicio.fechaFin &&
                new Date(servicio.fechaFin).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(servicio.estado)}>
                {servicio.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(servicio)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => servicio.id && handleDeleteClick(servicio.id)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
              {servicio.estado === "EN_PROGRESO" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    servicio.id &&
                    handleChangeStatus(servicio.id, ServiceState.COMPLETADO)
                  }
                  className="cursor-pointer"
                >
                  Completar
                </Button>
              )}
              {servicio.estado === "EN_PROGRESO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    servicio.id &&
                    handleChangeStatus(servicio.id, ServiceState.SUSPENDIDO)
                  }
                  className="cursor-pointer"
                >
                  Suspender
                </Button>
              )}
            </TableCell>
          </>
        )}
      />

      <FormDialog
        open={selectedService !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedService(null);
          }
        }}
        title="Editar Servicio"
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["clienteId", "Cliente ID"],
              ["cantidadBanos", "Cantidad de baños"],
              ["cantidadEmpleados", "Cantidad de empleados"],
              ["cantidadVehiculos", "Cantidad de vehículos"],
              ["ubicacion", "Ubicación"],
              ["fechaInicio", "Fecha de inicio"],
              ["fechaFin", "Fecha de fin"],
              ["fechaProgramada", "Fecha programada"],
              ["notas", "Notas/Observaciones"],
              ["tipoServicio", "Tipo de servicio"],
            ] as const
          ).map(([name, label]) => {
            // Handle number fields specifically
            if (
              name === "clienteId" ||
              name === "cantidadBanos" ||
              name === "cantidadEmpleados" ||
              name === "cantidadVehiculos"
            ) {
              return (
                <Controller
                  key={name}
                  name={name as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label={label}
                      name={name}
                      type="number"
                      value={field.value?.toString() || ""}
                      onChange={(value) => field.onChange(Number(value))}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              );
            }
            // Handle date fields
            else if (
              name === "fechaInicio" ||
              name === "fechaFin" ||
              name === "fechaProgramada"
            ) {
              return (
                <Controller
                  key={name}
                  name={name as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label={label}
                      name={name}
                      type="date"
                      value={field.value ? field.value.split("T")[0] : ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              );
            }
            // Handle text fields
            else {
              return (
                <Controller
                  key={name}
                  name={name as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label={label}
                      name={name}
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              );
            }
          })}
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
        </>
      </FormDialog>
    </>
  );
}
