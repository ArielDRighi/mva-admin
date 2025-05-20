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
  const handleEditClick = (
    mantenimientoSanitario: MantenimientoSanitarioForm
  ) => {
    setSelectedMantenimientoSanitario(mantenimientoSanitario);
    setIsCreating(false); // Configurar todos los campos del formulario
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
      toast.success("Sanitario eliminado", {
        description: "El sanitario se ha eliminado correctamente.",
      });
      await fetchSanitariosMantenimiento();
    } catch (error) {
      console.error("Error al eliminar el sanitario:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el sanitario.",
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
        toast.success("Sanitario actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await createSanitarioEnMantenimiento(data);
        toast.success("Sanitario creado", {
          description: "El sanitario se ha agregado correctamente.",
        });
      }

      await fetchSanitariosMantenimiento();
      setIsCreating(false);
      setSelectedMantenimientoSanitario(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedMantenimientoSanitario
          ? "No se pudo actualizar el sanitario."
          : "No se pudo crear el sanitario.",
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
      console.error("Error al cargar los clientes:", error);
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
    <>
      <ListadoTabla
        title="Listado de Sanitarios en Mantenimiento"
        data={mantenimientoSanitarios}
        itemsPerPage={itemsPerPage}
        searchableKeys={[
          "tipo_mantenimiento",
          "tecnico_responsable",
          "baño_id",
        ]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "Mantenimiento ID", key: "mantenimiento_id" },
          { title: "Código interno", key: "codigo_interno" },
          { title: "Estado", key: "estado" },
          { title: "Fecha de mantenimiento", key: "fecha_mantenimiento" },
          { title: "Tipo de mantenimiento", key: "tipo_mantenimiento" },
          { title: "Descripción", key: "descripcion" },
          { title: "Tecnico responsable", key: "tecnico_responsable" },
          { title: "Costo", key: "costo" },
          { title: "Completado", key: "completado" },
          { title: "Fecha completado", key: "fechaCompletado" },
        ]}
        renderRow={(mantenimientoSanitario) => (
          <>
            <TableCell className="font-medium">
              {mantenimientoSanitario.mantenimiento_id}
            </TableCell>{" "}
            <TableCell>
              {mantenimientoSanitario.toilet?.codigo_interno || "No disponible"}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {mantenimientoSanitario.toilet?.estado || "No disponible"}
              </Badge>
            </TableCell>
            <TableCell>
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
              >
                {mantenimientoSanitario.tipo_mantenimiento}
              </Badge>
            </TableCell>
            <TableCell>{mantenimientoSanitario.descripcion}</TableCell>
            <TableCell>{mantenimientoSanitario.tecnico_responsable}</TableCell>
            <TableCell>{mantenimientoSanitario.costo}</TableCell>{" "}
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
            <TableCell>
              {mantenimientoSanitario.fechaCompletado &&
                new Date(
                  mantenimientoSanitario.fechaCompletado
                ).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(mantenimientoSanitario)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  mantenimientoSanitario.mantenimiento_id &&
                  handleDeleteClick(mantenimientoSanitario.mantenimiento_id)
                }
                className="cursor-pointer"
              >
                Eliminar
              </Button>{" "}
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
                disabled={mantenimientoSanitario.completado}
                className={`cursor-pointer ${
                  mantenimientoSanitario.completado ? "opacity-50" : ""
                }`}
              >
                Completar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar Mantenimiento para Sanitario
          </Button>
        }
      />{" "}
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
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
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
            name="descripcion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Descripción"
                name="descripcion"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

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
        </>
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
    </>
  );
};

export default MantenimientoSanitariosComponent;
