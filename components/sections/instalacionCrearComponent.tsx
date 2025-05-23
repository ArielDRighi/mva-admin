"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/local/FormField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getClients } from "@/app/actions/clientes";
import { getContractualConditionsByClient } from "@/app/actions/contractualConditions";
import { createServiceInstalacion } from "@/app/actions/services";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/local/Loader";
import { Cliente, Empleado, Sanitario, Vehiculo } from "@/types/types";
import {
  Search,
  FileText,
  Calendar,
  Truck,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { getEmployees } from "@/app/actions/empleados";
import { getVehicles } from "@/app/actions/vehiculos";
import { getSanitarios } from "@/app/actions/sanitarios";

// Validation schema for each step
const clienteSchema = z.object({
  clienteId: z.number().min(1, "Debe seleccionar un cliente"),
});

// Update the condicionContractualSchema
const condicionContractualSchema = z.object({
  condicionContractualId: z
    .number()
    .min(1, "Debe seleccionar una condición contractual")
    .refine(
      (value) => value > 0,
      "Debe seleccionar una condición contractual válida"
    ),
});

const programacionSchema = z.object({
  fechaProgramada: z.date({
    required_error: "La fecha programada es obligatoria",
  }),
  cantidadVehiculos: z.number().min(1, "Debe especificar al menos 1 vehículo"),
  ubicacion: z.string().min(3, "La ubicación debe tener al menos 3 caracteres"),
  notas: z.string().optional(),
});

const recursosSchema = z.object({
  empleadosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un empleado"),
  vehiculosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un vehículo"),
  banosIds: z.array(z.number()).optional(),
});

// Combined schema
const formSchema = z.object({
  // Step 1
  clienteId: z.number().min(1, "Debe seleccionar un cliente"),

  // Step 2
  condicionContractualId: z
    .number()
    .min(1, "Debe seleccionar una condición contractual"),

  // Step 3
  fechaProgramada: z.date({
    required_error: "La fecha programada es obligatoria",
  }),
  cantidadVehiculos: z.number().min(1, "Debe especificar al menos 1 vehículo"),
  ubicacion: z.string().min(3, "La ubicación debe tener al menos 3 caracteres"),
  notas: z.string().optional(),

  // Step 4
  empleadosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un empleado"),
  vehiculosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un vehículo"),
  banosIds: z.array(z.number()).optional(),

  // Additional fields for service creation
  tipoServicio: z.string().min(1, "El tipo de servicio es obligatorio"),
  cantidadEmpleados: z.number().min(1, "Debe especificar al menos 1 empleado"),
  cantidadBanos: z
    .number()
    .min(0, "La cantidad de baños no puede ser negativa"),
  asignacionAutomatica: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type CondicionContractual = {
  condicionContractualId: number;
  clientId: number;
  tipo_de_contrato: string;
  fecha_inicio: string;
  fecha_fin: string;
  condiciones_especificas: string;
  tarifa: number;
  periodicidad: string;
  estado: string;
  cantidad_banos?: number;
};

export default function CrearInstalacionComponent() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedCondicionContractualId, setSelectedCondicionContractualId] =
    useState<number>(0);

  // Data for each step
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTermCliente, setSearchTermCliente] = useState<string>("");

  const [condicionesContractuales, setCondicionesContractuales] = useState<
    CondicionContractual[]
  >([]);
  const [cantidadBanosRequired, setCantidadBanosRequired] = useState<number>(0);

  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<Empleado[]>(
    []
  );
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>(
    []
  );
  const [banosDisponibles, setBanosDisponibles] = useState<Sanitario[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form handling
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clienteId: 0,
      condicionContractualId: 0,
      fechaProgramada: undefined,
      cantidadVehiculos: 1,
      ubicacion: "",
      notas: "",
      empleadosIds: [],
      vehiculosIds: [],
      banosIds: [],
      tipoServicio: "INSTALACION",
      cantidadEmpleados: 1,
      cantidadBanos: 0,
      asignacionAutomatica: false,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = form;

  const selectedClientId = watch("clienteId");
  const selectedCondicionId = watch("condicionContractualId");
  const selectedFechaProgramada = watch("fechaProgramada");

  // Load clients on component mount
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoading(true);
        const clientesData = await getClients();
        setClientes(clientesData.items || []);
        setFilteredClientes(clientesData.items || []);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
        toast.error("Error al cargar los clientes", {
          description:
            "No se pudieron cargar los clientes. Por favor, intente nuevamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    if (searchTermCliente.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const searchTermLower = searchTermCliente.toLowerCase();
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTermLower) ||
          cliente.cuit.toLowerCase().includes(searchTermLower) ||
          cliente.email.toLowerCase().includes(searchTermLower)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTermCliente, clientes]);

  // Load contractual conditions when client is selected
  useEffect(() => {
    const fetchCondicionesContractuales = async () => {
      if (selectedClientId && selectedClientId > 0) {
        try {
          setIsLoading(true);
          const condicionesData = await getContractualConditionsByClient(
            selectedClientId
          );
          setCondicionesContractuales(condicionesData || []);

          // Reset selection when client changes
          setValue("condicionContractualId", 0);
          setCantidadBanosRequired(0);
        } catch (error) {
          console.error(
            "Error al cargar las condiciones contractuales:",
            error
          );
          toast.error("Error al cargar condiciones contractuales", {
            description:
              "No se pudieron cargar las condiciones del cliente seleccionado.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (step >= 2) {
      fetchCondicionesContractuales();
    }
  }, [selectedClientId, step, setValue]);

  // Load available resources when date is selected
  useEffect(() => {
    const fetchResources = async () => {
      if (selectedFechaProgramada && step >= 4) {
        try {
          setIsLoading(true);

          // Obtener todos los recursos
          const [empleadosResponse, vehiculosResponse, sanitariosResponse] =
            await Promise.all([getEmployees(), getVehicles(), getSanitarios()]);

          // Los recursos ya vienen con su estado de disponibilidad
          // Filtrar empleados disponibles
          const empleadosDisp =
            empleadosResponse?.data?.filter(
              (empleado: Empleado) => empleado.estado === "DISPONIBLE"
            ) || [];

          // Filtrar vehículos disponibles
          const vehiculosDisp =
            vehiculosResponse?.data?.filter(
              (vehiculo: Vehiculo) => vehiculo.estado === "DISPONIBLE"
            ) || [];

          // Filtrar sanitarios disponibles
          const sanitariosDisp =
            sanitariosResponse?.items?.filter(
              (sanitario: Sanitario) => sanitario.estado === "DISPONIBLE"
            ) || [];

          setEmpleadosDisponibles(empleadosDisp);
          setVehiculosDisponibles(vehiculosDisp);
          setBanosDisponibles(sanitariosDisp);

          // Reset selections when date changes
          setValue("empleadosIds", []);
          setValue("vehiculosIds", []);
          setValue("banosIds", []);
        } catch (error) {
          console.error("Error al cargar recursos:", error);
          toast.error("Error al cargar recursos", {
            description: "No se pudieron cargar los recursos disponibles.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (step >= 4) {
      fetchResources();
    }
  }, [selectedFechaProgramada, step, setValue]);

  // Update required toilets when contractual condition is selected
  useEffect(() => {
    if (selectedCondicionId && selectedCondicionId > 0) {
      const selectedCondicion = condicionesContractuales.find(
        (c) => c.condicionContractualId === selectedCondicionId
      );

      if (selectedCondicion) {
        const cantidadBanos = selectedCondicion.cantidad_banos || 0;
        setCantidadBanosRequired(cantidadBanos);
        setValue("cantidadBanos", cantidadBanos);

        // Ensure we're updating the form state properly
        // This is the critical part:
        setValue("condicionContractualId", selectedCondicionId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  }, [selectedCondicionId, condicionesContractuales, setValue]);

  // Add this function near the top of your component
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return getValues().clienteId > 0;
      case 2:
        return getValues().condicionContractualId > 0;
      case 3:
        return (
          !!getValues().fechaProgramada &&
          getValues().cantidadVehiculos > 0 &&
          getValues().ubicacion.length >= 3
        );
      case 4:
        return (
          getValues().empleadosIds.length > 0 &&
          getValues().vehiculosIds.length > 0
        );
      default:
        return true;
    }
  };

  // Handle next step navigation
  const handleNext = async () => {
    let isValid = false;

    switch (step) {
      case 1: // Validate client selection
        isValid = await trigger("clienteId");
        break;
      case 2: // Validate contractual condition selection
        // Force a direct check of condicionContractualId first
        if (getValues().condicionContractualId === 0) {
          toast.error("Error de validación", {
            description: "Debes seleccionar una condición contractual válida",
          });
          return; // Return early to prevent proceeding
        }

        // If that passes, run the regular validation
        isValid = await trigger("condicionContractualId");
        break;
      case 3: // Validate scheduling information
        isValid = await trigger([
          "fechaProgramada",
          "cantidadVehiculos",
          "ubicacion",
        ]);
        break;
      case 4: // Final validation before submission
        console.log("🔍 Validating final step");
        console.log("Current resources:", {
          empleadosIds: watch("empleadosIds"),
          vehiculosIds: watch("vehiculosIds"),
          banosIds: watch("banosIds"),
        });
        isValid = await trigger(["empleadosIds", "vehiculosIds", "banosIds"]);
        console.log("Validation result:", isValid);
        break;
    }

    // Special check for step 2
    if (step === 2) {
      // Check if condicionContractualId is valid before proceeding
      const currentCondicionId = getValues().condicionContractualId;
      console.log("Current condition ID before next step:", currentCondicionId);

      if (!currentCondicionId || currentCondicionId === 0) {
        toast.error("Error de validación", {
          description: "Debes seleccionar una condición contractual válida",
        });
        return;
      }
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  // Handle previous step navigation
  const handleBack = () => {
    setStep(step - 1);
  };

  // Form submission
  const onSubmit = async (data: FormData) => {
    console.log("⭐ onSubmit triggered with data:", data);
    setIsSubmitting(true);

    try {
      // Double-check the condicionContractualId before proceeding
      const effectiveCondicionId =
        data.condicionContractualId || selectedCondicionContractualId;

      if (!effectiveCondicionId || effectiveCondicionId === 0) {
        throw new Error("La condición contractual es requerida");
      }

      console.log("🔍 Using condicionContractualId:", effectiveCondicionId);

      // Transform empleadosIds array into empleadoAId and empleadoBId
      const [empleadoAId, empleadoBId] = data.empleadosIds;

      // Format date properly
      const date = new Date(data.fechaProgramada);
      const formattedDate = date.toLocaleDateString("en-CA"); // This formats as YYYY-MM-DD

      // Prepare service data with the required format
      const serviceData = {
        condicionContractualId: effectiveCondicionId,
        fechaProgramada: formattedDate,
        cantidadVehiculos: data.cantidadVehiculos,
        ubicacion: data.ubicacion,
        empleadoAId: empleadoAId,
        empleadoBId: empleadoBId || undefined, // Changed from null to undefined
        asignacionAutomatica: false,
        asignacionesManual: [
          {
            vehiculoId: data.vehiculosIds[0],
            banosIds: data.banosIds || [],
          },
        ],
        notas: data.notas || "",
      };

      console.log("📤 Sending service data to backend:", serviceData);

      try {
        const response = await createServiceInstalacion(serviceData);
        console.log("📥 Response from backend:", response);

        toast.success("¡Servicio creado correctamente!", {
          description: "El servicio ha sido programado con éxito.",
        });

        // Redirect after success
        setTimeout(() => {
          console.log("🔄 Redirecting to service list...");
          router.push("/admin/dashboard/servicios");
        }, 2000);
      } catch (apiError) {
        console.error("❌ API call failed:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("❌ Error details:", error);
      toast.error("Error al crear el servicio", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to toggle resource selection
  const toggleResourceSelection = (
    resourceType: "empleadosIds" | "vehiculosIds" | "banosIds",
    id: number
  ) => {
    const currentSelection = getValues(resourceType) || [];
    if (currentSelection.includes(id)) {
      setValue(
        resourceType,
        currentSelection.filter((itemId) => itemId !== id)
      );
    } else {
      setValue(resourceType, [...currentSelection, id]);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Crear Nuevo Servicio
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {step === 1 && "Seleccione el cliente para el nuevo servicio"}
              {step === 2 && "Seleccione la condición contractual aplicable"}
              {step === 3 && "Defina la fecha y detalles del servicio"}
              {step === 4 && "Asigne los recursos necesarios para el servicio"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 text-base px-3 py-1"
          >
            Paso {step} de 4
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span
              className={`font-medium flex items-center gap-1 ${
                step >= 1 ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <FileText className="h-4 w-4" /> Cliente
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${
                step >= 2 ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <Calendar className="h-4 w-4" /> Contrato
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${
                step >= 3 ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <MapPin className="h-4 w-4" /> Programación
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${
                step >= 4 ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <Users className="h-4 w-4" /> Recursos
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Client selection */}
        {step === 1 && (
          <div className="space-y-6">
            <Controller
              name="clienteId"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cliente
                  </label>
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      className="pl-10"
                      placeholder="Buscar por nombre, CUIT o email..."
                      value={searchTermCliente}
                      onChange={(e) => setSearchTermCliente(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="h-8 w-8 text-indigo-500" />
                    </div>
                  ) : (
                    <div className="border rounded-md max-h-[350px] overflow-y-auto">
                      {filteredClientes.length > 0 ? (
                        filteredClientes.map((cliente) => (
                          <div
                            key={cliente.clienteId}
                            className={`px-4 py-3 cursor-pointer hover:bg-slate-50 ${
                              field.value === cliente.clienteId
                                ? "bg-indigo-50 border-l-4 border-indigo-500"
                                : "border-l-4 border-transparent"
                            }`}
                            onClick={() => field.onChange(cliente.clienteId)}
                          >
                            <div className="font-medium">{cliente.nombre}</div>
                            <div className="text-sm text-slate-600 flex flex-col sm:flex-row sm:gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />{" "}
                                {cliente.cuit}
                              </span>
                              <span className="flex items-center gap-1">
                                <Search className="h-3.5 w-3.5 text-slate-400" />{" "}
                                {cliente.email}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : searchTermCliente.length > 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          No se encontraron clientes con ese criterio de
                          búsqueda.
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          No hay clientes disponibles. Por favor, cree un
                          cliente primero.
                        </div>
                      )}
                    </div>
                  )}

                  {fieldState.error?.message && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {/* Step 2: Contractual condition selection */}
        {step === 2 && (
          <div className="space-y-6">
            <Controller
              name="condicionContractualId"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condición Contractual
                  </label>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="h-8 w-8 text-indigo-500" />
                    </div>
                  ) : (
                    <div className="border rounded-md max-h-[350px] overflow-y-auto">
                      {condicionesContractuales.length > 0 ? (
                        condicionesContractuales.map((condicion) => (
                          <div
                            key={condicion.condicionContractualId}
                            className={`px-4 py-3 cursor-pointer hover:bg-slate-50 ${
                              field.value === condicion.condicionContractualId
                                ? "bg-indigo-50 border-l-4 border-indigo-500"
                                : "border-l-4 border-transparent"
                            }`}
                            onClick={() => {
                              // More explicit log to debug
                              console.log(
                                `Selecting condition: ${condicion.condicionContractualId}, ${condicion.tipo_de_contrato}`
                              );

                              // Update both the form and local state
                              setSelectedCondicionContractualId(
                                condicion.condicionContractualId
                              );

                              // Use setValue with full options to ensure validation and persistence
                              setValue(
                                "condicionContractualId",
                                condicion.condicionContractualId,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                }
                              );
                            }}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {condicion.tipo_de_contrato}
                              </span>
                              <Badge
                                variant={
                                  condicion.estado === "Activo"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  condicion.estado === "Activo"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : ""
                                }
                              >
                                {condicion.estado}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              <div className="flex justify-between mb-1">
                                <span>Tarifa: ${condicion.tarifa}</span>
                                <span>
                                  Periodicidad: {condicion.periodicidad}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>
                                  Inicio:{" "}
                                  {new Date(
                                    condicion.fecha_inicio
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  Fin:{" "}
                                  {new Date(
                                    condicion.fecha_fin
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {condicion.cantidad_banos && (
                                <div className="mt-1 font-medium text-indigo-600">
                                  Baños requeridos: {condicion.cantidad_banos}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          No hay condiciones contractuales para este cliente.
                          Por favor, cree una condición contractual primero.
                        </div>
                      )}
                    </div>
                  )}

                  {fieldState.error?.message && (
                    <p className="text-sm text-red-500 mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {/* Step 3: Service scheduling */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="fechaProgramada"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha Programada
                    </label>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={isSubmitting}
                      minDate={new Date()}
                    />
                    {fieldState.error?.message && (
                      <p className="text-sm text-red-500 mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="cantidadVehiculos"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Cantidad de Vehículos"
                    name="cantidadVehiculos"
                    type="number"
                    value={field.value.toString()}
                    onChange={(value) => field.onChange(parseInt(value) || 0)}
                    error={fieldState.error?.message}
                    min={1}
                  />
                )}
              />
            </div>

            <Controller
              name="ubicacion"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Ubicación"
                  name="ubicacion"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  placeholder="Dirección completa donde se realizará el servicio"
                />
              )}
            />

            <Controller
              name="notas"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Notas Adicionales"
                  name="notas"
                  type="textarea"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Instrucciones especiales, contactos en sitio, etc."
                />
              )}
            />
          </div>
        )}

        {/* Step 4: Resource assignment */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-1">Empleados Disponibles</h3>
              <p className="text-xs text-slate-500 mb-3">
                Solo se muestran empleados con estado "DISPONIBLE"
              </p>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 text-indigo-500" />
                </div>
              ) : empleadosDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {empleadosDisponibles.map((empleado) => {
                    const isSelected = watch("empleadosIds").includes(
                      empleado.id
                    );
                    return (
                      <div
                        key={empleado.id}
                        className={`border rounded-md p-2 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          toggleResourceSelection("empleadosIds", empleado.id)
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 mr-2 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{`${empleado.nombre} ${empleado.apellido}`}</div>
                            <div className="text-xs flex items-center gap-2">
                              <span className="text-slate-500">
                                {empleado.cargo}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 text-xs"
                              >
                                {empleado.estado}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 border rounded-md">
                  No hay empleados disponibles para la fecha seleccionada.
                </div>
              )}
              {errors.empleadosIds && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.empleadosIds.message}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-1">Vehículos Disponibles</h3>
              <p className="text-xs text-slate-500 mb-3">
                Solo se muestran vehículos con estado "DISPONIBLE"
              </p>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 text-indigo-500" />
                </div>
              ) : vehiculosDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {vehiculosDisponibles.map((vehiculo) => {
                    const isSelected = watch("vehiculosIds").includes(
                      vehiculo.id
                    );
                    return (
                      <div
                        key={vehiculo.id}
                        className={`border rounded-md p-2 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          toggleResourceSelection("vehiculosIds", vehiculo.id)
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 mr-2 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{`${vehiculo.marca} ${vehiculo.modelo}`}</div>
                            <div className="text-xs flex items-center gap-2">
                              <span className="text-slate-500">
                                Placa: {vehiculo.placa}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 text-xs"
                              >
                                {vehiculo.estado}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 border rounded-md">
                  No hay vehículos disponibles para la fecha seleccionada.
                </div>
              )}
              {errors.vehiculosIds && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.vehiculosIds.message}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-1">
                Baños Disponibles{" "}
                {cantidadBanosRequired > 0 &&
                  `(${cantidadBanosRequired} requeridos)`}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Solo se muestran baños con estado "DISPONIBLE"
              </p>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 text-indigo-500" />
                </div>
              ) : banosDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {banosDisponibles.map((bano) => {
                    const banosIds = watch("banosIds") || [];
                    const isSelected = banosIds.includes(Number(bano.baño_id));
                    const isSelectable =
                      isSelected ||
                      banosIds.length < cantidadBanosRequired ||
                      cantidadBanosRequired === 0;
                    return (
                      <div
                        key={bano.baño_id}
                        className={`border rounded-md p-2 ${
                          isSelectable
                            ? "cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                        } ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300"
                            : "hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          isSelectable &&
                          toggleResourceSelection(
                            "banosIds",
                            Number(bano.baño_id)
                          )
                        }
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 mr-2 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {bano.codigo_interno}
                            </div>
                            <div className="text-xs flex items-center gap-2">
                              <span className="text-slate-500">
                                {bano.modelo}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 text-xs"
                              >
                                {bano.estado}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 border rounded-md">
                  No hay baños disponibles para la fecha seleccionada.
                </div>
              )}
              {errors.banosIds && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.banosIds.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}

          <div className={step > 1 ? "ml-auto" : ""}>
            {step < 4 && (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === 4 && (
              <Button
                onClick={() => {
                  console.log("🔘 Submit button clicked");

                  // Get the latest value directly from the form state
                  const formValues = getValues();
                  console.log("Current form state:", formValues);

                  // Use the persisted state value if the form value is 0
                  if (
                    !formValues.condicionContractualId ||
                    formValues.condicionContractualId === 0
                  ) {
                    console.log(
                      "Attempting to recover condicionContractualId from persisted state:",
                      selectedCondicionContractualId
                    );

                    if (selectedCondicionContractualId > 0) {
                      // Set it forcefully right before submission
                      setValue(
                        "condicionContractualId",
                        selectedCondicionContractualId,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        }
                      );
                    } else {
                      console.error(
                        "⛔ Error: No valid condicionContractualId found"
                      );
                      toast.error("Error de validación", {
                        description:
                          "Debes seleccionar una condición contractual válida. Por favor, vuelve al paso 2 y selecciona una condición.",
                      });
                      return;
                    }
                  }

                  // Verify it was set correctly
                  const updatedValues = getValues();
                  console.log(
                    "Updated form values before submit:",
                    updatedValues
                  );

                  if (
                    !updatedValues.condicionContractualId ||
                    updatedValues.condicionContractualId === 0
                  ) {
                    console.error(
                      "⛔ Error: Debes seleccionar una condición contractual válida"
                    );
                    toast.error("Error de validación", {
                      description:
                        "Debes seleccionar una condición contractual válida. Por favor, vuelve al paso 2 y selecciona una condición.",
                    });
                    return;
                  }

                  // Continue with validation and submission
                  trigger().then((isValid) => {
                    if (!isValid) {
                      console.error("⛔ Form validation failed");
                      // Toast message is already shown by the form validation
                      return;
                    }

                    // Check if required number of toilets are selected
                    const banosIds = getValues().banosIds || [];
                    if (
                      cantidadBanosRequired > 0 &&
                      banosIds.length < cantidadBanosRequired
                    ) {
                      console.error(
                        `⛔ Error: Debes seleccionar ${cantidadBanosRequired} baños`
                      );
                      toast.error("Error de validación", {
                        description: `Debes seleccionar ${cantidadBanosRequired} baños`,
                      });
                      return;
                    }

                    // If all checks pass, submit the form
                    console.log(
                      "✅ Intentando enviar el formulario después de verificación completa"
                    );
                    handleSubmit(onSubmit)();
                  });
                }}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Crear Servicio
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Eliminar esta función que causa el error
// function Disponibles(arg0: { cantidadBanosRequired: any }, requeridos: any) {
//   throw new Error("Function not implemented.");
// }
