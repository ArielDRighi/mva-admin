"use client";

import {
  createSanitario,
  deleteSanitario,
  editSanitario,
  getSanitarios,
} from "@/app/actions/sanitarios";
import { Sanitario, SanitarioFormulario } from "@/types/types";
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
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  BadgeInfo,
  Toilet,
  RefreshCcw,
  PlusCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ListadoSanitariosComponent = ({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Sanitario[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sanitarios, setSanitarios] = useState<Sanitario[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSanitario, setSelectedSanitario] = useState<Sanitario | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const createSanitarioSchema = z.object({
    codigo_interno: z.string().min(1, "El código interno es obligatorio"),

    modelo: z.string().min(1, "El modelo es obligatorio"),

    fecha_adquisicion: z
      .string()
      .min(1, "La fecha de adquisición es obligatoria")
      .refine(
        (value) => !isNaN(Date.parse(value)),
        "Formato de fecha inválido"
      ),

    estado: z.enum(
      [
        "DISPONIBLE",
        "ASIGNADO",
        "MANTENIMIENTO",
        "FUERA_DE_SERVICIO",
        "BAJA",
      ],
      {
        errorMap: () => ({
          message: "El estado es obligatorio y debe ser válido",
        }),
      }
    ),
  });

  const form = useForm<z.infer<typeof createSanitarioSchema>>({
    resolver: zodResolver(createSanitarioSchema),
    defaultValues: {
      codigo_interno: "",
      modelo: "",
      fecha_adquisicion: "",
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

  const handleEditClick = (sanitario: Sanitario) => {
    setSelectedSanitario(sanitario);
    setIsCreating(false);

    const camposFormulario: (keyof SanitarioFormulario)[] = [
      "codigo_interno",
      "modelo",
      "fecha_adquisicion",
      "estado",
    ];

    camposFormulario.forEach((key) => setValue(key, sanitario[key]));
  };

  const handleCreateClick = () => {
    reset({
      codigo_interno: "",
      modelo: "",
      fecha_adquisicion: "",
      estado: "DISPONIBLE",
    });
    setSelectedSanitario(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteSanitario(id);
      toast.success("Sanitario eliminado", {
        description: "El sanitario se ha eliminado correctamente.",
      });
      await fetchSanitarios();
    } catch (error) {
      console.error("Error al eliminar el sanitario:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el sanitario.",
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof createSanitarioSchema>) => {
    try {
      if (selectedSanitario && selectedSanitario.baño_id) {
        await editSanitario(selectedSanitario.baño_id, data);
        toast.success("Sanitario actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createSanitario(data);
        toast.success("Sanitario creado", {
          description: "El sanitario se ha agregado correctamente.",
        });
      }

      await fetchSanitarios();
      setIsCreating(false);
      setSelectedSanitario(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedSanitario
          ? "No se pudo actualizar el sanitario."
          : "No se pudo crear el sanitario.",
      });
    }
  };

  const fetchSanitarios = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedSanitarios = await getSanitarios(
        currentPage,
        itemsPerPage,
        search
      );
      setSanitarios(fetchedSanitarios.items);
      setTotal(fetchedSanitarios.total);
      setPage(fetchedSanitarios.page);
    } catch (error) {
      console.error("Error al cargar los sanitarios:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredSanitarios =
    activeTab === "todos"
      ? sanitarios
      : sanitarios.filter((san) => {
          if (activeTab === "disponible") return san.estado === "DISPONIBLE";
          if (activeTab === "asignado") return san.estado === "ASIGNADO";
          if (activeTab === "mantenimiento")
            return san.estado === "MANTENIMIENTO";
          if (activeTab === "fuera_servicio")
            return san.estado === "FUERA_DE_SERVICIO";
          if (activeTab === "baja") return san.estado === "BAJA";
          return true;
        });

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchSanitarios();
    }
  }, [fetchSanitarios, isFirstLoad]);

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
              Gestión de Sanitarios
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra la información de los sanitarios de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Sanitario
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="flex flex-wrap gap-1 w-full">
              {" "}
              <TabsTrigger value="todos" className="flex items-center">
                <Toilet className="mr-2 h-4 w-4" />
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
                <RefreshCcw className="mr-2 h-4 w-4" />
                Mantenimiento
              </TabsTrigger>
              <TabsTrigger value="fuera_servicio" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Fuera de Servicio
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
            data={filteredSanitarios}
            itemsPerPage={itemsPerPage}
            searchableKeys={["codigo_interno", "modelo", "estado"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "Código interno", key: "codigo_interno" },
              { title: "Modelo", key: "modelo" },
              { title: "Fecha adquisición", key: "fecha_adquisicion" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(sanitario) => (
              <>
                <TableCell className="font-medium">
                  {sanitario.codigo_interno}
                </TableCell>
                <TableCell>{sanitario.modelo}</TableCell>
                <TableCell>
                  {sanitario.fecha_adquisicion &&
                    new Date(sanitario.fecha_adquisicion).toLocaleDateString(
                      "es-AR"
                    )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sanitario.estado === "DISPONIBLE"
                        ? "default"
                        : sanitario.estado === "BAJA"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      sanitario.estado === "DISPONIBLE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : sanitario.estado === "BAJA"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : sanitario.estado === "MANTENIMIENTO"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : sanitario.estado === "FUERA_DE_SERVICIO"
                        ? "bg-red-50 text-red-600 hover:bg-red-50"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }
                  >
                    {sanitario.estado.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(sanitario)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      sanitario.baño_id && handleDeleteClick(sanitario.baño_id)
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
        open={isCreating || selectedSanitario !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedSanitario(null);
          }
        }}
        title={selectedSanitario ? "Editar Sanitario" : "Crear Sanitario"}
        description={
          selectedSanitario
            ? "Modificar información del sanitario en el sistema."
            : "Completa el formulario para registrar un nuevo sanitario."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Controller
            name="codigo_interno"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Código interno"
                name="codigo_interno"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el código interno"
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
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el modelo"
              />
            )}
          />

          <Controller
            name="fecha_adquisicion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de adquisición"
                name="fecha_adquisicion"
                type="date"
                value={field.value}
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
                  { label: "Disponible", value: "DISPONIBLE" },
                  { label: "Asignado", value: "ASIGNADO" },
                  { label: "En mantenimiento", value: "MANTENIMIENTO" },
                  { label: "Fuera de servicio", value: "FUERA_DE_SERVICIO" },
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

export default ListadoSanitariosComponent;
