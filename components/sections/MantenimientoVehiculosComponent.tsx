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
import {
  Wrench,
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  Car,
  Tag,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("todos");

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Implementar filtrado por estado de completado
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

  const filteredMantenimientos =
    activeTab === "todos"
      ? mantenimientos
      : activeTab === "completados"
      ? mantenimientos.filter((mant) => mant.completado)
      : mantenimientos.filter((mant) => !mant.completado);

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
              Mantenimiento de Vehículos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Gestión y programación de mantenimientos para los vehículos
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Programar Mantenimiento
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
                <Wrench className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="pendientes" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="completados" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredMantenimientos}
            itemsPerPage={itemsPerPage}
            searchableKeys={["tipoMantenimiento", "descripcion", "vehiculoId"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "Vehículo", key: "vehiculo" },
              { title: "Detalles", key: "detalles" },
              { title: "Tipo", key: "tipo" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(mantenimiento) => (
              <>
                <TableCell className="min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Car className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        ID Vehículo: {mantenimiento.vehiculoId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Tag className="h-3.5 w-3.5 mr-1" />#{mantenimiento.id}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[250px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {mantenimiento.fechaMantenimiento &&
                          new Date(
                            mantenimiento.fechaMantenimiento
                          ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>${mantenimiento.costo}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      mantenimiento.tipoMantenimiento === "Preventivo"
                        ? "default"
                        : "outline"
                    }
                    className={
                      mantenimiento.tipoMantenimiento === "Preventivo"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {mantenimiento.tipoMantenimiento}
                  </Badge>
                  <div className="mt-2 text-xs text-gray-500">
                    {mantenimiento.descripcion}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={mantenimiento.completado ? "default" : "outline"}
                    className={
                      mantenimiento.completado
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    }
                  >
                    {mantenimiento.completado ? "Completado" : "Pendiente"}
                  </Badge>
                  <div className="mt-2 text-xs">
                    {mantenimiento.proximoMantenimiento && (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>
                          Próximo:{" "}
                          {new Date(
                            mantenimiento.proximoMantenimiento
                          ).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(mantenimiento)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(mantenimiento.id)}
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>

                  <div className="ml-1">
                    {!mantenimiento.completado && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCompletarClick(mantenimiento.id)}
                        className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Completar
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
        description={
          selectedMantenimiento
            ? "Modificar información del mantenimiento en el sistema."
            : "Completa el formulario para programar un nuevo mantenimiento."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                placeholder="$0.00"
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
                className="col-span-2"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Describa el mantenimiento a realizar"
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
        </div>
      </FormDialog>
    </Card>
  );
};

export default MantenimientoVehiculosComponent;
