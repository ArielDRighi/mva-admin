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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  FileCheck,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("todos");

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

  // Función para manejar creación
  const handleCreateClick = () => {
    reset({
      condiciones_especificas: "",
      estado: "Activo",
      fecha_inicio: "",
      fecha_fin: "",
      periodicidad: "Mensual",
      tarifa: "",
      tipo_de_contrato: "Temporal",
    });
    setSelectedCondicion(null);
    setIsCreating(true);
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

  // Función para manejar cambio de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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

  // Filtrar según el tab seleccionado
  const filteredCondiciones =
    activeTab === "todos"
      ? condiciones
      : condiciones.filter((condicion) => condicion.estado === activeTab);

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

  // Función para determinar la clase CSS del badge según el estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Inactivo":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "Finalizado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Cancelado":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Formatear la fecha para mostrarla en formato local
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Gestión de Condiciones Contractuales
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra las condiciones contractuales de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Condición Contractual
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
                <FileText className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="Activo" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Activos
              </TabsTrigger>
              <TabsTrigger value="Inactivo" className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Inactivos
              </TabsTrigger>
              <TabsTrigger value="Finalizado" className="flex items-center">
                <FileCheck className="mr-2 h-4 w-4" />
                Finalizados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredCondiciones}
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
            columns={[
              { title: "Detalles", key: "detalles" },
              { title: "Información del Contrato", key: "informacion" },
              { title: "Financieros", key: "financieros" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(condicion) => (
              <>
                <TableCell className="min-w-[250px]">
                  <div className="space-y-1">
                    <div className="font-medium">
                      Contrato #{condicion.condicionContractualId}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {condicion.condiciones_especificas}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[220px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Tag className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{condicion.tipo_de_contrato}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {formatDate(condicion.fecha_inicio)} -{" "}
                        {formatDate(condicion.fecha_fin)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{condicion.periodicidad}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>${condicion.tarifa}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(condicion.estado)}
                    className={getStatusBadgeClass(condicion.estado)}
                  >
                    {condicion.estado}
                  </Badge>
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(condicion)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      condicion.condicionContractualId &&
                      handleDeleteClick(condicion.condicionContractualId)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
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
          </div>

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
      </FormDialog>
    </Card>
  );
}
