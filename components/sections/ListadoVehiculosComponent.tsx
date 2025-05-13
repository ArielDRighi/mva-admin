"use client";

import {
  createVehicle,
  deleteVehicle,
  editVehicle,
  getVehicles,
  changeVehicleStatus,
} from "@/app/actions/vehiculos";
import { CreateVehiculo, UpdateVehiculo, Vehiculo } from "@/types/types";
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

const ListadoVehiculosComponent = ({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Vehiculo[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const vehiculoSchema = z.object({
    placa: z.string().min(1, "La placa es obligatoria"),
    marca: z.string().min(1, "La marca es obligatoria"),
    modelo: z.string().min(1, "El modelo es obligatorio"),
    anio: z.coerce
      .number()
      .min(1900, "El año debe ser mayor a 1900")
      .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
    capacidadCarga: z.coerce
      .number()
      .min(1, "La capacidad de carga debe ser mayor a 0"),
    estado: z.enum(
      ["DISPONIBLE", "ASIGNADO", "MANTENIMIENTO", "INACTIVO", "BAJA"],
      {
        errorMap: () => ({
          message: "El estado es obligatorio y debe ser válido",
        }),
      }
    ),
  });

  const form = useForm<z.infer<typeof vehiculoSchema>>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      capacidadCarga: 0,
      estado: "DISPONIBLE",
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

  const handleEditClick = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setIsCreating(false);

    const camposFormulario: (keyof CreateVehiculo)[] = [
      "placa",
      "marca",
      "modelo",
      "anio",
      "capacidadCarga",
      "estado",
    ];

    camposFormulario.forEach((key) => setValue(key, vehiculo[key]));
  };

  const handleCreateClick = () => {
    reset({
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      capacidadCarga: 0,
      estado: "DISPONIBLE",
    });
    setSelectedVehiculo(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteVehicle(id);
      toast.success("Vehículo eliminado", {
        description: "El vehículo se ha eliminado correctamente.",
      });
      await fetchVehiculos();
    } catch (error) {
      console.error("Error al eliminar el vehículo:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el vehículo.",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof vehiculoSchema>) => {
    try {
      if (selectedVehiculo && selectedVehiculo.id) {
        await editVehicle(selectedVehiculo.id.toString(), data);
        toast.success("Vehículo actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createVehicle(data);
        toast.success("Vehículo creado", {
          description: "El vehículo se ha agregado correctamente.",
        });
      }

      await fetchVehiculos();
      setIsCreating(false);
      setSelectedVehiculo(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedVehiculo
          ? "No se pudo actualizar el vehículo."
          : "No se pudo crear el vehículo.",
      });
    }
  };

  const fetchVehiculos = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedVehiculos = await getVehicles(
        currentPage,
        itemsPerPage,
        search
      );
      setVehiculos(fetchedVehiculos.data);
      setTotal(fetchedVehiculos.totalItems);
      setPage(fetchedVehiculos.currentPage);
    } catch (error) {
      console.error("Error al cargar los vehículos:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

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
      DISPONIBLE: "default",
      ASIGNADO: "secondary",
      MANTENIMIENTO: "outline",
      INACTIVO: "outline",
      BAJA: "destructive",
    };
    return variants[status] || "outline";
  };

  return (
    <>
      <ListadoTabla
        title="Listado de Vehículos"
        data={vehiculos}
        itemsPerPage={itemsPerPage}
        searchableKeys={["placa", "marca", "modelo"]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "Placa", key: "placa" },
          { title: "Marca", key: "marca" },
          { title: "Modelo", key: "modelo" },
          { title: "Año", key: "anio" },
          { title: "Capacidad de Carga", key: "capacidadCarga" },
          { title: "Estado", key: "estado" },
        ]}
        renderRow={(vehiculo) => (
          <>
            <TableCell className="font-medium">{vehiculo.placa}</TableCell>
            <TableCell>{vehiculo.marca}</TableCell>
            <TableCell>{vehiculo.modelo}</TableCell>
            <TableCell>{vehiculo.anio}</TableCell>
            <TableCell>{vehiculo.capacidadCarga} kg</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(vehiculo.estado)}>
                {vehiculo.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(vehiculo)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => vehiculo.id && handleDeleteClick(vehiculo.id)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar Vehículo
          </Button>
        }
      />
      <FormDialog
        open={isCreating || selectedVehiculo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedVehiculo(null);
          }
        }}
        title={selectedVehiculo ? "Editar Vehículo" : "Crear Vehículo"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["placa", "Placa"],
              ["marca", "Marca"],
              ["modelo", "Modelo"],
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

          <Controller
            name="anio"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Año"
                name="anio"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="capacidadCarga"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Capacidad de Carga (kg)"
                name="capacidadCarga"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
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
                  { label: "DISPONIBLE", value: "DISPONIBLE" },
                  { label: "ASIGNADO", value: "ASIGNADO" },
                  { label: "MANTENIMIENTO", value: "MANTENIMIENTO" },
                  { label: "INACTIVO", value: "INACTIVO" },
                  { label: "BAJA", value: "BAJA" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
        </>
      </FormDialog>
    </>
  );
};

export default ListadoVehiculosComponent;
