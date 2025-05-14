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
        LeaveType.LICENCIA_MEDICA,
        LeaveType.LICENCIA_PERSONAL,
        LeaveType.CAPACITACION,
        LeaveType.OTRO,
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
      aprobado: licencia.status === "APPROVED" || licencia.aprobado === true,
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

  const onSubmit = async (data: z.infer<typeof createLicenciaSchema>) => {
    try {
      if (selectedLicencia && selectedLicencia.id) {
        const updateData: UpdateEmployeeLeaveDto = {
          employeeId: data.employeeId,
          fechaInicio: new Date(data.fechaInicio),
          fechaFin: new Date(data.fechaFin),
          tipoLicencia: data.tipoLicencia,
          notas: data.notas,
          aprobado: data.aprobado,
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
          aprobado: data.aprobado,
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

      if (fetchedLicencias.data && Array.isArray(fetchedLicencias.data)) {
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

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  // Mapea el estado de aprobación a los valores de visualización
  const getApprovalStatus = (licencia: any) => {
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

  return (
    <>
      <ListadoTabla
        title="Licencias de Empleados"
        data={Array.isArray(licencias) ? licencias : []}
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
          { title: "Inicio", key: "fechaInicio" },
          { title: "Fin", key: "fechaFin" },
          { title: "Estado", key: "status" },
          { title: "Acciones", key: "acciones" },
        ]}
        renderRow={(licencia) => (
          <>
            <TableCell className="font-medium">
              {licencia.employee?.nombre} {licencia.employee?.apellido}
            </TableCell>
            <TableCell>{licencia.tipoLicencia || licencia.type}</TableCell>
            <TableCell>
              {(licencia.fechaInicio || licencia.start_date) &&
                new Date(
                  licencia.fechaInicio || licencia.start_date
                ).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              {(licencia.fechaFin || licencia.end_date) &&
                new Date(
                  licencia.fechaFin || licencia.end_date
                ).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              <Badge
                variant={getStatusBadgeVariant(getApprovalStatus(licencia))}
              >
                {getApprovalStatus(licencia)}
              </Badge>
            </TableCell>
            <TableCell className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(licencia)}
                className="cursor-pointer"
              >
                Editar
              </Button>
              {getApprovalStatus(licencia) === "PENDING" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => licencia.id && handleApproveClick(licencia.id)}
                  className="cursor-pointer"
                >
                  Aprobar
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => licencia.id && handleDeleteClick(licencia.id)}
                className="cursor-pointer"
              >
                Eliminar
              </Button>
            </TableCell>
          </>
        )}
        addButton={
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Agregar Licencia
          </Button>
        }
      />

      <FormDialog
        open={isCreating || selectedLicencia !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedLicencia(null);
          }
        }}
        title={selectedLicencia ? "Editar Licencia" : "Crear Licencia"}
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
                    value: LeaveType.LICENCIA_MEDICA,
                  },
                  {
                    label: "Licencia Personal",
                    value: LeaveType.LICENCIA_PERSONAL,
                  },
                  { label: "Capacitación", value: LeaveType.CAPACITACION },
                  { label: "Otros", value: LeaveType.OTRO },
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
    </>
  );
}
