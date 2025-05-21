"use client";

import {
  createVehicle,
  deleteVehicle,
  editVehicle,
  getVehicles,
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
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiTruck,
  FiTag,
  FiCalendar,
  FiBox,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Comprobar ancho de pantalla para modo responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setViewMode(window.innerWidth < 768 ? "cards" : "table");
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
      <div className="w-full h-[60vh] flex justify-center items-center">
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DISPONIBLE: "bg-green-100 text-green-800",
      ASIGNADO: "bg-blue-100 text-blue-800",
      MANTENIMIENTO: "bg-yellow-100 text-yellow-800",
      INACTIVO: "bg-gray-100 text-gray-800",
      BAJA: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const renderCardsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {vehiculos.map((vehiculo) => (
        <Card
          key={vehiculo.id}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold">
                {vehiculo.marca} {vehiculo.modelo}
              </CardTitle>
              <Badge
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  vehiculo.estado
                )}`}
              >
                {vehiculo.estado}
              </Badge>
            </div>
            <CardDescription className="font-mono text-sm flex items-center gap-1">
              <FiTag className="inline-block" /> {vehiculo.placa}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <FiCalendar className="text-muted-foreground" />
                <span>{vehiculo.anio}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiBox className="text-muted-foreground" />
                <span>{vehiculo.capacidadCarga} kg</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(vehiculo)}
              className="cursor-pointer h-8"
            >
              <FiEdit2 className="mr-1" /> Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => vehiculo.id && handleDeleteClick(vehiculo.id)}
              className="cursor-pointer h-8"
            >
              <FiTrash2 className="mr-1" /> Eliminar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiTruck className="text-primary" /> Listado de Vehículos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {total} vehículos registrados
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="cursor-pointer flex items-center gap-2"
        >
          <FiPlus /> Agregar Vehículo
        </Button>
      </div>

      {viewMode === "cards" ? (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por placa, marca o modelo..."
              className="w-full p-2 border rounded-md"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {renderCardsView()}
          <div className="flex justify-center mt-4">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="pointer-events-none"
              >
                Página {page} de {Math.ceil(total / itemsPerPage)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / itemsPerPage)}
                onClick={() => handlePageChange(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      ) : (
        <ListadoTabla
          title=""
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
              <TableCell className="font-medium flex items-center gap-1">
                <FiTag className="text-muted-foreground" /> {vehiculo.placa}
              </TableCell>
              <TableCell>{vehiculo.marca}</TableCell>
              <TableCell>{vehiculo.modelo}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <FiCalendar className="text-muted-foreground" />{" "}
                  {vehiculo.anio}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <FiBox className="text-muted-foreground" />{" "}
                  {vehiculo.capacidadCarga} kg
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getStatusBadgeVariant(vehiculo.estado)}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                >
                  {vehiculo.estado}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(vehiculo)}
                  className="cursor-pointer flex items-center gap-1 h-8"
                >
                  <FiEdit2 /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => vehiculo.id && handleDeleteClick(vehiculo.id)}
                  className="cursor-pointer flex items-center gap-1 h-8"
                >
                  <FiTrash2 /> Eliminar
                </Button>
              </TableCell>
            </>
          )}
        />
      )}

      <FormDialog
        open={isCreating || selectedVehiculo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedVehiculo(null);
          }
        }}
        title={
          <div className="flex items-center gap-2">
            <FiTruck className="text-primary" />
            {selectedVehiculo ? "Editar Vehículo" : "Crear Vehículo"}
          </div>
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["placa", "Placa", <FiTag key="icon-placa" />],
              ["marca", "Marca", <FiTruck key="icon-marca" />],
              ["modelo", "Modelo", null],
            ] as const
          ).map(([name, label, icon]) => (
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
                  icon={icon}
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
                icon={<FiCalendar />}
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
                icon={<FiBox />}
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
    </div>
  );
};

export default ListadoVehiculosComponent;
