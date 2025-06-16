"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, Loader } from "lucide-react";

import { getServiceById, updateService } from "@/app/actions/services";
import { getEmployees } from "@/app/actions/empleados";
import { getVehicles } from "@/app/actions/vehiculos";
import { getSanitariosByClient } from "@/app/actions/sanitarios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/local/FormField";
import {
  ServiceType,
  UpdateServiceDto,
  Service,
  ResourceAssignment,
} from "@/types/serviceTypes";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
}

interface Vehiculo {
  id: number;
  patente: string;
  modelo: string;
  marca: string;
  estado: string;
}

interface Sanitario {
  id: number;
  numero_serie: string;
  modelo: string;
  estado: string;
}

// Esquema de validación para el formulario
const formSchema = z.object({
  fechaProgramada: z
    .date({
      required_error: "La fecha programada es obligatoria",
    })
    .optional(),
  cantidadVehiculos: z
    .number({
      required_error: "La cantidad de vehículos es obligatoria",
    })
    .int()
    .min(0, "La cantidad debe ser mayor o igual a 0"),
  ubicacion: z
    .string()
    .min(1, "La ubicación es obligatoria")
    .max(500, "La ubicación no puede exceder los 500 caracteres"),
  notas: z.string().optional(),
  empleadosIds: z.array(z.number()).optional(),
  vehiculosIds: z.array(z.number()).optional(),
  banosInstalados: z.array(z.number()).optional(),
  tipoServicio: z.nativeEnum(ServiceType).optional(),
  asignacionAutomatica: z.boolean().optional(),
});

// Tipo para los datos del formulario
type FormData = z.infer<typeof formSchema>;

