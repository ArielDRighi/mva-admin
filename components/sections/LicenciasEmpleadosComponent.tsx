"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import {
  CreateEmployeeLeaveDto,
  UpdateEmployeeLeaveDto,
  LeaveType,
} from "@/types/types";
import { TableCell } from "../ui/table";
import { useCallback, useEffect, useState } from "react";
import {
  getEmployeeLeaves,
  createEmployeeLeave,
  updateEmployeeLeave,
  deleteEmployeeLeave,
  approveEmployeeLeave,
  rejectEmployeeLeave,
} from "@/app/actions/LicenciasEmpleados";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getEmployees } from "@/app/actions/empleados";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserRound,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  Calendar,
  FileText,
  Plus,
  RefreshCcw,
} from "lucide-react";

export default function LicenciasEmpleadosComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: any[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Asegurar que data siempre sea un array
  const safeData = Array.isArray(data) ? data : [];

  const [licencias, setLicencias] = useState<any[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLicencia, setSelectedLicencia] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");

  // Esquema para validación de formulario

  const createLicenciaSchema = z.object({
    employeeId: z.number({
      required_error: "El empleado es obligatorio",
      invalid_type_error: "El empleado es obligatorio",
    }),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
    tipoLicencia: z.enum(
      [
        LeaveType.VACACIONES,
        LeaveType.CASAMIENTO,
        LeaveType.ENFERMEDAD,
        LeaveType.FALLECIMIENTO_FAMILIAR,
        LeaveType.NACIMIENTO,
        LeaveType.ORDINARIA,
        LeaveType.CAPACITACION,
      ],
      {
        errorMap: () => ({ message: "El tipo de licencia es obligatorio" }),
      }
    ),
    notas: z.string().optional(),
    aprobado: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof createLicenciaSchema>>({
    resolver: zodResolver(createLicenciaSchema),
    defaultValues: {
      employeeId: 0,
      fechaInicio: "",
      fechaFin: "",
      tipoLicencia: LeaveType.VACACIONES,
      notas: "",
      aprobado: false,
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

  const handleEditClick = (licencia: any) => {
    setSelectedLicencia(licencia);
    setIsCreating(false);

    console.log("Licencia a editar:", licencia); // Para depuración

    // Mapeo de campos del API a nuestro esquema
    const mappedLicencia = {
      employeeId: licencia.employee_id || licencia.employeeId,
      fechaInicio: licencia.start_date || licencia.fechaInicio,
      fechaFin: licencia.end_date || licencia.fechaFin,
      tipoLicencia: licencia.type || licencia.tipoLicencia,
      notas: licencia.observations || licencia.reason || licencia.notas || "",
      // Map the new status field to a boolean for the form
      aprobado: licencia.status === "APROBADO",
    };

    // Establecer todos los valores en el formulario
    Object.keys(mappedLicencia).forEach((key) => {
      const typedKey = key as keyof typeof mappedLicencia;
      const value = mappedLicencia[typedKey];

      if (value !== undefined) {
        if (key === "fechaInicio" || key === "fechaFin") {
          // Convertir la fecha a formato YYYY-MM-DD para input type="date"
          const dateValue =
            value instanceof Date
              ? value.toISOString().split("T")[0]
              : new Date(value).toISOString().split("T")[0];
          setValue(typedKey as any, dateValue);
        } else {
          setValue(typedKey as any, value);
        }
      }
    });

    // Log para verificar que se hayan establecido correctamente los valores
    console.log("Formulario con valores cargados:", form.getValues());
  };

  const handleCreateClick = () => {
    reset({
      employeeId: 0,
      fechaInicio: "",
      fechaFin: "",
      tipoLicencia: LeaveType.VACACIONES,
      notas: "",
      aprobado: false,
    });
    setSelectedLicencia(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteEmployeeLeave(id);
      toast.success("Licencia eliminada", {
        description: "La licencia se ha eliminado correctamente.",
      });
      await fetchLicencias();
    } catch (error) {
      console.error("Error al eliminar la licencia:", error);
      toast.error("Error", { description: "No se pudo eliminar la licencia." });
    }
  };

  const handleApproveClick = async (id: number) => {
    try {
      await approveEmployeeLeave(id);
      toast.success("Licencia aprobada", {
        description: "La licencia ha sido aprobada.",
      });
      await fetchLicencias();
    } catch (error) {
      console.error("Error al aprobar la licencia:", error);
      toast.error("Error", { description: "No se pudo aprobar la licencia." });
    }
  };

  const handleRejectClick = async (id: number) => {
    try {
      await rejectEmployeeLeave(id);
      toast.success("Licencia rechazada", {
        description: "La licencia ha sido rechazada.",
      });
      await fetchLicencias();
    } catch (error) {
      console.error("Error al rechazar la licencia:", error);
      toast.error("Error", { description: "No se pudo rechazar la licencia." });
    }
  };

  const onSubmit = async (data: z.infer<typeof createLicenciaSchema>) => {
    try {
      if (selectedLicencia && selectedLicencia.id) {
        const updateData: UpdateEmployeeLeaveDto = {
          employeeId: data.employeeId,
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
          tipoLicencia: data.tipoLicencia,
          notas: data.notas,
          // Convert the boolean to the corresponding status string if needed by your API
          status: data.aprobado ? "APROBADO" : "PENDIENTE",
        };
        await updateEmployeeLeave(selectedLicencia.id, updateData);
        toast.success("Licencia actualizada", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        const createData: CreateEmployeeLeaveDto = {
          employeeId: data.employeeId,
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
          tipoLicencia: data.tipoLicencia,
          notas: data.notas,
          // For new leaves, use PENDIENTE as default status
        };
        await createEmployeeLeave(createData);
        toast.success("Licencia creada", {
          description: "La licencia se ha creado correctamente.",
        });
      }

      await fetchLicencias();
      setIsCreating(false);
      setSelectedLicencia(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedLicencia
          ? "No se pudo actualizar la licencia."
          : "No se pudo crear la licencia.",
      });
    }
  };

  const fetchLicencias = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedLicencias = await getEmployeeLeaves(
        currentPage,
        itemsPerPage,
        search
      );

      if (Array.isArray(fetchedLicencias)) {
        // Handle case where response is directly an array
        setLicencias(fetchedLicencias);
        setTotal(fetchedLicencias.length); // You might need a better way to get total count
        setPage(currentPage);
      } else if (
        fetchedLicencias.data &&
        Array.isArray(fetchedLicencias.data)
      ) {
        setLicencias(fetchedLicencias.data);
        setTotal(fetchedLicencias.totalItems || 0);
        setPage(fetchedLicencias.currentPage || 1);
      } else if (
        fetchedLicencias.items &&
        Array.isArray(fetchedLicencias.items)
      ) {
        setLicencias(fetchedLicencias.items);
        setTotal(fetchedLicencias.total || 0);
        setPage(fetchedLicencias.page || 1);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedLicencias);
      }
    } catch (error) {
      console.error("Error al cargar las licencias:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  const fetchEmpleados = useCallback(async () => {
    try {
      const fetchedEmpleados = await getEmployees();
      if (fetchedEmpleados.data && Array.isArray(fetchedEmpleados.data)) {
        setEmpleados(fetchedEmpleados.data);
      } else if (
        fetchedEmpleados.items &&
        Array.isArray(fetchedEmpleados.items)
      ) {
        setEmpleados(fetchedEmpleados.items);
      }
    } catch (error) {
      console.error("Error al cargar los empleados:", error);
    }
  }, []);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchLicencias();
    }
  }, [fetchLicencias, isFirstLoad]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Función para manejar el cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Move these function definitions BEFORE they are used
  const getApprovalStatus = (licencia: any) => {
    // Check for direct status field first
    if (licencia.status) {
      if (licencia.status === "APROBADO") return "APPROVED";
      if (licencia.status === "RECHAZADO") return "REJECTED";
      if (licencia.status === "PENDIENTE") return "PENDING";
    }

    // Fall back to the old aprobado boolean field if status isn't present
    if (licencia.aprobado === true) return "APPROVED";
    if (licencia.aprobado === false && licencia.status === "REJECTED")
      return "REJECTED";
    return "PENDING";
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "outline" | "destructive"> = {
      PENDING: "outline",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return variants[status] || "outline";
  };

  const filteredLicencias =
    activeTab === "todos"
      ? licencias
      : licencias.filter((licencia) => {
          const status = getApprovalStatus(licencia);
          return status === activeTab.toUpperCase();
        });

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
              Licencias de Empleados
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Administra las licencias y permisos del personal
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Licencia
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
                Todas
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center">
                <PauseCircle className="mr-2 h-4 w-4" />
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobadas
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Rechazadas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredLicencias}
            itemsPerPage={itemsPerPage}
            searchableKeys={[
              "employee.nombre",
              "employee.documento",
              "tipoLicencia",
              "notas",
            ]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "Empleado", key: "employee" },
              { title: "Tipo", key: "tipoLicencia" },
              { title: "Periodo", key: "fechas" },
              { title: "Estado", key: "status" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(licencia) => (
              <>
                <TableCell className="min-w-[250px]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {licencia.employee?.nombre}{" "}
                        {licencia.employee?.apellido}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {licencia.employee?.cargo || ""}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[180px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm font-medium">
                      <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {licencia.tipoLicencia || licencia.type}
                    </div>
                    {licencia.notas && (
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {licencia.notas}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="min-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        Desde:{" "}
                        {(licencia.fechaInicio || licencia.start_date) &&
                          new Date(
                            licencia.fechaInicio || licencia.start_date
                          ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        Hasta:{" "}
                        {(licencia.fechaFin || licencia.end_date) &&
                          new Date(
                            licencia.fechaFin || licencia.end_date
                          ).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={getStatusBadgeVariant(getApprovalStatus(licencia))}
                    className={
                      getApprovalStatus(licencia) === "APPROVED"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : getApprovalStatus(licencia) === "REJECTED"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }
                  >
                    {getApprovalStatus(licencia) === "APPROVED"
                      ? "Aprobada"
                      : getApprovalStatus(licencia) === "REJECTED"
                      ? "Rechazada"
                      : "Pendiente"}
                  </Badge>
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(licencia)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>

                  {getApprovalStatus(licencia) === "PENDING" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          licencia.id && handleApproveClick(licencia.id)
                        }
                        className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Aprobar
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          licencia.id && handleRejectClick(licencia.id)
                        }
                        className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                      >
                        <PauseCircle className="h-3.5 w-3.5 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      licencia.id && handleDeleteClick(licencia.id)
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
        open={isCreating || selectedLicencia !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedLicencia(null);
          }
        }}
        title={selectedLicencia ? "Editar Licencia" : "Crear Licencia"}
        description={
          selectedLicencia
            ? "Modificar la información de la licencia seleccionada."
            : "Completa el formulario para registrar una nueva licencia."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <>
          <Controller
            name="employeeId"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Empleado"
                name="employeeId"
                fieldType="select"
                value={field.value?.toString() || ""}
                onChange={(selectedValue: string) =>
                  field.onChange(Number(selectedValue))
                }
                options={empleados.map((emp) => ({
                  label: `${emp.nombre} ${emp.apellido}`,
                  value: emp.id.toString(),
                }))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="tipoLicencia"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Tipo de Licencia"
                name="tipoLicencia"
                fieldType="select"
                value={field.value || ""}
                onChange={(selectedValue: string) =>
                  field.onChange(selectedValue)
                }
                options={[
                  { label: "Vacaciones", value: LeaveType.VACACIONES },
                  {
                    label: "Licencia Médica",
                    value: LeaveType.ENFERMEDAD,
                  },
                  {
                    label: "Licencia Personal",
                    value: LeaveType.ORDINARIA,
                  },
                  {
                    label: "Fallecimiento Familiar",
                    value: LeaveType.FALLECIMIENTO_FAMILIAR,
                  },
                  { label: "Casamiento", value: LeaveType.CASAMIENTO },
                  { label: "Nacimiento", value: LeaveType.NACIMIENTO },
                  { label: "Capacitacion", value: LeaveType.CAPACITACION },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaInicio"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de Inicio"
                name="fechaInicio"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="fechaFin"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Fecha de Fin"
                name="fechaFin"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="notas"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Notas"
                name="notas"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {!isCreating && (
            <Controller
              name="aprobado"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Estado"
                  name="aprobado"
                  fieldType="select"
                  value={field.value?.toString() || ""}
                  onChange={(selectedValue: string) =>
                    field.onChange(selectedValue === "true")
                  }
                  options={[
                    { label: "Pendiente", value: "false" },
                    { label: "Aprobada", value: "true" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}
        </>
      </FormDialog>
    </Card>
  );
}
