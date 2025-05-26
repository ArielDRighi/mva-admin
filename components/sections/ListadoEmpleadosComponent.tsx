"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { CreateEmployee, Empleado, EmpleadoFormulario } from "@/types/types";
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
import {
  UserRound,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  BadgeInfo,
  Mail,
  Phone,
  Briefcase,
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

  const safeData = Array.isArray(data) ? data : [];

  const [employees, setEmployees] = useState<Empleado[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
    estado: z.enum(["ASIGNADO", "DISPONIBLE", "SUSPENDIDO"], {
      errorMap: () => ({ message: "El estado es obligatorio" }),
    }),
    numero_legajo: z.coerce.number({
      required_error: "El número de legajo es obligatorio",
      invalid_type_error: "El número de legajo debe ser numérico",
    }),
    cuil: z
      .string()
      .min(11, "El CUIL debe tener entre 11 y 20 caracteres")
      .max(20, "El CUIL debe tener entre 11 y 20 caracteres"),
    cbu: z
      .string()
      .min(11, "El CBU debe tener entre 11 y 20 caracteres")
      .max(20, "El CBU debe tener entre 11 y 20 caracteres"),
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
      estado: "ASIGNADO",
      numero_legajo: undefined,
      cuil: "",
      cbu: "",
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
      "numero_legajo",
      "cuil",
      "cbu",
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
      estado: "ASIGNADO",
      numero_legajo: undefined,
      cuil: "",
      cbu: "",
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
        const createData: CreateEmployee = {
          ...data,
          fecha_contratacion: new Date().toISOString().split("T")[0],
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

      if (fetchedEmployees.data && Array.isArray(fetchedEmployees.data)) {
        setEmployees(fetchedEmployees.data);
        setTotal(fetchedEmployees.totalItems || 0);
        setPage(fetchedEmployees.currentPage || 1);
      } else if (
        fetchedEmployees.items &&
        Array.isArray(fetchedEmployees.items)
      ) {
        setEmployees(fetchedEmployees.items);
        setTotal(fetchedEmployees.total || 0);
        setPage(fetchedEmployees.page || 1);
      } else if (Array.isArray(fetchedEmployees)) {
        setEmployees(fetchedEmployees);
        setTotal(fetchedEmployees.length);
        setPage(currentPage);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedEmployees);
      }
    } catch (error) {
      console.error("Error al cargar los empleados:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredEmployees =
    activeTab === "todos"
      ? employees
      : employees.filter((emp) => emp.estado === activeTab.toUpperCase());

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
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
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Gestión de Personal
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra la información de empleados de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Empleado
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
                <UserRound className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>{" "}
              <TabsTrigger value="asignado" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Asignados
              </TabsTrigger>
              <TabsTrigger value="suspendido" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Suspendidos
              </TabsTrigger>
              <TabsTrigger value="disponible" className="flex items-center">
                <BadgeInfo className="mr-2 h-4 w-4" />
                Disponibles
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredEmployees}
            itemsPerPage={itemsPerPage}
            searchableKeys={["nombre", "apellido", "documento", "email"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "Empleado", key: "empleado" },
              { title: "Contacto", key: "contacto" },
              { title: "Información", key: "informacion" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(empleado) => (
              <>
                <TableCell className="min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">{`${empleado.nombre} ${empleado.apellido}`}</div>
                      <div className="text-sm text-muted-foreground">{`Legajo: ${
                        empleado.numero_legajo || "N/A"
                      }`}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[220px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{empleado.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{empleado.telefono}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{empleado.cargo}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        {empleado.fecha_contratacion &&
                          new Date(
                            empleado.fecha_contratacion
                          ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {" "}
                  <Badge
                    variant={
                      empleado.estado === "ASIGNADO"
                        ? "default"
                        : empleado.estado === "SUSPENDIDO"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      empleado.estado === "ASIGNADO"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : empleado.estado === "SUSPENDIDO"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      empleado.id && handleDeleteClick(empleado.id)
                    }
                    className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>{" "}
                  <div className="ml-1">
                    {empleado.estado !== "ASIGNADO" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          empleado.id &&
                          handleChangeStatus(empleado.id, "ASIGNADO")
                        }
                        className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Asignar
                      </Button>
                    )}

                    {empleado.estado !== "SUSPENDIDO" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          empleado.id &&
                          handleChangeStatus(empleado.id, "SUSPENDIDO")
                        }
                        className="cursor-pointer"
                      >
                        <PauseCircle className="h-3.5 w-3.5 mr-1" />
                        Suspender
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
        open={isCreating || selectedEmployee !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedEmployee(null);
          }
        }}
        title={selectedEmployee ? "Editar Empleado" : "Crear Empleado"}
        description={
          selectedEmployee
            ? "Modificar información del empleado en el sistema."
            : "Completa el formulario para registrar un nuevo empleado."
        }
        onSubmit={handleSubmit(onSubmit)}
        // Remove className prop as it's not accepted by FormDialog
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Controller
            name="nombre"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Nombre"
                name="nombre"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el nombre"
              />
            )}
          />

          <Controller
            name="apellido"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Apellido"
                name="apellido"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el apellido"
              />
            )}
          />

          <Controller
            name="documento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Número de Documento"
                name="documento"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: 35789654"
              />
            )}
          />

          <Controller
            name="fecha_nacimiento"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                type="date"
              />
            )}
          />

          <Controller
            name="direccion"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Dirección"
                name="direccion"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Dirección completa"
              />
            )}
          />

          <Controller
            name="telefono"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Teléfono"
                name="telefono"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: 123-4567-8901"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Email"
                name="email"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="correo@ejemplo.com"
              />
            )}
          />

          <Controller
            name="cargo"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Cargo"
                name="cargo"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Cargo o puesto"
              />
            )}
          />

          <Controller
            name="numero_legajo"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Número de Legajo"
                name="numero_legajo"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                type="number"
                placeholder="Ej: 12345"
              />
            )}
          />

          <Controller
            name="cuil"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="CUIL"
                name="cuil"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: 20-35789654-0"
              />
            )}
          />

          <Controller
            name="cbu"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="CBU"
                name="cbu"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el CBU"
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
                  { label: "Asignado", value: "ASIGNADO" },
                  { label: "Disponible", value: "DISPONIBLE" },
                  { label: "Suspendido", value: "SUSPENDIDO" },
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
