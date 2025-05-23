"use client";

import {
  createVehicle,
  deleteVehicle,
  editVehicle,
  getVehicles,
} from "@/app/actions/vehiculos";
import { UpdateVehiculo, Vehiculo } from "@/types/types";
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
  Truck,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  BadgeInfo,
  Calendar,
  Tag,
} from "lucide-react";

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

  const safeData = Array.isArray(data) ? data : [];

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const vehiculoSchema = z.object({
    numeroInterno: z.string().nullable(),
    placa: z.string().min(1, "La placa es obligatoria"),
    marca: z.string().min(1, "La marca es obligatoria"),
    modelo: z.string().min(1, "El modelo es obligatorio"),
    anio: z.coerce
      .number()
      .min(1900, "El año debe ser mayor a 1900")
      .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
    tipoCabina: z.string().min(1, "El tipo de cabina es obligatorio"),
    fechaVencimientoVTV: z.string().nullable(),
    fechaVencimientoSeguro: z.string().nullable(),
    esExterno: z.boolean(),
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
      numeroInterno: null,
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      tipoCabina: "simple",
      fechaVencimientoVTV: null,
      fechaVencimientoSeguro: null,
      esExterno: false,
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

    const camposFormulario = [
      "numeroInterno",
      "placa",
      "marca",
      "modelo",
      "anio",
      "tipoCabina",
      "fechaVencimientoVTV",
      "fechaVencimientoSeguro",
      "esExterno",
      "estado",
    ] as const;

    camposFormulario.forEach((key) => {
      if (key in vehiculo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(key as any, vehiculo[key as keyof typeof vehiculo]);
      }
    });
  };

  const handleCreateClick = () => {
    reset({
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
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

  const handleChangeStatus = async (id: number, estado: string) => {
    try {
      await editVehicle(id.toString(), { estado } as UpdateVehiculo);
      toast.success("Estado actualizado", {
        description: `El vehículo ahora está ${estado}.`,
      });
      await fetchVehiculos();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      toast.error("Error", { description: "No se pudo cambiar el estado." });
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredVehiculos =
    activeTab === "todos"
      ? vehiculos
      : vehiculos.filter((veh) => veh.estado === activeTab.toUpperCase());

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchVehiculos();
    }
  }, [fetchVehiculos, isFirstLoad]);

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
              Gestión de Vehículos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra la información de los vehículos de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Vehículo
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
                <Truck className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="disponible" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Disponibles
              </TabsTrigger>
              <TabsTrigger value="asignado" className="flex items-center">
                <BadgeInfo className="mr-2 h-4 w-4" />
                Asignados
              </TabsTrigger>
              <TabsTrigger value="mantenimiento" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Mantenimiento
              </TabsTrigger>
              <TabsTrigger value="baja" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Baja
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredVehiculos}
            itemsPerPage={itemsPerPage}
            searchableKeys={["placa", "marca", "modelo"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}            columns={[
              { title: "Vehículo", key: "vehiculo" },
              { title: "Información", key: "informacion" },
              { title: "Vencimientos", key: "vencimientos" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(vehiculo) => (
              <>
                <TableCell className="min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {vehiculo.numeroInterno
                          ? `#${vehiculo.numeroInterno} - `
                          : ""}
                        {vehiculo.placa}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        {vehiculo.marca} {vehiculo.modelo}
                      </div>
                    </div>
                  </div>                </TableCell>                
                <TableCell className="min-w-[150px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>Año: {vehiculo.anio}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Truck className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        Cabina:{" "}
                        {vehiculo.tipoCabina.charAt(0).toUpperCase() +
                          vehiculo.tipoCabina.slice(1)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="min-w-[180px]">
                  {(vehiculo.fechaVencimientoVTV || vehiculo.fechaVencimientoSeguro) ? (
                    <div className="flex flex-col gap-1">
                      {vehiculo.fechaVencimientoVTV && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>
                            VTV: {new Date(vehiculo.fechaVencimientoVTV).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      )}
                      {vehiculo.fechaVencimientoSeguro && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>
                            Seguro: {new Date(vehiculo.fechaVencimientoSeguro).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No hay vencimientos registrados
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge
                    variant={
                      vehiculo.estado === "DISPONIBLE"
                        ? "default"
                        : vehiculo.estado === "BAJA"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      vehiculo.estado === "DISPONIBLE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : vehiculo.estado === "ASIGNADO"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : vehiculo.estado === "MANTENIMIENTO"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : vehiculo.estado === "BAJA"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {vehiculo.estado}
                  </Badge>
                  <div className="mt-2 text-xs text-gray-500">
                    {vehiculo.esExterno
                      ? "Vehículo externo"
                      : "Vehículo propio"}
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(vehiculo)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      vehiculo.id && handleDeleteClick(vehiculo.id)
                    }
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>

                  <div className="ml-1">
                    {vehiculo.estado !== "DISPONIBLE" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          vehiculo.id &&
                          handleChangeStatus(vehiculo.id, "DISPONIBLE")
                        }
                        className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Disponible
                      </Button>
                    )}

                    {vehiculo.estado !== "MANTENIMIENTO" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          vehiculo.id &&
                          handleChangeStatus(vehiculo.id, "MANTENIMIENTO")
                        }
                        className="cursor-pointer"
                      >
                        <PauseCircle className="h-3.5 w-3.5 mr-1" />
                        Mantenimiento
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
        open={isCreating || selectedVehiculo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedVehiculo(null);
          }
        }}
        title={selectedVehiculo ? "Editar Vehículo" : "Crear Vehículo"}
        description={
          selectedVehiculo
            ? "Modificar información del vehículo en el sistema."
            : "Completa el formulario para registrar un nuevo vehículo."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-4">
          <Controller
            name="numeroInterno"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Número Interno (Opcional)"
                name="numeroInterno"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Número identificatorio interno"
              />
            )}
          />
          <Controller
            name="placa"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Placa"
                name="placa"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese la placa"
              />
            )}
          />
          <Controller
            name="marca"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Marca"
                name="marca"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese la marca"
              />
            )}
          />
          <Controller
            name="modelo"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Modelo"
                name="modelo"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el modelo"
              />
            )}
          />
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
                placeholder="Ej: 2023"
              />
            )}
          />{" "}
          <Controller
            name="tipoCabina"
            control={control}
            render={({ field, fieldState }) => {
              const capitalizeFirstLetter = (string: string) => {
                return string.charAt(0).toUpperCase() + string.slice(1);
              };
              const displayValue = field.value
                ? capitalizeFirstLetter(field.value)
                : "";

              return (
                <FormField
                  label="Tipo de Cabina"
                  name="tipoCabina"
                  fieldType="select"
                  value={displayValue || "Simple"}
                  onChange={(value) => {
                    field.onChange(value.toLowerCase());
                  }}
                  options={[
                    { label: "Simple", value: "Simple" },
                    { label: "Doble", value: "Doble" },
                    { label: "Extendida", value: "Extendida" },
                  ]}
                  error={fieldState.error?.message}
                />
              );
            }}
          />
          <Controller
            name="fechaVencimientoVTV"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Vencimiento VTV (Opcional)"
                name="fechaVencimientoVTV"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="fechaVencimientoSeguro"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Vencimiento Seguro (Opcional)"
                name="fechaVencimientoSeguro"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />{" "}
          <Controller
            name="esExterno"
            control={control}
            render={({ field, fieldState }) => {
              const currentLabel =
                field.value === true ? "Vehículo externo" : "Vehículo propio";

              return (
                <FormField
                  label="Tipo de Vehículo"
                  name="esExterno"
                  fieldType="select"
                  value={
                    field.value === undefined ? "Vehículo propio" : currentLabel
                  }
                  onChange={(value) => {
                    field.onChange(value === "Vehículo externo");
                  }}
                  options={[
                    { label: "Vehículo propio", value: "Vehículo propio" },
                    { label: "Vehículo externo", value: "Vehículo externo" },
                  ]}
                  error={fieldState.error?.message}
                />
              );
            }}
          />
          <Controller
            name="estado"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Estado"
                name="estado"
                fieldType="select"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "Disponible", value: "DISPONIBLE" },
                  { label: "Asignado", value: "ASIGNADO" },
                  { label: "Mantenimiento", value: "MANTENIMIENTO" },
                  { label: "Inactivo", value: "INACTIVO" },
                  { label: "Baja", value: "BAJA" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </FormDialog>
    </Card>
  );
};

export default ListadoVehiculosComponent;
