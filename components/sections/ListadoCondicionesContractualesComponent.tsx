"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";

// Definir el tipo para la condición contractual
type CondicionContractual = {
  condicionContractualId: number;
  condiciones_especificas: string;
  estado: string;
  fecha_fin: string;
  fecha_inicio: string;
  periodicidad: string;
  tarifa: string;
  tipo_de_contrato: string;
};

// Tipo para la respuesta de la API
type CondicionesContractualesResponse = {
  items: CondicionContractual[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function ListadoCondicionesContractualesComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: CondicionContractual[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Asegurarnos de que data siempre sea un array
  const safeData = Array.isArray(data) ? data : [];

  // Estado para manejar los datos
  const [condiciones, setCondiciones] =
    useState<CondicionContractual[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCondicion, setSelectedCondicion] =
    useState<CondicionContractual | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  console.log("condiciones", condiciones);
  console.log("safeData", safeData);

  // Esquema de validación para las condiciones contractuales
  const condicionContractualSchema = z.object({
    condiciones_especificas: z
      .string()
      .min(1, "Las condiciones específicas son obligatorias"),
    estado: z.string().min(1, "El estado es obligatorio"),
    fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fecha_fin: z.string().min(1, "La fecha de fin es obligatoria"),
    periodicidad: z.string().min(1, "La periodicidad es obligatoria"),
    tarifa: z.string().min(1, "La tarifa es obligatoria"),
    tipo_de_contrato: z.string().min(1, "El tipo de contrato es obligatorio"),
  });

  const form = useForm<z.infer<typeof condicionContractualSchema>>({
    resolver: zodResolver(condicionContractualSchema),
    defaultValues: {
      condiciones_especificas: "",
      estado: "Activo",
      fecha_inicio: "",
      fecha_fin: "",
      periodicidad: "Mensual",
      tarifa: "",
      tipo_de_contrato: "Temporal",
    },
  });

  const { handleSubmit, reset, setValue, control } = form;

  // Función para manejar cambio de página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
    setPage(page);
  };

  // Función para manejar búsqueda
  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Función para manejar edición
  const handleEditClick = (condicion: CondicionContractual) => {
    setSelectedCondicion(condicion);
    setValue("condiciones_especificas", condicion.condiciones_especificas);
    setValue("estado", condicion.estado);
    setValue("fecha_inicio", condicion.fecha_inicio);
    setValue("fecha_fin", condicion.fecha_fin);
    setValue("periodicidad", condicion.periodicidad);
    setValue("tarifa", condicion.tarifa);
    setValue("tipo_de_contrato", condicion.tipo_de_contrato);
    setIsCreating(false);
  };

  // Función para manejar eliminación
  const handleDeleteClick = async (id: number) => {
    try {
      // Aquí iría la lógica para eliminar la condición contractual
      // Simulamos eliminación en el estado local
      setCondiciones(
        condiciones.filter((c) => c.condicionContractualId !== id)
      );
      toast.success("Condición contractual eliminada", {
        description: "La condición contractual se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar la condición contractual:", error);
      toast.error("Error", {
        description: "No se pudo eliminar la condición contractual.",
      });
    }
  };

  // Función para manejar el envío del formulario
  const onSubmit = async (data: z.infer<typeof condicionContractualSchema>) => {
    try {
      if (isCreating) {
        // Simulamos creación de una nueva condición
        const newId =
          condiciones.length > 0
            ? Math.max(...condiciones.map((c) => c.condicionContractualId)) + 1
            : 1;

        const newCondicion: CondicionContractual = {
          condicionContractualId: newId,
          ...data,
        };

        setCondiciones([...condiciones, newCondicion]);
        toast.success("Condición contractual creada", {
          description: "La condición contractual se ha creado correctamente.",
        });
      } else if (selectedCondicion) {
        // Simulamos actualización de condición existente
        const updatedCondiciones = condiciones.map((c) =>
          c.condicionContractualId === selectedCondicion.condicionContractualId
            ? { ...c, ...data }
            : c
        );

        setCondiciones(updatedCondiciones);
        toast.success("Condición contractual actualizada", {
          description:
            "La condición contractual se ha actualizado correctamente.",
        });
      }

      setIsCreating(false);
      setSelectedCondicion(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedCondicion
          ? "No se pudo actualizar la condición contractual."
          : "No se pudo crear la condición contractual.",
      });
    }
  };

  // Actualiza el estado cuando cambian las props
  useEffect(() => {
    if (isFirstLoad) {
      setCondiciones(safeData);
      setTotal(totalItems);
      setPage(currentPage);
      setIsFirstLoad(false);
    }
  }, [safeData, totalItems, currentPage, isFirstLoad]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  // Función para determinar la variante del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<
      string,
      "default" | "outline" | "secondary" | "destructive"
    > = {
      Activo: "default",
      Inactivo: "outline",
      Finalizado: "secondary",
      Cancelado: "destructive",
    };
    return variants[status] || "outline";
  };

  // Formatear la fecha para mostrarla en formato local
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  return (
    <>
      <ListadoTabla
        title="Listado de Condiciones Contractuales"
        data={condiciones}
        itemsPerPage={itemsPerPage}
        searchableKeys={[
          "condiciones_especificas",
          "tipo_de_contrato",
          "periodicidad",
        ]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        addButton={
          <Button
            onClick={() =>
              router.push("/dashboard/condiciones-contractuales/crear")
            }
            className="whitespace-nowrap"
          >
            Crear Condición Contractual
          </Button>
        }
        columns={[
          { title: "ID", key: "condicionContractualId" },
          { title: "Condiciones Específicas", key: "condiciones_especificas" },
          { title: "Tipo de Contrato", key: "tipo_de_contrato" },
          { title: "Fecha Inicio", key: "fecha_inicio" },
          { title: "Fecha Fin", key: "fecha_fin" },
          { title: "Periodicidad", key: "periodicidad" },
          { title: "Tarifa", key: "tarifa" },
          { title: "Estado", key: "estado" },
          { title: "Acciones", key: "acciones" },
        ]}
        renderRow={(condicion) => (
          <>
            <TableCell className="font-medium">
              {condicion.condicionContractualId}
            </TableCell>
            <TableCell>{condicion.condiciones_especificas}</TableCell>
            <TableCell>{condicion.tipo_de_contrato}</TableCell>
            <TableCell>{formatDate(condicion.fecha_inicio)}</TableCell>
            <TableCell>{formatDate(condicion.fecha_fin)}</TableCell>
            <TableCell>{condicion.periodicidad}</TableCell>
            <TableCell>${condicion.tarifa}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(condicion.estado)}>
                {condicion.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(condicion)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  condicion.condicionContractualId &&
                  handleDeleteClick(condicion.condicionContractualId)
                }
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
      />

      <FormDialog
        open={selectedCondicion !== null || isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCondicion(null);
            setIsCreating(false);
          }
        }}
        title={
          isCreating
            ? "Crear Condición Contractual"
            : "Editar Condición Contractual"
        }
        description={
          isCreating
            ? "Completa el formulario para crear una nueva condición contractual."
            : "Modifica los datos de la condición contractual."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          <Controller
            name="condiciones_especificas"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Condiciones Específicas"
                name="condiciones_especificas"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                type="textarea"
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="fecha_inicio"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Fecha de Inicio"
                  name="fecha_inicio"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  type="date"
                />
              )}
            />

            <Controller
              name="fecha_fin"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Fecha de Fin"
                  name="fecha_fin"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  type="date"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="tipo_de_contrato"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Tipo de Contrato"
                  name="tipo_de_contrato"
                  fieldType="select"
                  value={field.value}
                  onChange={(value: string) => field.onChange(value)}
                  options={[
                    { label: "Temporal", value: "Temporal" },
                    { label: "Permanente", value: "Permanente" },
                    { label: "Por Evento", value: "Por Evento" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="periodicidad"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Periodicidad"
                  name="periodicidad"
                  fieldType="select"
                  value={field.value}
                  onChange={(value: string) => field.onChange(value)}
                  options={[
                    { label: "Diaria", value: "Diaria" },
                    { label: "Semanal", value: "Semanal" },
                    { label: "Quincenal", value: "Quincenal" },
                    { label: "Mensual", value: "Mensual" },
                    { label: "Trimestral", value: "Trimestral" },
                    { label: "Semestral", value: "Semestral" },
                    { label: "Anual", value: "Anual" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="tarifa"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Tarifa"
                  name="tarifa"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  type="number"
                  prefix="$"
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
                  value={field.value}
                  onChange={(value: string) => field.onChange(value)}
                  options={[
                    { label: "Activo", value: "Activo" },
                    { label: "Inactivo", value: "Inactivo" },
                    { label: "Finalizado", value: "Finalizado" },
                    { label: "Cancelado", value: "Cancelado" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        </>
      </FormDialog>
    </>
  );
}
