import {
  createSanitarioEnMantenimiento,
  deleteSanitarioEnMantenimiento,
  editSanitarioEnMantenimiento,
  getSanitariosEnMantenimiento,
} from "@/app/actions/sanitarios";
import {
  MantenimientoSanitario,
  MantenimientoSanitarioForm,
  MantenimientoSanitarioFormulario,
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
    useState<MantenimientoSanitario | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createSanitarioSchema = z.object({
    baño_id: z.number({
      required_error: "El baño es obligatorio",
      invalid_type_error: "El ID del baño debe ser un número",
    }),

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
    setIsCreating(false);

    const camposFormulario: (keyof MantenimientoSanitarioFormulario)[] = [
      "baño_id",
      "tipo_mantenimiento",
      "descripcion",
      "tecnico_responsable",
      "costo",
    ];

    camposFormulario.forEach((key) =>
      setValue(key, mantenimientoSanitario[key])
    );
  };

  const handleCreateClick = () => {
    reset({
      baño_id: 0,
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

  const onSubmit = async (data: z.infer<typeof createSanitarioSchema>) => {
    try {
      if (
        selectedMantenimientoSanitario &&
        selectedMantenimientoSanitario.baño_id
      ) {
        await editSanitarioEnMantenimiento(
          selectedMantenimientoSanitario.baño_id,
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
      setMantenimientoSanitarios(fetchedSanitariosMantenimiento.items);
      setTotal(fetchedSanitariosMantenimiento.total);
      setPage(fetchedSanitariosMantenimiento.page);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchSanitariosMantenimiento();
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
          { title: "Fecha de mantenimiento", key: "fecha_mantenimiento" },
          { title: "Tipo de mantenimiento", key: "tipo_mantenimiento" },
          { title: "Descripción", key: "descripcion" },
          { title: "Tecnico responsable", key: "tecnico_responsable" },
          { title: "Costo", key: "costo" },
          { title: "Sanitarios", key: "toilet" },
          { title: "Completado", key: "completado" },
          { title: "Fecha completado", key: "fechaCompletado" },
        ]}
        renderRow={(mantenimientoSanitarios) => (
          <>
            <TableCell className="font-medium">
              {mantenimientoSanitarios.mantenimiento_id}
            </TableCell>
            <TableCell>
              {mantenimientoSanitarios.fecha_mantenimiento &&
                new Date(
                  mantenimientoSanitarios.fecha_mantenimiento
                ).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  mantenimientoSanitarios.tipo_mantenimiento === "Preventivo"
                    ? "default"
                    : "outline"
                }
              >
                {mantenimientoSanitarios.tipo_mantenimiento}
              </Badge>
            </TableCell>
            <TableCell>{mantenimientoSanitarios.descripcion}</TableCell>
            <TableCell>{mantenimientoSanitarios.tecnico_responsable}</TableCell>
            <TableCell>{mantenimientoSanitarios.costo}</TableCell>
            {/* <TableCell>{mantenimientoSanitarios.toilet}</TableCell> */}
            <TableCell>{mantenimientoSanitarios.completado}</TableCell>
            <TableCell>
              {mantenimientoSanitarios.fechaCompletado &&
                new Date(
                  mantenimientoSanitarios.fechaCompletado
                ).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(mantenimientoSanitarios)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  mantenimientoSanitarios.mantenimiento_id &&
                  handleDeleteClick(mantenimientoSanitarios.mantenimiento_id)
                }
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar Sanitario
          </Button>
        }
      />

      <FormDialog
        open={isCreating || selectedMantenimientoSanitario !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedMantenimientoSanitario(null);
          }
        }}
        title={selectedMantenimientoSanitario ? "Editar Mantenimiento" : "Crear Mantenimiento"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["baño_id", "Sanitario ID"],
              ["tipo_mantenimiento", "Tipo de mantenimiento"],
              ["descripcion", "Descripción"],
              ["tecnico_responsable", "Tecnico responsable"],
              ["costo", "Costo"],
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
            name="fecha_adquisicion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha adquisicion"
                name="fecha_adquisicion"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message} // Manejo de errores
              />
            )}
          />

          {/* Campo para el estado */}
          <Controller
            name="estado"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Estado"
                name="estado"
                fieldType="select"
                value={field.value || ""} // Asegúrate de que sea un valor primitivo (cadena o número)
                onChange={(selectedValue: string) =>
                  field.onChange(selectedValue)
                } // Solo pasa el valor, no el objeto
                options={[
                  { label: "DISPONIBLE", value: "DISPONIBLE" },
                  { label: "FUERA DE SERVICIO", value: "FUERA_DE_SERVICIO" },
                  { label: "EN MANTENIMIENTO", value: "EN_MANTENIMIENTO" },
                  { label: "ASIGNADO", value: "ASIGNADO" },
                  { label: "BAJA", value: "BAJA" },
                ]}
                error={fieldState.error?.message} // Manejo de errores
              />
            )}
          />
        </>
      </FormDialog>
    </>
  );
};

export default MantenimientoSanitariosComponent;