export function EditarServicioGenericoComponent({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [servicio, setServicio] = useState<Service | null>(null);
  const [condicionId, setCondicionId] = useState<number>(0);

  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<Empleado[]>(
    []
  );
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>(
    []
  );
  const [banosInstalados, setBanosInstalados] = useState<Sanitario[]>([]);
  const [selectedEmpleados, setSelectedEmpleados] = useState<number[]>([]);
  const [selectedVehiculos, setSelectedVehiculos] = useState<number[]>([]);
  const [selectedBanos, setSelectedBanos] = useState<number[]>([]);
  const [empleadoRolA, setEmpleadoRolA] = useState<number | null>(null);
  const [empleadoRolB, setEmpleadoRolB] = useState<number | null>(null);

  // Configuración del formulario
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cantidadVehiculos: 1,
      ubicacion: "",
      notas: "",
      banosInstalados: [],
      empleadosIds: [],
      vehiculosIds: [],
      tipoServicio: ServiceType.LIMPIEZA,
      asignacionAutomatica: false,
    },
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Cargar los datos del servicio
  useEffect(() => {
    const fetchServicio = async () => {
      try {
        setIsLoading(true);
        const servicioData = (await getServiceById(parseInt(id))) as Service;

        if (!servicioData) {
          toast.error("Error al cargar el servicio", {
            description: "No se encontró el servicio solicitado",
          });
          router.push("/admin/dashboard/servicios/listado");
          return;
        }
        setServicio(servicioData);
        setCondicionId(servicioData.condicionContractualId || 0);

        // Establecer valores en el formulario
        if (servicioData.fechaProgramada) {
          setValue("fechaProgramada", new Date(servicioData.fechaProgramada));
        }
        setValue("ubicacion", servicioData.ubicacion);
        setValue("cantidadVehiculos", servicioData.cantidadVehiculos);
        setValue("notas", servicioData.notas || "");

        // Extraer los empleados, vehículos y baños asignados
        const empleadosIds =
          servicioData.asignaciones
            ?.filter((asig: ResourceAssignment) => asig.empleadoId)
            .map((asig: ResourceAssignment) => asig.empleadoId) || [];

        const vehiculosIds =
          servicioData.asignaciones
            ?.filter((asig: ResourceAssignment) => asig.vehiculoId)
            .map((asig: ResourceAssignment) => asig.vehiculoId) || [];

        // Identificar roles A y B si existen
        if (servicioData.asignaciones && servicioData.asignaciones.length > 0) {
          // El rol A suele ser el que tiene vehículo asignado
          const empleadoConVehiculo = servicioData.asignaciones.find(
            (asig: ResourceAssignment) => asig.vehiculoId && asig.empleadoId
          );
          if (empleadoConVehiculo) {
            setEmpleadoRolA(empleadoConVehiculo.empleadoId);
          }

          // El rol B sería otro empleado sin vehículo
          const otrosEmpleados = servicioData.asignaciones.filter(
            (asig: ResourceAssignment) =>
              asig.empleadoId &&
              (!asig.vehiculoId ||
                (empleadoConVehiculo &&
                  asig.empleadoId !== empleadoConVehiculo.empleadoId))
          );
          if (otrosEmpleados.length > 0) {
            setEmpleadoRolB(otrosEmpleados[0].empleadoId);
          }
        }

        // Establecer selecciones
        setSelectedEmpleados(empleadosIds);
        setSelectedVehiculos(vehiculosIds);
        setValue("empleadosIds", empleadosIds);
        setValue("vehiculosIds", vehiculosIds);

        if (
          servicioData.banosInstalados &&
          Array.isArray(servicioData.banosInstalados)
        ) {
          setSelectedBanos(servicioData.banosInstalados);
          setValue("banosInstalados", servicioData.banosInstalados);
        }

        // Cargar recursos disponibles
        await loadResources(servicioData.clienteId);
      } catch (error) {
        console.error("Error al cargar el servicio:", error);
        toast.error("Error al cargar el servicio", {
          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al cargar los datos del servicio",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchServicio();
    }
  }, [id, router, setValue]);
  // Cargar recursos (empleados, vehículos, baños)
  const loadResources = async (clienteId: number) => {
    try {
      setIsLoading(true);

      // Cargar empleados disponibles
      const empleadosResponse = await getEmployees();

      // Procesar respuesta de empleados
      let empleadosDisp: Empleado[] = [];
      if (empleadosResponse) {
        if (Array.isArray(empleadosResponse)) {
          empleadosDisp = empleadosResponse;
        } else if (typeof empleadosResponse === "object") {
          if (
            "data" in empleadosResponse &&
            Array.isArray(empleadosResponse.data)
          ) {
            empleadosDisp = empleadosResponse.data;
          } else if (
            "items" in empleadosResponse &&
            Array.isArray(empleadosResponse.items)
          ) {
            empleadosDisp = empleadosResponse.items;
          }
        }
      }
      setEmpleadosDisponibles(empleadosDisp);

      // Cargar vehículos disponibles
      const vehiculosResponse = await getVehicles();

      // Procesar respuesta de vehículos
      let vehiculosDisp: Vehiculo[] = [];
      if (vehiculosResponse) {
        if (Array.isArray(vehiculosResponse)) {
          vehiculosDisp = vehiculosResponse;
        } else if (typeof vehiculosResponse === "object") {
          if (
            "data" in vehiculosResponse &&
            Array.isArray(vehiculosResponse.data)
          ) {
            vehiculosDisp = vehiculosResponse.data;
          } else if (
            "items" in vehiculosResponse &&
            Array.isArray(vehiculosResponse.items)
          ) {
            vehiculosDisp = vehiculosResponse.items;
          }
        }
      }
      setVehiculosDisponibles(vehiculosDisp); // Cargar baños instalados para el cliente
      const banosClienteResponse = await getSanitariosByClient(clienteId);

      // Definir la interfaz para la respuesta
      interface SanitariosResponse {
        data?: Sanitario[];
        items?: Sanitario[];
        [key: string]: unknown;
      }

      // Procesar respuesta de baños
      let banosDisp: Sanitario[] = [];
      if (banosClienteResponse) {
        // Si es un array, usarlo directamente
        if (Array.isArray(banosClienteResponse)) {
          banosDisp = banosClienteResponse as unknown as Sanitario[];
        }
        // Si es un objeto, buscar la propiedad data o items
        else if (typeof banosClienteResponse === "object") {
          const typedResponse = banosClienteResponse as SanitariosResponse;
          if (typedResponse.data && Array.isArray(typedResponse.data)) {
            banosDisp = typedResponse.data;
          } else if (
            typedResponse.items &&
            Array.isArray(typedResponse.items)
          ) {
            banosDisp = typedResponse.items;
          }
        }
      }
      setBanosInstalados(banosDisp);
    } catch (error) {
      console.error("Error al cargar recursos:", error);
      toast.error("Error al cargar recursos", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los recursos necesarios",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar selección de empleado
  const handleEmpleadoSelection = (empleadoId: number) => {
    const updatedSelection = selectedEmpleados.includes(empleadoId)
      ? selectedEmpleados.filter((id) => id !== empleadoId)
      : [...selectedEmpleados, empleadoId];

    // Si estamos deseleccionando un empleado, también quitarlo de los roles
    if (
      selectedEmpleados.includes(empleadoId) &&
      !updatedSelection.includes(empleadoId)
    ) {
      if (empleadoRolA === empleadoId) {
        setEmpleadoRolA(null);
      }
      if (empleadoRolB === empleadoId) {
        setEmpleadoRolB(null);
      }
    }

    setSelectedEmpleados(updatedSelection);
    setValue("empleadosIds", updatedSelection);

    // Actualizar los valores del formulario para asignaciones específicas
    updateAsignacionesManual(updatedSelection, selectedVehiculos);
  };

  // Manejar selección de vehículo
  const handleVehiculoSelection = (vehiculoId: number) => {
    const updatedSelection = selectedVehiculos.includes(vehiculoId)
      ? selectedVehiculos.filter((id) => id !== vehiculoId)
      : [...selectedVehiculos, vehiculoId];

    setSelectedVehiculos(updatedSelection);
    setValue("vehiculosIds", updatedSelection);

    // Actualizar asignaciones
    updateAsignacionesManual(selectedEmpleados, updatedSelection);
  };

  // Manejar selección de baño
  const handleBanoSelection = (banoId: number) => {
    const updatedSelection = selectedBanos.includes(banoId)
      ? selectedBanos.filter((id) => id !== banoId)
      : [...selectedBanos, banoId];

    setSelectedBanos(updatedSelection);
    setValue("banosInstalados", updatedSelection);
  };

  // Actualizar las asignaciones manuales en el formulario
  const updateAsignacionesManual = (
    empleadosIds: number[],
    vehiculosIds: number[],
    rolA: number | null = empleadoRolA,
    rolB: number | null = empleadoRolB
  ) => {
    // Determinar empleado A y B para asignaciones
    const empleadoA =
      rolA !== null ? rolA : empleadosIds.length > 0 ? empleadosIds[0] : 0;
    const empleadoB =
      rolB !== null ? rolB : empleadosIds.length > 1 ? empleadosIds[1] : 0;

    // Asignar vehículo al empleado A (si hay vehículos seleccionados)
    const vehiculoAsignado = vehiculosIds.length > 0 ? vehiculosIds[0] : 0;

    // Actualizar consola para debugging
    console.log("Asignaciones actualizadas:", {
      empleadoA,
      empleadoB,
      vehiculoAsignado,
      rolAAsignado: rolA,
      rolBAsignado: rolB,
    });
  };

  // Función para asignar rol A a un empleado
  const handleAsignarRolA = (empleadoId: number) => {
    // Si este empleado ya tiene rol B, intercambiar roles
    if (empleadoRolB === empleadoId) {
      setEmpleadoRolB(empleadoRolA);
    }
    setEmpleadoRolA(empleadoId);

    // Actualizar asignaciones
    updateAsignacionesManual(
      selectedEmpleados,
      selectedVehiculos,
      empleadoId,
      empleadoRolB
    );
  };

  // Función para asignar rol B a un empleado
  const handleAsignarRolB = (empleadoId: number) => {
    // Si este empleado ya tiene rol A, intercambiar roles
    if (empleadoRolA === empleadoId) {
      setEmpleadoRolA(empleadoRolB);
    }
    setEmpleadoRolB(empleadoId);

    // Actualizar asignaciones
    updateAsignacionesManual(
      selectedEmpleados,
      selectedVehiculos,
      empleadoRolA,
      empleadoId
    );
  };

  // Enviar formulario para actualizar el servicio
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Validar que haya al menos un empleado seleccionado para el rol A si hay vehículos seleccionados
      if (
        data.vehiculosIds &&
        data.vehiculosIds.length > 0 &&
        empleadoRolA === null &&
        (!data.empleadosIds || data.empleadosIds.length === 0)
      ) {
        toast.error("Error en la asignación de roles", {
          description:
            "Debe seleccionar al menos un empleado para el rol de conductor (Rol A) cuando hay vehículos asignados.",
        });
        setIsSubmitting(false);
        return;
      }

      // Si hay vehículos y empleados pero no se asignó el rol A, asignar automáticamente
      let empleadoA = empleadoRolA;
      let empleadoB = empleadoRolB;

      if (
        data.vehiculosIds &&
        data.vehiculosIds.length > 0 &&
        empleadoRolA === null &&
        data.empleadosIds &&
        data.empleadosIds.length > 0
      ) {
        empleadoA = data.empleadosIds[0];
        setEmpleadoRolA(empleadoA);

        // Si hay más de un empleado y no hay rol B asignado
        if (data.empleadosIds.length > 1 && empleadoRolB === null) {
          empleadoB = data.empleadosIds[1];
          setEmpleadoRolB(empleadoB);
        }

        // Notificar al usuario
        toast.info("Roles asignados automáticamente", {
          description:
            "Se han asignado roles automáticamente a los empleados seleccionados.",
        });
      }

      // Determinar quiénes son los empleados para los roles A y B
      const empleadosIds = data.empleadosIds || [];

      empleadoA =
        empleadoA !== null
          ? empleadoA
          : empleadosIds.length > 0
          ? empleadosIds[0]
          : 0;

      empleadoB =
        empleadoB !== null
          ? empleadoB
          : empleadosIds.length > 1
          ? empleadosIds[0] !== empleadoA
            ? empleadosIds[0]
            : empleadosIds[1]
          : empleadosIds.length === 1 && empleadosIds[0] !== empleadoA
          ? empleadosIds[0]
          : 0;

      console.log("Asignación de roles:", {
        empleadoA,
        empleadoB,
        seleccionados: empleadosIds,
      });

      // Recuperar los empleados por nombre para mostrar en el log y confirmar
      const empleadoAObj = empleadoA
        ? empleadosDisponibles.find((e) => e.id === empleadoA)
        : null;
      const empleadoBObj = empleadoB
        ? empleadosDisponibles.find((e) => e.id === empleadoB)
        : null;

      const empleadoANombre = empleadoAObj
        ? `${empleadoAObj.nombre} ${empleadoAObj.apellido}`
        : "Ninguno";
      const empleadoBNombre = empleadoBObj
        ? `${empleadoBObj.nombre} ${empleadoBObj.apellido}`
        : "Ninguno";

      console.log(`Rol A (conductor): ${empleadoANombre} (ID: ${empleadoA})`);
      console.log(`Rol B (asistente): ${empleadoBNombre} (ID: ${empleadoB})`);

      // Preparar asignaciones manuales
      const vehiculosIds = data.vehiculosIds || [];
      const asignacionesManual = [
        {
          // Rol A: Conductor principal con vehículo
          empleadoId: empleadoA,
          vehiculoId: vehiculosIds.length > 0 ? vehiculosIds[0] : 0,
        },
        {
          // Rol B: Empleado adicional/asistente
          empleadoId: empleadoB,
        },
      ];

      // Preparar datos para actualización
      const updateData: UpdateServiceDto = {
        fechaProgramada: data.fechaProgramada?.toISOString(),
        cantidadVehiculos: data.cantidadVehiculos,
        ubicacion: data.ubicacion,
        notas: data.notas || "",
        banosInstalados: data.banosInstalados || [],
        asignacionesManual: asignacionesManual,
        asignacionAutomatica: false,
        condicionContractualId: condicionId || undefined,
      };

      // Actualizar el servicio
      await updateService(parseInt(id), updateData);

      // Mostrar mensaje de éxito
      toast.success("Servicio actualizado con éxito", {
        description: "Los cambios se han guardado correctamente.",
      }); // Redireccionar a la página de listado
      setTimeout(() => {
        router.push("/admin/dashboard/servicios/listado");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar el servicio:", error);

      toast.error("Error al actualizar el servicio", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el servicio. Por favor, intente nuevamente.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
        <p>Cargando datos del servicio...</p>
      </div>
    );
  }

  // Verificar si tenemos datos del servicio
  if (!servicio) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
        <p className="text-red-500">No se pudo cargar el servicio</p>
        <Button
          onClick={() => router.push("/admin/dashboard/servicios/listado")}
        >
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar Servicio de Limpieza</h1>
            <p className="text-gray-600">
              Modifique los datos del servicio según sea necesario
            </p>{" "}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard/servicios/listado")}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al listado
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(
                (data) => {
                  console.log("Form submitted successfully, data:", data);
                  onSubmit(data);
                },
                (errors) => {
                  console.error("Form validation failed:", errors);
                  return false;
                }
              )}
            >
              <div className="space-y-8">
                {/* Información del cliente */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mb-6">
                  <h2 className="text-md font-medium mb-2">
                    Información del Cliente
                  </h2>
                  <p>
                    <span className="font-medium">Cliente:</span>{" "}
                    {servicio?.cliente?.nombre || "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">
                      Condición Contractual ID:
                    </span>{" "}
                    {servicio?.condicionContractualId || "No especificada"}
                  </p>
                </div>

                {/* Detalles del Servicio */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Detalles del Servicio
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fecha Programada */}
                    <div className="col-span-1">
                      <Controller
                        name="fechaProgramada"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            label="Fecha Programada"
                            name="fechaProgramada"
                            type="date"
                            value={
                              field.value
                                ? format(new Date(field.value), "yyyy-MM-dd", {
                                    locale: es,
                                  })
                                : ""
                            }
                            onChange={(value: string) =>
                              field.onChange(
                                value ? new Date(value) : undefined
                              )
                            }
                            error={fieldState.error?.message}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    {/* Cantidad de Vehículos */}
                    <div className="col-span-1">
                      <Controller
                        name="cantidadVehiculos"
                        control={control}
                        render={({ field, fieldState }) => (
                          <FormField
                            label="Cantidad de Vehículos"
                            name="cantidadVehiculos"
                            type="number"
                            value={field.value?.toString() || "1"}
                            onChange={(value: string) =>
                              field.onChange(parseInt(value, 10))
                            }
                            error={fieldState.error?.message}
                            min={1}
                            className="w-full"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Ubicación */}
                  <Controller
                    name="ubicacion"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Ubicación"
                        name="ubicacion"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholder="Ingrese la ubicación del servicio"
                        className="w-full"
                      />
                    )}
                  />

                  {/* Notas */}
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
                        placeholder="Ingrese notas adicionales"
                        className="w-full"
                        multiline
                      />
                    )}
                  />
                </div>

                {/* Asignación de Recursos */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Asignación de Recursos
                  </h2>

                  {/* Empleados */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Empleados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {empleadosDisponibles.map((empleado) => (
                        <div
                          key={empleado.id}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            selectedEmpleados.includes(empleado.id)
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-blue-300"
                          }`}
                          onClick={() => handleEmpleadoSelection(empleado.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{`${empleado.nombre} ${empleado.apellido}`}</p>
                              <p className="text-sm text-gray-500">
                                {empleado.documento}
                              </p>
                            </div>
                            {selectedEmpleados.includes(empleado.id) && (
                              <div className="flex gap-1">
                                <Badge
                                  className={`cursor-pointer ${
                                    empleadoRolA === empleado.id
                                      ? "bg-green-100 text-green-800 border-green-500"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAsignarRolA(empleado.id);
                                  }}
                                >
                                  Rol A
                                </Badge>
                                <Badge
                                  className={`cursor-pointer ${
                                    empleadoRolB === empleado.id
                                      ? "bg-blue-100 text-blue-800 border-blue-500"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAsignarRolB(empleado.id);
                                  }}
                                >
                                  Rol B
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge
                            className={`mt-2 ${
                              empleado.estado === "DISPONIBLE"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {empleado.estado}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {errors.empleadosIds && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.empleadosIds.message}
                      </p>
                    )}
                  </div>

                  {/* Vehículos */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Vehículos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {vehiculosDisponibles.map((vehiculo) => (
                        <div
                          key={vehiculo.id}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            selectedVehiculos.includes(vehiculo.id)
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-blue-300"
                          }`}
                          onClick={() => handleVehiculoSelection(vehiculo.id)}
                        >
                          <p className="font-medium">{vehiculo.modelo}</p>
                          <p className="text-sm text-gray-500">
                            Patente: {vehiculo.patente}
                          </p>
                          <Badge
                            className={`mt-2 ${
                              vehiculo.estado === "DISPONIBLE"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vehiculo.estado}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {errors.vehiculosIds && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.vehiculosIds.message}
                      </p>
                    )}
                  </div>

                  {/* Baños Instalados */}
                  {banosInstalados.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-2">
                        Baños Instalados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        {banosInstalados.map((bano) => (
                          <div
                            key={bano.id}
                            className={`border rounded-md p-3 cursor-pointer transition-colors ${
                              selectedBanos.includes(bano.id)
                                ? "border-blue-500 bg-blue-50"
                                : "hover:border-blue-300"
                            }`}
                            onClick={() => handleBanoSelection(bano.id)}
                          >
                            <p className="font-medium">{bano.modelo}</p>
                            <p className="text-sm text-gray-500">
                              Serie: {bano.numero_serie}
                            </p>
                            <Badge
                              className={`mt-2 ${
                                bano.estado === "DISPONIBLE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {bano.estado}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 mt-6">
                  {" "}
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      router.push("/admin/dashboard/servicios/listado")
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
