"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Definir la interfaz para las condiciones contractuales
interface CondicionContractual {
  id?: string;
  nombre: string;
  descripcion: string;
  clienteId?: string;
  clienteNombre?: string;
  estado: "ACTIVO" | "INACTIVO";
  fechaCreacion?: string;
}

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

  const [conditions, setConditions] = useState<CondicionContractual[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCondition, setSelectedCondition] = useState<CondicionContractual | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createConditionSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    estado: z.enum(["ACTIVO", "INACTIVO"], {
      errorMap: () => ({ message: "El estado es obligatorio" }),
    }),
  });

  const form = useForm<z.infer<typeof createConditionSchema>>({
    resolver: zodResolver(createConditionSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      estado: "ACTIVO",
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

  const handleEditClick = (condition: CondicionContractual) => {
    setSelectedCondition(condition);
    setIsCreating(false);

    const camposFormulario: (keyof CondicionContractual)[] = ["nombre", "descripcion", "estado"];

    camposFormulario.forEach((key) => setValue(key, condition[key]));
  };

  const handleCreateClick = () => {
    reset({
      nombre: "",
      descripcion: "",
      estado: "ACTIVO",
    });
    setSelectedCondition(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      // Aquí implementarías la llamada a la API para eliminar
      // await deleteCondition(id);
      toast.success("Condición eliminada", {
        description: "La condición contractual se ha eliminado correctamente.",
      });
      await fetchConditions();
    } catch (error) {
      console.error("Error al eliminar la condición:", error);
      toast.error("Error", { description: "No se pudo eliminar la condición." });
    }
  };

  const onSubmit = async (data: z.infer<typeof createConditionSchema>) => {
    try {
      if (selectedCondition && selectedCondition.id) {
        // Aquí implementarías la llamada a la API para editar
        // await editCondition(selectedCondition.id, data);
        toast.success("Condición actualizada", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        // Aquí implementarías la llamada a la API para crear
        // await createCondition(data);
        toast.success("Condición creada", {
          description: "La condición contractual se ha agregado correctamente.",
        });
      }

      await fetchConditions();
      setIsCreating(false);
      setSelectedCondition(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedCondition ? "No se pudo actualizar la condición." : "No se pudo crear la condición.",
      });
    }
  };

  const fetchConditions = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      // Aquí implementarías la llamada a la API para obtener datos
      // const fetchedConditions = await getContractualConditions(currentPage, itemsPerPage, search);
      // setConditions(fetchedConditions.items);
      // setTotal(fetchedConditions.total);
      // setPage(fetchedConditions.page);

      // Por ahora, no hacemos nada ya que no hay API implementada
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar las condiciones:", error);
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

  const columns = [
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Descripción", accessorKey: "descripcion" },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }: { row: any }) => (
        <TableCell>
          <Badge variant={row.original.estado === "ACTIVO" ? "default" : "destructive"}>{row.original.estado}</Badge>
        </TableCell>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "acciones",
      cell: ({ row }: { row: any }) => (
        <TableCell className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditClick(row.original)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(row.original.id)}>
            Eliminar
          </Button>
        </TableCell>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Condiciones Contractuales</h1>
        <Button variant="default" onClick={handleCreateClick} className="ml-auto">
          Crear Condición
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <ListadoTabla
          columns={columns}
          data={conditions}
          totalItems={total}
          currentPage={page}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
        />
      )}

      <FormDialog
        isOpen={isCreating || !!selectedCondition}
        onClose={() => {
          setIsCreating(false);
          setSelectedCondition(null);
        }}
        title={selectedCondition ? "Editar Condición Contractual" : "Crear Condición Contractual"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField label="Nombre" error={form.formState.errors.nombre?.message} required>
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                placeholder="Ej: Contrato Anual"
                {...field}
              />
            )}
          />
        </FormField>

        <FormField label="Descripción" error={form.formState.errors.descripcion?.message} required>
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <textarea
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                placeholder="Descripción detallada de la condición contractual"
                rows={3}
                {...field}
              />
            )}
          />
        </FormField>

        <FormField label="Estado" error={form.formState.errors.estado?.message} required>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <select
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                {...field}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            )}
          />
        </FormField>
      </FormDialog>
    </div>
  );
}
