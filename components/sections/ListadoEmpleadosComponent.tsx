"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import {
  CreateEmployee,
  Empleado,
  EmpleadoFormulario,
  StatusEmployee,
} from "@/types/types";
import { TableCell } from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import {
  createEmployee,
  getEmployees,
  deleteEmployee,
  editEmployee,
  changeEmployeeStatus,
} from "@/app/actions/empleados";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ListadoEmpleadosComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Empleado[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Asegurarnos de que data siempre sea un array
  const safeData = Array.isArray(data) ? data : [];

  const [employees, setEmployees] = useState<Empleado[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  // Añadir este estado para controlar la carga inicial
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  console.log("employees:", employees);

  const createEmployeeSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido: z.string().min(1, "El apellido es obligatorio"),
    documento: z.string().min(1, "El documento es obligatorio"),
    fecha_nacimiento: z
      .string()
      .min(1, "La fecha de nacimiento es obligatoria"),
    direccion: z.string().min(1, "La dirección es obligatoria"),
    telefono: z
      .string()
      .regex(
        /^\d{3}-\d{4}-\d{4}$/,
        "Formato de teléfono incorrecto, debe ser xxx-xxxx-xxxx"
      )
      .or(z.string().regex(/^\d{10,11}$/, "Debe tener entre 10 y 11 dígitos")),
    email: z
      .string()
      .regex(
        /^[^@]+@[^@]+\.[^@]+$/,
        "Formato de email inválido, ejemplo: empleado@empresa.com"
      ),
    cargo: z.string().min(1, "El puesto es obligatorio"),
    estado: z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO"], {
      errorMap: () => ({ message: "El estado es obligatorio" }),
    }),
  });

  const form = useForm<z.infer<typeof createEmployeeSchema>>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      documento: "",
      fecha_nacimiento: "",
      direccion: "",
      telefono: "",
      email: "",
      cargo: "",
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

  const handleEditClick = (empleado: Empleado) => {
    setSelectedEmployee(empleado);
    setIsCreating(false);

    const camposFormulario: (keyof EmpleadoFormulario)[] = [
      "nombre",
      "apellido",
      "documento",
      "fecha_nacimiento",
      "direccion",
      "telefono",
      "email",
      "cargo",
      "estado",
    ];

    camposFormulario.forEach((key) => {
      const value = empleado[key];
      if (value !== undefined) {
        if (key === "fecha_nacimiento" && value instanceof Date) {
          setValue(key, value.toISOString().split("T")[0]);
        } else {
          setValue(key, String(value));
        }
      }
    });
  };

  const handleCreateClick = () => {
    reset({
      nombre: "",
      apellido: "",
      documento: "",
      fecha_nacimiento: "",
      direccion: "",
      telefono: "",
      email: "",
      cargo: "",
      estado: "ACTIVO",
    });
    setSelectedEmployee(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteEmployee(id);
      toast.success("Empleado eliminado", {
        description: "El empleado se ha eliminado correctamente.",
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Error al eliminar el empleado:", error);
      toast.error("Error", { description: "No se pudo eliminar el empleado." });
    }
  };

  const handleChangeStatus = async (id: number, estado: string) => {
    try {
      await changeEmployeeStatus(id, estado);
      toast.success("Estado actualizado", {
        description: `El empleado ahora está ${estado}.`,
      });
      await fetchEmployees();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      toast.error("Error", { description: "No se pudo cambiar el estado." });
    }
  };

  const onSubmit = async (data: z.infer<typeof createEmployeeSchema>) => {
    try {
      if (selectedEmployee && selectedEmployee.id) {
        await editEmployee(selectedEmployee.id, data);
        toast.success("Empleado actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        // Add required missing properties for CreateEmployee type
        const createData: CreateEmployee = {
          ...data,
          fecha_contratacion: new Date().toISOString().split("T")[0],
          cargo: data.cargo,
        };
        await createEmployee(createData);
        toast.success("Empleado creado", {
          description: "El empleado se ha agregado correctamente.",
        });
      }

      await fetchEmployees();
      setIsCreating(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedEmployee
          ? "No se pudo actualizar el empleado."
          : "No se pudo crear el empleado.",
      });
    }
  };

  // Modificar fetchEmployees para manejar correctamente diferentes estructuras de respuesta
  const fetchEmployees = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedEmployees = await getEmployees(
        currentPage,
        itemsPerPage,
        search
      );

      // Manejar diferentes estructuras de respuesta
      if (fetchedEmployees.data && Array.isArray(fetchedEmployees.data)) {
        // Si la estructura es {data: [...], totalItems: x, currentPage: y}
        setEmployees(fetchedEmployees.data);
        setTotal(fetchedEmployees.totalItems || 0);
        setPage(fetchedEmployees.currentPage || 1);
      } else if (
        fetchedEmployees.items &&
        Array.isArray(fetchedEmployees.items)
      ) {
        // Si la estructura es {items: [...], total: x, page: y}
        setEmployees(fetchedEmployees.items);
        setTotal(fetchedEmployees.total || 0);
        setPage(fetchedEmployees.page || 1);
      } else if (Array.isArray(fetchedEmployees)) {
        // Si directamente es un array de empleados
        setEmployees(fetchedEmployees);
        setTotal(fetchedEmployees.length);
        setPage(currentPage);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedEmployees);
        // No borrar datos existentes si la respuesta es inválida
      }
    } catch (error) {
      console.error("Error al cargar los empleados:", error);
      // No borrar datos existentes en caso de error
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  // Modificar el useEffect para evitar la recarga inicial innecesaria
  useEffect(() => {
    if (isFirstLoad) {
      // En la primera carga, ya tenemos los datos del servidor,
      // solo marcamos que ya pasó la primera carga
      setIsFirstLoad(false);
    } else {
      // En cargas posteriores (cuando cambian los parámetros), sí hacemos fetch
      fetchEmployees();
    }
  }, [fetchEmployees, isFirstLoad]);

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
        title="Listado de Empleados"
        data={Array.isArray(employees) ? employees : []} // Asegurar que siempre sea un array
        itemsPerPage={itemsPerPage}
        searchableKeys={["nombre", "apellido", "documento", "email"]}
        remotePagination
        totalItems={total}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        columns={[
          { title: "Nombre", key: "nombre" },
          { title: "Apellido", key: "apellido" },
          { title: "Documento", key: "documento" },
          { title: "Teléfono", key: "telefono" },
          { title: "Email", key: "email" },
          { title: "Puesto", key: "puesto" },
          { title: "Registro", key: "fecha_registro" },
          { title: "Estado", key: "estado" },
          { title: "Acciones", key: "acciones" },
        ]}
        renderRow={(empleado) => (
          <>
            <TableCell className="font-medium">{empleado.nombre}</TableCell>
            <TableCell>{empleado.apellido}</TableCell>
            <TableCell>{`DNI: ${empleado.documento}`}</TableCell>
            <TableCell>{empleado.telefono}</TableCell>
            <TableCell>{empleado.email}</TableCell>
            <TableCell>{empleado.cargo}</TableCell>
            <TableCell>
              {empleado.fecha_contratacion &&
                new Date(empleado.fecha_contratacion).toLocaleDateString(
                  "es-AR"
                )}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  empleado.estado === "ACTIVO"
                    ? "default"
                    : empleado.estado === "SUSPENDIDO"
                    ? "destructive"
                    : "outline"
                }
              >
                {empleado.estado}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(empleado)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => empleado.id && handleDeleteClick(empleado.id)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
              {empleado.estado !== "ACTIVO" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    empleado.id && handleChangeStatus(empleado.id, "ACTIVO")
                  }
                  className="cursor-pointer"
                >
                  Activar
                </Button>
              )}
              {empleado.estado !== "SUSPENDIDO" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    empleado.id && handleChangeStatus(empleado.id, "SUSPENDIDO")
                  }
                  className="cursor-pointer"
                >
                  Suspender
                </Button>
              )}
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar empleado
          </Button>
        }
      />

      {/* Resto del componente permanece igual... */}
      <FormDialog
        open={isCreating || selectedEmployee !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedEmployee(null);
          }
        }}
        title={selectedEmployee ? "Editar Empleado" : "Crear Empleado"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Resto del formulario permanece igual... */}
        <>
          {(
            [
              ["nombre", "Nombre"],
              ["apellido", "Apellido"],
              ["documento", "Número de Documento"],
              ["fecha_nacimiento", "Fecha de Nacimiento"],
              ["direccion", "Dirección"],
              ["telefono", "Teléfono"],
              ["email", "Email"],
              ["cargo", "Cargo"],
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
                  type={name === "fecha_nacimiento" ? "date" : "text"}
                />
              )}
            />
          ))}

          {/* Campo para el estado */}
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
                  { label: "Activo", value: "ACTIVO" },
                  { label: "Inactivo", value: "INACTIVO" },
                  { label: "Suspendido", value: "SUSPENDIDO" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
        </>
      </FormDialog>
    </>
  );
}
