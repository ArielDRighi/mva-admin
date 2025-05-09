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
      ["DISPONIBLE", "ASIGNADO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO", "BAJA"],
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
      estado: "ASIGNADO",
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
      estado: "ASIGNADO",
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
      console.error("Error al cargar los clientes:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchSanitarios();
  }, [fetchSanitarios]);

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
        title="Listado de Sanitarios"
        data={sanitarios}
        itemsPerPage={itemsPerPage}
        searchableKeys={["codigo_interno", "modelo", "estado"]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "Codigo interno", key: "codigo_interno" },
          { title: "Modelo", key: "modelo" },
          { title: "Fecha adquisicion", key: "fecha_adquisicion" },
          { title: "Estado", key: "estado" },
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
                variant={sanitario.estado === "ACTIVO" ? "default" : "outline"}
              >
                {sanitario.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(sanitario)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  sanitario.baño_id && handleDeleteClick(sanitario.baño_id)
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
        open={isCreating || selectedSanitario !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedSanitario(null);
          }
        }}
        title={selectedSanitario ? "Editar Sanitario" : "Crear Sanitario"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          {(
            [
              ["codigo_interno", "Codigo interno"],
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

export default ListadoSanitariosComponent;
