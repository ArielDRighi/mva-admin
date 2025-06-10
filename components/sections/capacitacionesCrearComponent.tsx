"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getEmployees } from "@/app/actions/empleados";
import { createServiceCapacitacion } from "@/app/actions/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, UserCheck, MapPin, RefreshCcw } from "lucide-react";
import Loader from "@/components/ui/local/Loader";
import { CustomDatePicker } from "../ui/local/CustomDatePicker";

type Employee = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
  cargo: string;
};

type CapacitacionFormData = {
  tipoServicio: string;
  fechaProgramada: Date;
  fechaFin: Date;
  ubicacion: string;
  asignacionesManual: {
    empleadoId: number;
  }[];
};

export default function CapacitacionesCrearComponent() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CapacitacionFormData>();

  useEffect(() => {
    // Fetch employees when component mounts
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Definimos un tipo para la respuesta esperada
        interface EmployeeResponse {
          data?: Employee[];
          items?: Employee[];
        }

        // Tipamos correctamente la respuesta para evitar 'any' implícito
        const response = (await getEmployees()) as EmployeeResponse;

        // Extract the data array from the response
        if (response && "data" in response && Array.isArray(response.data)) {
          setEmployees(response.data);
        } else if (
          response &&
          "items" in response &&
          Array.isArray(response.items)
        ) {
          setEmployees(response.items);
        } else if (Array.isArray(response)) {
          // Si la respuesta es directamente un array, usarlo
          setEmployees(response as Employee[]);
        } else {
          console.error("Formato de respuesta inesperado:", response);
          toast.error("Error: formato de respuesta inesperado");
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        toast.error("Error al cargar los empleados");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const onSubmit = async (data: CapacitacionFormData) => {
    if (!startDate || !endDate) {
      toast.error("Debes seleccionar fechas de inicio y fin");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Debes seleccionar al menos un empleado");
      return;
    }

    setSubmitting(true);

    const capacitacionData = {
      tipoServicio: "CAPACITACION" as const,
      fechaProgramada: startDate.toISOString(),
      fechaFin: endDate.toISOString(),
      ubicacion: data.ubicacion,
      asignacionesManual: selectedEmployees.map((empleadoId) => ({
        empleadoId,
      })),
    };

    try {
      await createServiceCapacitacion(capacitacionData);

      toast.success("Capacitación creada exitosamente");
      reset();
      setStartDate(null);
      setEndDate(null);
      setSelectedEmployees([]);

      // Add redirection to the listing page
      router.push("/admin/dashboard/servicios/capacitaciones/listado");
    } catch (error) {
      console.error("Error creating capacitación:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear la capacitación"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        // Si el empleado ya está seleccionado, quitarlo
        return prev.filter((id) => id !== employeeId);
      } else {
        // Si no está seleccionado, agregarlo
        return [...prev, employeeId];
      }
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="w-full shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Crear Capacitación
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Programa una nueva capacitación para los empleados
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha Programada */}
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="font-medium">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-500" />
                    Fecha Inicio
                  </div>
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    date={startDate}
                    onChange={setStartDate}
                    showTimeSelect={true}
                    format="yyyy-MM-dd HH:mm"
                    placeholder="Selecciona fecha y hora de inicio"
                    className="w-full"
                  />
                </div>
                {!startDate && (
                  <p className="text-red-500 text-sm">
                    Este campo es requerido
                  </p>
                )}
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <Label htmlFor="fechaFin" className="font-medium">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-500" />
                    Fecha Fin
                  </div>
                </Label>
                <div className="relative">
                  <CustomDatePicker
                    date={endDate}
                    onChange={setEndDate}
                    showTimeSelect={true}
                    format="yyyy-MM-dd HH:mm"
                    placeholder="Selecciona fecha y hora de fin"
                    minDate={startDate || undefined}
                    className="w-full"
                  />
                </div>
                {!endDate && (
                  <p className="text-red-500 text-sm">
                    Este campo es requerido
                  </p>
                )}
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="ubicacion" className="font-medium">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                    Ubicación
                  </div>
                </Label>
                <Input
                  id="ubicacion"
                  type="text"
                  {...register("ubicacion", { required: true })}
                  placeholder="Ej: Centro de Capacitación MVA"
                  className="w-full"
                />
                {errors.ubicacion && (
                  <p className="text-red-500 text-sm">
                    Este campo es requerido
                  </p>
                )}
              </div>
            </div>

            {/* Selección de Empleados */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-slate-500" />
                  Seleccionar Empleados
                </h3>
                <Badge variant="outline" className="bg-blue-50">
                  {selectedEmployees.length} seleccionados
                </Badge>
              </div>

              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader />
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-md">
                  No hay empleados disponibles
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`border p-3 rounded-md cursor-pointer transition-colors ${
                          selectedEmployees.includes(employee.id)
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() => handleEmployeeSelection(employee.id)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                selectedEmployees.includes(employee.id)
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                            >
                              {employee.nombre.charAt(0)}
                              {employee.apellido.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium">{`${employee.apellido}, ${employee.nombre}`}</p>
                            <p className="text-xs text-gray-500">{`DNI: ${employee.documento}`}</p>
                            <p className="text-xs text-gray-500">{`Cargo: ${employee.cargo}`}</p>
                            <Badge
                              variant="outline"
                              className={`mt-1 ${
                                employee.estado === "DISPONIBLE"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }`}
                            >
                              {employee.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployees.length === 0 && (
                <p className="text-red-500 text-sm mt-2">
                  Debes seleccionar al menos un empleado
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="mt-8 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setStartDate(null);
                  setEndDate(null);
                  setSelectedEmployees([]);
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Capacitación"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
