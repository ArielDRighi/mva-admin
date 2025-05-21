"use client";
import {
  completarMantenimientoVehiculo,
  createMantenimientoVehiculo,
  deleteMantenimientoVehiculo,
  editMantenimientoVehiculo,
  getMantenimientosVehiculos,
} from "@/app/actions/mantenimiento_vehiculos";
import {
  VehicleMaintenance,
  CreateVehicleMaintenance,
  UpdateVehicleMaintenance,
} from "@/types/types";
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
import { VehiculoSelector } from "../ui/local/SearchSelector/Selectors/VehiculoSelector";

const MantenimientoVehiculosComponent = ({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: VehicleMaintenance[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mantenimientos, setMantenimientos] =
    useState<VehicleMaintenance[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMantenimiento, setSelectedMantenimiento] =
    useState<VehicleMaintenance | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const mantenimientoSchema = z.object({
    vehiculoId: z.number({
      required_error: "El vehículo es obligatorio",
      invalid_type_error: "El ID del vehículo debe ser un número",
    }),
    fechaMantenimiento: z
      .string()
      .min(1, "La fecha de mantenimiento es obligatoria"),
    tipoMantenimiento: z.enum(["Preventivo", "Correctivo"], {
      errorMap: () => ({
        message:
          "El tipo de mantenimiento debe ser 'Preventivo' o 'Correctivo'",
      }),
    }),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    costo: z
      .number({
        required_error: "El costo es obligatorio",
        invalid_type_error: "El costo debe ser un número",
      })
      .nonnegative("El costo no puede ser negativo"),
    proximoMantenimiento: z.string().optional(),
  });

  const form = useForm<z.infer<typeof mantenimientoSchema>>({
    resolver: zodResolver(mantenimientoSchema),
    defaultValues: {
      vehiculoId: 0,
      fechaMantenimiento: new Date().toISOString().split("T")[0],
      tipoMantenimiento: "Preventivo",
      descripcion: "",
      costo: 0,
      proximoMantenimiento: "",
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

  const handleEditClick = (mantenimiento: VehicleMaintenance) => {
    setSelectedMantenimiento(mantenimiento);
    setIsCreating(false);

    setValue("vehiculoId", mantenimiento.vehiculoId);
    setValue(
      "fechaMantenimiento",
      new Date(mantenimiento.fechaMantenimiento).toISOString().split("T")[0]
    );
    setValue(
      "tipoMantenimiento",
      mantenimiento.tipoMantenimiento as "Preventivo" | "Correctivo"
    );
    setValue("descripcion", mantenimiento.descripcion || "");
    setValue("costo", mantenimiento.costo);
    if (mantenimiento.proximoMantenimiento) {
      setValue(
        "proximoMantenimiento",
        new Date(mantenimiento.proximoMantenimiento).toISOString().split("T")[0]
      );
    }
  };

  const handleCreateClick = () => {
    reset({
      vehiculoId: 0,
      fechaMantenimiento: new Date().toISOString().split("T")[0],
      tipoMantenimiento: "Preventivo",
      descripcion: "",
      costo: 0,
      proximoMantenimiento: "",
    });
    setSelectedMantenimiento(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este mantenimiento?")) {
      try {
        await deleteMantenimientoVehiculo(id);
        toast.success("Mantenimiento eliminado", {
          description:
            "El registro de mantenimiento se ha eliminado correctamente.",
        });
        await fetchMantenimientos();
      } catch (error) {
        console.error("Error al eliminar el mantenimiento:", error);
        toast.error("Error", {
          description: "No se pudo eliminar el mantenimiento.",
        });
      }
    }
  };

  const handleCompletarClick = async (id: number) => {
    try {
      await completarMantenimientoVehiculo(id);
      toast.success("Mantenimiento completado", {
        description:
          "El mantenimiento se ha marcado como completado correctamente.",
      });
      await fetchMantenimientos();
    } catch (error) {
      console.error("Error al completar el mantenimiento:", error);
      toast.error("Error", {
        description: "No se pudo completar el mantenimiento.",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof mantenimientoSchema>) => {
    try {
      if (selectedMantenimiento) {
        await editMantenimientoVehiculo(
          selectedMantenimiento.id,
          data as UpdateVehicleMaintenance
        );
        toast.success("Mantenimiento actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createMantenimientoVehiculo(data as CreateVehicleMaintenance);
        toast.success("Mantenimiento creado", {
          description: "El mantenimiento se ha programado correctamente.",
        });
      }

      await fetchMantenimientos();
      setIsCreating(false);
      setSelectedMantenimiento(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedMantenimiento
          ? "No se pudo actualizar el mantenimiento."
          : "No se pudo programar el mantenimiento.",
      });
    }
  };

  const fetchMantenimientos = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedMantenimientos = await getMantenimientosVehiculos(
        currentPage,
        itemsPerPage,
        search
      );
      setMantenimientos(fetchedMantenimientos.data);
      setTotal(fetchedMantenimientos.totalItems);
      setPage(fetchedMantenimientos.currentPage);
    } catch (error) {
      console.error("Error al cargar los mantenimientos:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los mantenimientos.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchMantenimientos();
  }, [fetchMantenimientos]);

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
        title="Listado de Mantenimientos de Vehículos"
        data={mantenimientos}
        itemsPerPage={itemsPerPage}
        searchableKeys={["tipoMantenimiento", "descripcion", "vehiculoId"]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "ID", key: "id" },
          { title: "Vehículo ID", key: "vehiculoId" },
          { title: "Fecha de mantenimiento", key: "fechaMantenimiento" },
          { title: "Tipo de mantenimiento", key: "tipoMantenimiento" },
          { title: "Descripción", key: "descripcion" },
          { title: "Costo", key: "costo" },
          { title: "Próximo mantenimiento", key: "proximoMantenimiento" },
          { title: "Completado", key: "completado" },
          { title: "Fecha completado", key: "fechaCompletado" },
          { title: "Acciones", key: "acciones" },
        ]}
        renderRow={(mantenimiento) => (
          <>
            <TableCell className="font-medium">{mantenimiento.id}</TableCell>
            <TableCell>{mantenimiento.vehiculoId}</TableCell>
            <TableCell>
              {mantenimiento.fechaMantenimiento &&
                new Date(mantenimiento.fechaMantenimiento).toLocaleDateString(
                  "es-AR"
                )}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  mantenimiento.tipoMantenimiento === "Preventivo"
                    ? "default"
                    : "outline"
                }
              >
                {mantenimiento.tipoMantenimiento}
              </Badge>
            </TableCell>
            <TableCell>{mantenimiento.descripcion}</TableCell>
            <TableCell>${mantenimiento.costo}</TableCell>
            <TableCell>
              {mantenimiento.proximoMantenimiento &&
                new Date(mantenimiento.proximoMantenimiento).toLocaleDateString(
                  "es-AR"
                )}
            </TableCell>
            <TableCell>
              <Badge
                variant={mantenimiento.completado ? "default" : "secondary"}
                className={
                  mantenimiento.completado
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                {mantenimiento.completado ? "Completado" : "Pendiente"}
              </Badge>
            </TableCell>
            <TableCell>
              {mantenimiento.fechaCompletado &&
                new Date(mantenimiento.fechaCompletado).toLocaleDateString(
                  "es-AR"
                )}
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(mantenimiento)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              {!mantenimiento.completado && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCompletarClick(mantenimiento.id)}
                  className="cursor-pointer"
                >
                  Completar
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(mantenimiento.id)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Programar Mantenimiento
          </Button>
        }
      />

      <FormDialog
        open={isCreating || selectedMantenimiento !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedMantenimiento(null);
          }
        }}
        title={
          selectedMantenimiento
            ? "Editar Mantenimiento"
            : "Programar Nuevo Mantenimiento"
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          <Controller
            name="vehiculoId"
            control={control}
            render={({ field, fieldState }) => (
              <VehiculoSelector
                label="Vehículo"
                name="vehiculoId"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaMantenimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha del Mantenimiento"
                name="fechaMantenimiento"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="tipoMantenimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Tipo de Mantenimiento"
                name="tipoMantenimiento"
                fieldType="select"
                value={field.value || ""}
                onChange={(selectedValue: string) =>
                  field.onChange(selectedValue)
                }
                options={[
                  { label: "Preventivo", value: "Preventivo" },
                  { label: "Correctivo", value: "Correctivo" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="descripcion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="costo"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Costo"
                name="costo"
                type="number"
                value={String(field.value)}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="proximoMantenimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Próximo Mantenimiento (Opcional)"
                name="proximoMantenimiento"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </>
      </FormDialog>
    </>
  );
};

export default MantenimientoVehiculosComponent;
