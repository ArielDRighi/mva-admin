"use client";
import {
  completarMantenimientoSanitario,
  createSanitarioEnMantenimiento,
  deleteSanitarioEnMantenimiento,
  editSanitarioEnMantenimiento,
  getSanitariosEnMantenimiento,
  getToiletsList,
} from "@/app/actions/sanitarios";
import { MantenimientoSanitarioForm, ChemicalToilet } from "@/types/types";
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
  Toilet,
  Edit2,
  Trash2,
  CheckCircle,
  PlusCircle,
  RefreshCcw,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MantenimientoSanitariosComponent = ({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: MantenimientoSanitarioForm[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mantenimientoSanitarios, setMantenimientoSanitarios] =
    useState<MantenimientoSanitarioForm[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMantenimientoSanitario, setSelectedMantenimientoSanitario] =
    useState<MantenimientoSanitarioForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toiletsList, setToiletsList] = useState<ChemicalToilet[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [mantenimientoToComplete, setMantenimientoToComplete] = useState<
    number | null
  >(null);
  const [activeTab, setActiveTab] = useState("todos");

  // Schema y resto del código existente...
  const createSanitarioSchema = z.object({
    baño_id: z.number({
      required_error: "El baño es obligatorio",
      invalid_type_error: "El ID del baño debe ser un número",
    }),

    fecha_mantenimiento: z.string().optional(),

    tipo_mantenimiento: z.enum(["Preventivo", "Correctivo"], {
      errorMap: () => ({
        message:
          "El tipo de mantenimiento debe ser 'Preventivo' o 'Correctivo'",
      }),
    }),

    descripcion: z.string().min(1, "La descripción es obligatoria"),

    tecnico_responsable: z
      .string()
      .min(1, "El técnico responsable es obligatorio"),

    costo: z
      .number({
        required_error: "El costo es obligatorio",
        invalid_type_error: "El costo debe ser un número",
      })
      .nonnegative("El costo no puede ser negativo"),
  });

  const form = useForm<z.infer<typeof createSanitarioSchema>>({
    resolver: zodResolver(createSanitarioSchema),
    defaultValues: {
      baño_id: 0,
      fecha_mantenimiento: new Date().toISOString().split("T")[0],
      tipo_mantenimiento: "Preventivo",
      descripcion: "",
      tecnico_responsable: "",
      costo: 0,
    },
  });

  const { handleSubmit, setValue, control, reset } = form;

  // Funciones existentes
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

  const filteredMantenimientos =
    activeTab === "todos"
      ? mantenimientoSanitarios
      : mantenimientoSanitarios.filter((man) => {
          if (activeTab === "pendiente")
            return (
              !man.completado &&
              new Date(man.fecha_mantenimiento || "") >= new Date()
            );
          if (activeTab === "proceso")
            return (
              !man.completado &&
              new Date(man.fecha_mantenimiento || "") < new Date()
            );
          if (activeTab === "completado") return man.completado;
          return true;
        });

  const handleEditClick = (
    mantenimientoSanitario: MantenimientoSanitarioForm
  ) => {
    setSelectedMantenimientoSanitario(mantenimientoSanitario);
    setIsCreating(false);
    setValue("baño_id", mantenimientoSanitario.baño_id);
    setValue(
      "fecha_mantenimiento",
      mantenimientoSanitario.fecha_mantenimiento ||
        new Date().toISOString().split("T")[0]
    );
    setValue(
      "tipo_mantenimiento",
      mantenimientoSanitario.tipo_mantenimiento === "Preventivo"
        ? "Preventivo"
        : "Correctivo"
    );
    setValue("descripcion", mantenimientoSanitario.descripcion);
    setValue("tecnico_responsable", mantenimientoSanitario.tecnico_responsable);
    setValue("costo", mantenimientoSanitario.costo);
  };

  const handleCreateClick = () => {
    reset({
      baño_id: 0,
      fecha_mantenimiento: new Date().toISOString().split("T")[0],
      tipo_mantenimiento: "Preventivo",
      descripcion: "",
      tecnico_responsable: "",
      costo: 0,
    });
    setSelectedMantenimientoSanitario(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteSanitarioEnMantenimiento(id);
      toast.success("Mantenimiento eliminado", {
        description:
          "El registro de mantenimiento se ha eliminado correctamente.",
      });
      await fetchSanitariosMantenimiento();
    } catch (error) {
      console.error("Error al eliminar el mantenimiento:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el registro de mantenimiento.",
      });
    }
  };

  const handleCompleteClick = async (id: number) => {
    try {
      await completarMantenimientoSanitario(id);
      toast.success("Mantenimiento completado", {
        description: "El mantenimiento se ha marcado como completado.",
      });
      await fetchSanitariosMantenimiento();
    } catch (error) {
      console.error("Error al completar el mantenimiento:", error);
      toast.error("Error", {
        description: "No se pudo completar el mantenimiento.",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof createSanitarioSchema>) => {
    try {
      if (
        selectedMantenimientoSanitario &&
        selectedMantenimientoSanitario.baño_id
      ) {
        await editSanitarioEnMantenimiento(
          selectedMantenimientoSanitario.mantenimiento_id!,
          data
        );
        toast.success("Mantenimiento actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createSanitarioEnMantenimiento(data);
        toast.success("Mantenimiento creado", {
          description: "El mantenimiento se ha registrado correctamente.",
        });
      }

      await fetchSanitariosMantenimiento();
      setIsCreating(false);
      setSelectedMantenimientoSanitario(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedMantenimientoSanitario
          ? "No se pudo actualizar el mantenimiento."
          : "No se pudo crear el mantenimiento.",
      });
    }
  };

  const fetchSanitariosMantenimiento = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedSanitariosMantenimiento = await getSanitariosEnMantenimiento(
        currentPage,
        itemsPerPage,
        search
      );
      setMantenimientoSanitarios(fetchedSanitariosMantenimiento.data);
      setTotal(fetchedSanitariosMantenimiento.total);
      setPage(fetchedSanitariosMantenimiento.page);
    } catch (error) {
      console.error("Error al cargar los mantenimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  const fetchToiletsList = async () => {
    try {
      const toilets = await getToiletsList();
      setToiletsList(toilets);
    } catch (error) {
      console.error("Error al cargar la lista de sanitarios:", error);
      toast.error("Error", {
        description: "No se pudo cargar la lista de sanitarios.",
      });
    }
  };

  useEffect(() => {
    fetchSanitariosMantenimiento();
    fetchToiletsList();
  }, [fetchSanitariosMantenimiento]);

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
              Gestión de Mantenimientos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra los mantenimientos de sanitarios de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Mantenimiento
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-4 w-[500px]">
              <TabsTrigger value="todos" className="flex items-center">
                <Toilet className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="pendiente" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="proceso" className="flex items-center">
                <RefreshCcw className="mr-2 h-4 w-4" />
                En Proceso
              </TabsTrigger>
              <TabsTrigger value="completado" className="flex items-center">
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
            searchableKeys={[
              "tipo_mantenimiento",
              "tecnico_responsable",
              "descripcion",
            ]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "Sanitario", key: "codigo_interno" },
              { title: "Fecha", key: "fecha_mantenimiento" },
              { title: "Tipo", key: "tipo_mantenimiento" },
              { title: "Descripción", key: "descripcion" },
              { title: "Técnico", key: "tecnico_responsable" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(mantenimientoSanitario) => (
              <>
                <TableCell className="min-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Toilet className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {mantenimientoSanitario.toilet?.codigo_interno ||
                          "No disponible"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {mantenimientoSanitario.toilet?.modelo ||
                          "Modelo no disponible"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[120px]">
                  {mantenimientoSanitario.fecha_mantenimiento &&
                    new Date(
                      mantenimientoSanitario.fecha_mantenimiento
                    ).toLocaleDateString("es-AR")}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      mantenimientoSanitario.tipo_mantenimiento === "Preventivo"
                        ? "default"
                        : "outline"
                    }
                    className={
                      mantenimientoSanitario.tipo_mantenimiento === "Preventivo"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {mantenimientoSanitario.tipo_mantenimiento}
                  </Badge>
                </TableCell>

                <TableCell className="max-w-[200px] truncate">
                  {mantenimientoSanitario.descripcion}
                </TableCell>

                <TableCell>
                  {mantenimientoSanitario.tecnico_responsable}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      mantenimientoSanitario.completado
                        ? "default"
                        : mantenimientoSanitario.fecha_mantenimiento &&
                          new Date(mantenimientoSanitario.fecha_mantenimiento) <
                            new Date()
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      mantenimientoSanitario.completado
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : mantenimientoSanitario.fecha_mantenimiento &&
                          new Date(mantenimientoSanitario.fecha_mantenimiento) <
                            new Date()
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {mantenimientoSanitario.completado
                      ? "Completado"
                      : mantenimientoSanitario.fecha_mantenimiento &&
                        new Date(mantenimientoSanitario.fecha_mantenimiento) <
                          new Date()
                      ? "En proceso"
                      : "Pendiente"}
                  </Badge>
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(mantenimientoSanitario)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      mantenimientoSanitario.mantenimiento_id &&
                      handleDeleteClick(mantenimientoSanitario.mantenimiento_id)
                    }
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>

                  {!mantenimientoSanitario.completado && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        if (mantenimientoSanitario.mantenimiento_id) {
                          setMantenimientoToComplete(
                            mantenimientoSanitario.mantenimiento_id
                          );
                          setConfirmDialogOpen(true);
                        }
                      }}
                      className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Completar
                    </Button>
                  )}
                </TableCell>
              </>
            )}
          />
        </div>
      </CardContent>

      <FormDialog
        open={isCreating || selectedMantenimientoSanitario !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedMantenimientoSanitario(null);
          }
        }}
        title={
          selectedMantenimientoSanitario
            ? "Editar Mantenimiento"
            : "Crear Mantenimiento"
        }
        description={
          selectedMantenimientoSanitario
            ? "Modificar información del mantenimiento de sanitario en el sistema."
            : "Completa el formulario para registrar un nuevo mantenimiento."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Controller
            name="baño_id"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Sanitario"
                name="baño_id"
                fieldType="select"
                value={String(field.value)}
                onChange={(selectedValue: string) =>
                  field.onChange(parseInt(selectedValue, 10))
                }
                options={toiletsList.map((toilet) => ({
                  label: `${toilet.codigo_interno} - ${toilet.modelo}`,
                  value: String(toilet.baño_id),
                }))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fecha_mantenimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de mantenimiento"
                name="fecha_mantenimiento"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="tipo_mantenimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Tipo de mantenimiento"
                name="tipo_mantenimiento"
                fieldType="select"
                value={field.value}
                onChange={field.onChange}
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
                onChange={(value) => field.onChange(parseFloat(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="md:col-span-2">
            <Controller
              name="tecnico_responsable"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Técnico responsable"
                  name="tecnico_responsable"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Nombre del técnico"
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Controller
              name="descripcion"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <label htmlFor="descripcion" className="text-sm font-medium">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    {...field}
                    placeholder="Detalle el mantenimiento a realizar"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={confirmDialogOpen}
        submitButtonText="Confirmar"
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialogOpen(false);
            setMantenimientoToComplete(null);
          }
        }}
        title="Confirmar completado del mantenimiento"
        onSubmit={(e) => {
          e.preventDefault();
          if (mantenimientoToComplete) {
            handleCompleteClick(mantenimientoToComplete);
            setConfirmDialogOpen(false);
            setMantenimientoToComplete(null);
          }
        }}
      >
        <div className="space-y-4 py-4">
          <p className="text-destructive font-semibold">¡Atención!</p>
          <p>
            Esta acción marcará el mantenimiento como completado y no será
            reversible. ¿Estás seguro de que deseas continuar?
          </p>
        </div>
      </FormDialog>
    </Card>
  );
};

export default MantenimientoSanitariosComponent;
