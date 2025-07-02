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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getClients } from "@/app/actions/clientes";
import { getContractualConditionsByClient } from "@/app/actions/contractualConditions";
import { CreateRetiroDto, createServicioRetiro } from "@/app/actions/services";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/local/Loader";
import { Cliente, Empleado, Sanitario, Vehiculo } from "@/types/types";
import { ServiceType } from "@/types/serviceTypes";
import {
  Search,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Save,
  Clipboard,
  Trash2,
} from "lucide-react";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { getEmployees } from "@/app/actions/empleados";
import { getVehicles } from "@/app/actions/vehiculos";
import { getSanitariosByClient } from "@/app/actions/sanitarios";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Schema for the form
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
  banosInstalados: z.array(z.number()),
  empleadosIds: z.array(z.number()),
  vehiculosIds: z.array(z.number()),

  // Additional fields for service creation
  tipoServicio: z.literal(ServiceType.RETIRO),
  asignacionAutomatica: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type CondicionContractual = {
  condicionContractualId: number;
  clientId: number;
  tipo_servicio?: string;
  fecha_inicio: string;
  fecha_fin: string;
  condiciones_especificas: string;
  tarifa: number;
  periodicidad: string;
  estado: string;
};

interface EmpleadosResponse {
  data?: Empleado[];
  items?: Empleado[];
}

interface VehiculosResponse {
  data?: Vehiculo[];
  items?: Vehiculo[];
}

export function CrearServicioRetiroComponent() {
  const router = useRouter();
  const { isAdmin } = useCurrentUser();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTermCliente, setSearchTermCliente] = useState<string>("");

  const [condicionesContractuales, setCondicionesContractuales] = useState<
    CondicionContractual[]
  >([]);

  const [banosInstalados, setBanosInstalados] = useState<Sanitario[]>([]);
  console.log("banos instalados", banosInstalados);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<Empleado[]>(
    []
  );
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>(
    []
  );
  const [selectedEmpleados, setSelectedEmpleados] = useState<number[]>([]);
  const [selectedVehiculos, setSelectedVehiculos] = useState<number[]>([]);
  const [selectedBanos, setSelectedBanos] = useState<number[]>([]);

  // Estado para asignación de roles A y B
  const [empleadoRolA, setEmpleadoRolA] = useState<number | null>(null);
  const [empleadoRolB, setEmpleadoRolB] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      clienteId: 0,
      condicionContractualId: 0,
      fechaProgramada: undefined,
      cantidadVehiculos: 1,
      ubicacion: "",
      notas: "",
      banosInstalados: [],
      empleadosIds: [],
      vehiculosIds: [],
      tipoServicio: ServiceType.RETIRO,
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
  const [selectedCondicionId, setSelectedCondicionId] = useState<number>(0);
  const selectedFechaProgramada = watch("fechaProgramada");

  // Keep selectedCondicionId in sync with form value
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "condicionContractualId") {
        setSelectedCondicionId(value.condicionContractualId as number);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // Cargar clientes al inicio
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoading(true);

        interface ClientesResponse {
          items?: Cliente[];
          data?: Cliente[];
          total?: number;
          page?: number;
        }

        const clientesData = (await getClients()) as ClientesResponse;

        if (clientesData && typeof clientesData === "object") {
          if ("items" in clientesData && Array.isArray(clientesData.items)) {
            setClientes(clientesData.items);
            setFilteredClientes(clientesData.items);
          } else if (
            "data" in clientesData &&
            Array.isArray(clientesData.data)
          ) {
            setClientes(clientesData.data);
            setFilteredClientes(clientesData.data);
          } else if (Array.isArray(clientesData)) {
            setClientes(clientesData);
            setFilteredClientes(clientesData);
          } else {
            console.error("Formato de respuesta no reconocido:", clientesData);
            setClientes([]);
            setFilteredClientes([]);
            toast.error("Error en el formato de datos", {
              description:
                "El servidor devolvió datos en un formato inesperado",
            });
          }
        } else {
          console.error(
            "La respuesta de getClients no es un objeto:",
            clientesData
          );
          setClientes([]);
          setFilteredClientes([]);
          toast.error("Error en la respuesta", {
            description: "No se recibió una respuesta válida del servidor",
          });
        }
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
        toast.error("Error al cargar los clientes", {
          description:
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los clientes. Por favor, intente nuevamente.",
        });
        setClientes([]);
        setFilteredClientes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Filtrar clientes por término de búsqueda
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

  // Cargar condiciones contractuales cuando se selecciona un cliente
  useEffect(() => {
    const fetchCondicionesContractuales = async () => {
      if (selectedClientId && selectedClientId > 0) {
        try {
          setIsLoading(true);

          interface CondicionesResponse {
            items?: CondicionContractual[];
            data?: CondicionContractual[];
          }
          const condicionesData = (await getContractualConditionsByClient(
            selectedClientId
          )) as CondicionesResponse | CondicionContractual[];

          let procesadas: CondicionContractual[] = [];

          if (Array.isArray(condicionesData)) {
            procesadas = condicionesData;
          } else if (condicionesData && typeof condicionesData === "object") {
            if (
              "items" in condicionesData &&
              Array.isArray(condicionesData.items)
            ) {
              procesadas = condicionesData.items;
            } else if (
              "data" in condicionesData &&
              Array.isArray(condicionesData.data)
            ) {
              procesadas = condicionesData.data;
            } else {
              console.error(
                "Formato de respuesta no reconocido:",
                condicionesData
              );
              toast.error("Error en el formato de datos", {
                description:
                  "El servidor devolvió datos en un formato inesperado",
              });
            }
          } else {
            console.error("Tipo de respuesta no esperado:", condicionesData);
            toast.error("Error en la respuesta", {
              description: "No se recibió una respuesta válida del servidor",
            });
          }

          setCondicionesContractuales(procesadas);

          if (step === 2 && !selectedCondicionId) {
            setValue("condicionContractualId", 0);
          }
        } catch (error) {
          console.error("Error al cargar condiciones contractuales:", error);
          toast.error("Error al cargar condiciones", {
            description:
              error instanceof Error
                ? error.message
                : "No se pudieron cargar las condiciones contractuales. Por favor, intente nuevamente.",
          });
          setCondicionesContractuales([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (step >= 2) {
      fetchCondicionesContractuales();
    }
  }, [selectedClientId, step, setValue, selectedCondicionId]);

  // Cargar recursos cuando se selecciona una fecha
  useEffect(() => {
    const fetchResources = async () => {
      if (selectedClientId && selectedFechaProgramada && step >= 4) {
        try {
          setIsLoading(true);

          // Cargar empleados y vehículos disponibles
          const empleadosResponse = (await getEmployees()) as EmpleadosResponse;
          const vehiculosResponse = (await getVehicles()) as VehiculosResponse;

          // Procesar respuesta de empleados
          let empleadosDisp: Empleado[] = [];
          if (empleadosResponse && typeof empleadosResponse === "object") {
            if (
              "data" in empleadosResponse &&
              Array.isArray(empleadosResponse.data)
            ) {
              empleadosDisp = empleadosResponse.data.filter(
                (empleado) =>
                  empleado.estado === "DISPONIBLE" ||
                  empleado.estado === "ASIGNADO"
              );
            } else if (
              "items" in empleadosResponse &&
              Array.isArray(empleadosResponse.items)
            ) {
              empleadosDisp = empleadosResponse.items.filter(
                (empleado) =>
                  empleado.estado === "DISPONIBLE" ||
                  empleado.estado === "ASIGNADO"
              );
            } else {
              console.error(
                "Formato de respuesta de empleados no reconocido:",
                empleadosResponse
              );
              toast.error("Error al cargar empleados", {
                description:
                  "El servidor devolvió datos en un formato inesperado",
              });
            }
          } else {
            console.error(
              "Tipo de respuesta de empleados no esperado:",
              empleadosResponse
            );
            toast.error("Error al cargar empleados", {
              description: "No se recibió una respuesta válida del servidor",
            });
          }

          // Procesar respuesta de vehículos
          let vehiculosDisp: Vehiculo[] = [];
          if (vehiculosResponse && typeof vehiculosResponse === "object") {
            if (
              "data" in vehiculosResponse &&
              Array.isArray(vehiculosResponse.data)
            ) {
              vehiculosDisp = vehiculosResponse.data.filter(
                (vehiculo) =>
                  vehiculo.estado === "DISPONIBLE" ||
                  vehiculo.estado === "ASIGNADO"
              );
            } else if (
              "items" in vehiculosResponse &&
              Array.isArray(vehiculosResponse.items)
            ) {
              vehiculosDisp = vehiculosResponse.items.filter(
                (vehiculo) =>
                  vehiculo.estado === "DISPONIBLE" ||
                  vehiculo.estado === "ASIGNADO"
              );
            } else {
              console.error(
                "Formato de respuesta de vehículos no reconocido:",
                vehiculosResponse
              );
              toast.error("Error al cargar vehículos", {
                description:
                  "El servidor devolvió datos en un formato inesperado",
              });
            }
          } else {
            console.error(
              "Tipo de respuesta de vehículos no esperado:",
              vehiculosResponse
            );
            toast.error("Error al cargar vehículos", {
              description: "No se recibió una respuesta válida del servidor",
            });
          }

          setEmpleadosDisponibles(empleadosDisp);
          setVehiculosDisponibles(vehiculosDisp);

          // Cargar baños instalados para el cliente
          interface SanitariosResponse {
            data?: Sanitario[];
            items?: Sanitario[];
          }

          const banosClienteResponse = (await getSanitariosByClient(
            selectedClientId
          )) as SanitariosResponse | Sanitario[];

          if (Array.isArray(banosClienteResponse)) {
            // Filtrar solo baños instalados (ASIGNADO) - estos son los disponibles para retirar
            const banosAsignados = banosClienteResponse.filter(
              (bano) => bano.estado === "ASIGNADO"
            );
            setBanosInstalados(banosAsignados);

            // Preseleccionar todos los baños instalados para retiro urgente si se especifica en las notas
            const notasValue = getValues("notas") || "";
            if (notasValue.toLowerCase().includes("urgente")) {
              const todosLosBanos = banosAsignados.map((bano) =>
                parseInt(bano.baño_id || "0")
              );
              setSelectedBanos(todosLosBanos);
              setValue("banosInstalados", todosLosBanos);
            }
          } else if (
            banosClienteResponse &&
            typeof banosClienteResponse === "object"
          ) {
            if (
              "data" in banosClienteResponse &&
              Array.isArray(banosClienteResponse.data)
            ) {
              const banosAsignados = banosClienteResponse.data.filter(
                (bano) => bano.estado === "ASIGNADO"
              );
              setBanosInstalados(banosAsignados);
            } else if (
              "items" in banosClienteResponse &&
              Array.isArray(banosClienteResponse.items)
            ) {
              const banosAsignados = banosClienteResponse.items.filter(
                (bano) => bano.estado === "ASIGNADO"
              );
              setBanosInstalados(banosAsignados);
            } else {
              console.error(
                "Formato de respuesta de baños no reconocido:",
                banosClienteResponse
              );
              setBanosInstalados([]);
              toast.error("Error al cargar baños", {
                description:
                  "El servidor devolvió datos en un formato inesperado",
              });
            }
          } else {
            console.error(
              "Tipo de respuesta de baños no esperado:",
              banosClienteResponse
            );
            setBanosInstalados([]);
            toast.error("Error al cargar baños", {
              description: "No se recibió una respuesta válida del servidor",
            });
          }
        } catch (error) {
          console.error("Error al cargar recursos:", error);
          toast.error("Error al cargar recursos", {
            description:
              error instanceof Error
                ? error.message
                : "No se pudieron cargar los recursos necesarios. Por favor, intente nuevamente.",
          });
          setEmpleadosDisponibles([]);
          setVehiculosDisponibles([]);
          setBanosInstalados([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchResources();
  }, [selectedClientId, selectedFechaProgramada, step, setValue, getValues]);

  // Manejar selección de empleado
  const handleEmpleadoSelection = (empleadoId: number) => {
    const updatedSelection = selectedEmpleados.includes(empleadoId)
      ? selectedEmpleados.filter((id) => id !== empleadoId)
      : [...selectedEmpleados, empleadoId];

    setSelectedEmpleados(updatedSelection);
    setValue("empleadosIds", updatedSelection);

    // Si se deselecciona un empleado, quitar sus roles asignados
    if (!updatedSelection.includes(empleadoId)) {
      if (empleadoRolA === empleadoId) {
        setEmpleadoRolA(null);
      }
      if (empleadoRolB === empleadoId) {
        setEmpleadoRolB(null);
      }
    }
  };

  // Manejar selección de vehículo
  const handleVehiculoSelection = (vehiculoId: number) => {
    const updatedSelection = selectedVehiculos.includes(vehiculoId)
      ? selectedVehiculos.filter((id) => id !== vehiculoId)
      : [...selectedVehiculos, vehiculoId];

    setSelectedVehiculos(updatedSelection);
    setValue("vehiculosIds", updatedSelection);
  };

  // Manejar selección de baño
  const handleBanoSelection = (banoId: number) => {
    const updatedSelection = selectedBanos.includes(banoId)
      ? selectedBanos.filter((id) => id !== banoId)
      : [...selectedBanos, banoId];

    setSelectedBanos(updatedSelection);
    setValue("banosInstalados", updatedSelection);
  };

  // Avanzar al siguiente paso
  const handleNextStep = async () => {
    let isStepValid = false;

    switch (step) {
      case 1:
        isStepValid = await trigger("clienteId");
        break;
      case 2:
        if (condicionesContractuales.length === 0) {
          toast.error("Este cliente no tiene condiciones contractuales", {
            description:
              "Por favor, seleccione otro cliente o cree una condición contractual antes de continuar.",
          });
          return false;
        }

        isStepValid = await trigger("condicionContractualId");
        const currentCondicionId = getValues("condicionContractualId");

        if (currentCondicionId <= 0 || !currentCondicionId) {
          toast.error("Por favor seleccione una condición contractual");
          return false;
        }
        break;
      case 3:
        isStepValid = await trigger([
          "fechaProgramada",
          "cantidadVehiculos",
          "ubicacion",
        ] as const);
        break;
      default:
        isStepValid = true;
        break;
    }
    if (isStepValid) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  // Retroceder al paso anterior
  const handlePrevStep = () => {
    if (step === 3) {
      if (selectedCondicionId > 0) {
        setValue("condicionContractualId", selectedCondicionId);
      }
    }

    setStep((prevStep) => prevStep - 1);
  };

  // Enviar formulario
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Validaciones específicas para servicio de retiro
      // Nota: banosInstalados debe contener los IDs de baños a retirar

      if (!data.empleadosIds || data.empleadosIds.length === 0) {
        toast.error("Validación de formulario", {
          description: "Debe seleccionar al menos un empleado.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.vehiculosIds || data.vehiculosIds.length === 0) {
        toast.error("Validación de formulario", {
          description: "Debe seleccionar al menos un vehículo.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.banosInstalados || data.banosInstalados.length === 0) {
        toast.error("Validación de formulario", {
          description: "Debe seleccionar al menos un baño para retirar.",
        });
        setIsSubmitting(false);
        return;
      }

      // Validar que haya al menos un empleado seleccionado para el rol A si hay vehículos seleccionados
      if (
        data.vehiculosIds &&
        data.vehiculosIds.length > 0 &&
        empleadoRolA === null &&
        data.empleadosIds.length > 0
      ) {
        toast.error("Validación de formulario", {
          description:
            "Debe seleccionar al menos un empleado para el rol de conductor (Rol A) cuando hay vehículos asignados.",
        });
        setIsSubmitting(false);
        return;
      }

      // Si hay vehículos y empleados pero no se asignó el rol A, asignar automáticamente
      if (
        data.vehiculosIds &&
        data.vehiculosIds.length > 0 &&
        empleadoRolA === null &&
        data.empleadosIds.length > 0
      ) {
        setEmpleadoRolA(data.empleadosIds[0]);
      }

      // Preparar las asignaciones manuales según el formato requerido usando roles A y B
      const asignacionesManual = prepareAsignacionesManual(
        data.empleadosIds,
        data.vehiculosIds,
        empleadoRolA !== null
          ? empleadoRolA
          : data.empleadosIds.length > 0
          ? data.empleadosIds[0]
          : 0,
        empleadoRolB !== null
          ? empleadoRolB
          : data.empleadosIds.length > 1
          ? data.empleadosIds[1]
          : empleadoRolA !== null
          ? empleadoRolA
          : data.empleadosIds.length > 0
          ? data.empleadosIds[0]
          : 0
      );

      // Objeto para enviar a la API
      const servicioRequest: CreateRetiroDto = {
        clienteId: selectedClientId,
        fechaProgramada: data.fechaProgramada.toISOString(),
        tipoServicio: "RETIRO",
        cantidadBanos: 0, // Para servicios de retiro siempre es 0
        cantidadVehiculos: data.cantidadVehiculos,
        ubicacion: data.ubicacion,
        banosInstalados: data.banosInstalados, // Array con IDs de baños a retirar
        asignacionAutomatica: false,
        asignacionesManual: asignacionesManual,
        condicionContractualId:
          selectedCondicionId || data.condicionContractualId,
        notas: data.notas || "Retiro de sanitarios según contrato",
      };

      // Verificación adicional
      if (
        !servicioRequest.condicionContractualId ||
        servicioRequest.condicionContractualId <= 0
      ) {
        toast.error("Error en el formulario", {
          description: "Por favor seleccione una condición contractual válida.",
        });
        return;
      }

      // Crear el servicio
      type ServicioResponse = {
        id?: number;
        success?: boolean;
        message?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };

      console.log("Servicio Request:", servicioRequest);
      const response = (await createServicioRetiro(
        servicioRequest
      )) as ServicioResponse;

      // Verificar la respuesta
      if (response && response.id) {
        toast.success("Servicio de retiro creado", {
          description: `El servicio de retiro #${response.id} se ha creado exitosamente.`,
        });
      } else if (response && response.success) {
        toast.success("Servicio de retiro creado", {
          description:
            response.message ||
            "El servicio de retiro se ha creado exitosamente.",
        });
      } else {
        toast.success("Servicio de retiro creado", {
          description: "El servicio de retiro se ha creado exitosamente.",
        });
      }

      // Redireccionar a la página de listado de servicios
      setTimeout(() => {
        router.push("/admin/dashboard/servicios/listado");
      }, 1000);
    } catch (error) {
      console.error("Error al crear el servicio:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo crear el servicio. Por favor, intente nuevamente.";

      toast.error("Error al crear el servicio", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para preparar asignaciones con roles A y B
  const prepareAsignacionesManual = (
    empleadosIds: number[],
    vehiculosIds: number[],
    rolA: number | null = empleadoRolA,
    rolB: number | null = empleadoRolB
  ): [{ empleadoId: number; vehiculoId: number }, { empleadoId: number }] => {
    const empleadoA =
      rolA !== null ? rolA : empleadosIds.length > 0 ? empleadosIds[0] : 0;
    const empleadoB =
      rolB !== null
        ? rolB
        : empleadosIds.length > 1
        ? empleadosIds[1]
        : empleadoA;

    return [
      {
        empleadoId: empleadoA,
        vehiculoId: vehiculosIds.length > 0 ? vehiculosIds[0] : 0,
      },
      {
        empleadoId: empleadoB,
      },
    ];
  };

  if (isLoading && step === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crear Servicio de Retiro</h1>
            <p className="text-gray-600">
              Complete el formulario para crear un nuevo servicio de retiro de
              sanitarios
            </p>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2">
            <Badge
              className={`px-3 py-1 ${
                step >= 1 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              1. Cliente
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 2 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              2. Condición Contractual
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 3 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              3. Detalles de Retiro
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 4 ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              4. Asignación de Recursos
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(
                (data) => {
                  onSubmit(data);
                },
                (errors) => {
                  console.error("Form validation failed:", errors);
                  return false;
                }
              )}
            >
              {/* Paso 1: Selección de Cliente */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selección de Cliente
                  </h2>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar cliente por nombre, CUIT o email..."
                        className="pl-10"
                        value={searchTermCliente}
                        onChange={(e) => setSearchTermCliente(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredClientes.map((cliente) => (
                      <div
                        key={cliente.clienteId}
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${
                          selectedClientId === cliente.clienteId
                            ? "border-red-500 bg-red-50"
                            : "hover:border-red-300 hover:bg-red-50/50"
                        }`}
                        onClick={async () => {
                          if (cliente.clienteId !== undefined) {
                            setValue("clienteId", cliente.clienteId);
                            if (selectedClientId !== cliente.clienteId) {
                              setValue("condicionContractualId", 0);
                              setSelectedCondicionId(0);

                              try {
                                setIsLoading(true);

                                interface CondicionesResponse {
                                  items?: CondicionContractual[];
                                  data?: CondicionContractual[];
                                }

                                const condicionesData =
                                  (await getContractualConditionsByClient(
                                    cliente.clienteId
                                  )) as
                                    | CondicionesResponse
                                    | CondicionContractual[];

                                let condiciones: CondicionContractual[] = [];

                                if (Array.isArray(condicionesData)) {
                                  condiciones = condicionesData;
                                } else if (
                                  condicionesData &&
                                  typeof condicionesData === "object"
                                ) {
                                  if (
                                    "items" in condicionesData &&
                                    Array.isArray(condicionesData.items)
                                  ) {
                                    condiciones = condicionesData.items;
                                  } else if (
                                    "data" in condicionesData &&
                                    Array.isArray(condicionesData.data)
                                  ) {
                                    condiciones = condicionesData.data;
                                  }
                                }

                                if (condiciones.length === 0) {
                                  toast.warning(
                                    `${cliente.nombre} no tiene condiciones contractuales`,
                                    {
                                      description:
                                        "Este cliente no tiene condiciones contractuales configuradas, lo que será necesario para crear un servicio.",
                                      duration: 5000,
                                    }
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Error al verificar condiciones contractuales:",
                                  error
                                );
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }
                        }}
                      >
                        <div className="font-medium text-lg">
                          {cliente.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          CUIT: {cliente.cuit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Email: {cliente.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          Dirección: {cliente.direccion}
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.clienteId && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.clienteId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Paso 2: Condición Contractual */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Selección de Condición Contractual
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : condicionesContractuales.length === 0 ? (
                    <div className="text-center py-8 border rounded-md flex flex-col items-center">
                      <p className="text-red-500 font-semibold mb-2">
                        No hay condiciones contractuales disponibles
                      </p>
                      <p className="text-gray-500 mb-4">
                        Este cliente no tiene condiciones contractuales
                        configuradas. Primero debe crear al menos una condición
                        contractual para poder asignarle un servicio.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        className="mt-2"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Seleccionar
                        otro cliente
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {condicionesContractuales.map((condicion) => (
                        <div
                          key={condicion.condicionContractualId}
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedCondicionId ===
                            condicion.condicionContractualId
                              ? "border-red-500 bg-red-50"
                              : "hover:border-red-300 hover:bg-red-50/50"
                          }`}
                          onClick={() => {
                            setValue(
                              "condicionContractualId",
                              condicion.condicionContractualId
                            );
                            setSelectedCondicionId(
                              condicion.condicionContractualId
                            );
                          }}
                        >
                          <div className="font-medium">
                            {condicion.tipo_servicio}
                          </div>
                          <div className="text-sm text-gray-500">
                            Período:{" "}
                            {new Date(
                              condicion.fecha_inicio
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(condicion.fecha_fin).toLocaleDateString()}
                          </div>
                          {isAdmin && (
                            <div className="text-sm text-gray-500">
                              Tarifa: ${condicion.tarifa} (
                              {condicion.periodicidad})
                            </div>
                          )}
                          {condicion.condiciones_especificas && (
                            <div className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">
                                Condiciones específicas:
                              </span>{" "}
                              <p className="italic">
                                &quot;{condicion.condiciones_especificas}&quot;
                              </p>
                            </div>
                          )}
                          <Badge
                            className={`mt-2 ${
                              condicion.estado === "Activo"
                                ? "bg-green-100 text-green-800"
                                : condicion.estado === "Terminado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {condicion.estado}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.condicionContractualId && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.condicionContractualId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Paso 3: Detalles de Retiro */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clipboard className="h-5 w-5" />
                    Detalles del Servicio de Retiro
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Fecha Programada */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Fecha y Hora Programada
                      </label>
                      <Controller
                        name="fechaProgramada"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <SimpleDatePicker
                              date={field.value}
                              onChange={(date) => field.onChange(date)}
                              format="dd/MM/yyyy"
                              placeholder="Seleccione fecha y hora"
                              className="w-full"
                              showTimeSelect={true}
                            />
                            {errors.fechaProgramada && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.fechaProgramada.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Cantidad de Vehículos */}
                    <Controller
                      name="cantidadVehiculos"
                      control={control}
                      render={({ field, fieldState }) => (
                        <FormField
                          label="Cantidad de Vehículos"
                          name="cantidadVehiculos"
                          type="number"
                          value={field.value?.toString() || "1"}
                          onChange={(value) =>
                            field.onChange(parseInt(value, 10))
                          }
                          error={fieldState.error?.message}
                          min={1}
                        />
                      )}
                    />

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
                          className="md:col-span-2"
                        />
                      )}
                    />
                    {/* Notas */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">
                        Notas (Opcional)
                      </label>
                      <Controller
                        name="notas"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Ingrese notas adicionales sobre el retiro (urgencia, motivo, etc.)"
                            className="min-h-[100px]"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 4: Asignación de Recursos */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Selección de Baños, Empleados y Vehículos para Retiro
                  </h2>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Selección de Baños Instalados */}
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                          Baños a Retirar (Selección Obligatoria)
                          <Badge variant="outline" className="bg-red-50">
                            {selectedBanos.length} seleccionados
                          </Badge>
                        </h3>

                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700">
                            <strong>Importante:</strong> Debe seleccionar al
                            menos un baño para retirar. Estos son los baños
                            instalados que serán retirados durante el servicio.
                          </p>
                        </div>

                        {banosInstalados.length === 0 ? (
                          <div className="text-center py-8 border border-red-200 bg-red-50 rounded-md">
                            <p className="text-red-600 font-medium">
                              No hay baños instalados para este cliente.
                            </p>
                            <p className="text-red-500 text-sm mt-1">
                              No se puede crear un servicio de retiro sin baños
                              instalados.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {banosInstalados.map((bano) => (
                              <div
                                key={bano.baño_id}
                                className={`border p-3 rounded-md cursor-pointer transition-colors ${
                                  selectedBanos.includes(
                                    parseInt(bano.baño_id || "0")
                                  )
                                    ? "bg-red-50 border-red-300"
                                    : "hover:bg-slate-50"
                                }`}
                                onClick={() =>
                                  handleBanoSelection(
                                    parseInt(bano.baño_id || "0")
                                  )
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      Código: {bano.codigo_interno}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Modelo: {bano.modelo}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Adquirido:{" "}
                                      {new Date(
                                        bano.fecha_adquisicion
                                      ).toLocaleDateString()}
                                    </p>
                                    {selectedBanos.includes(
                                      parseInt(bano.baño_id || "0")
                                    ) && (
                                      <p className="text-xs text-red-600 font-medium mt-1">
                                        ✓ Seleccionado para retiro
                                      </p>
                                    )}
                                  </div>
                                  <Badge
                                    className={
                                      bano.estado === "ASIGNADO"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {bano.estado}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selección de Empleados */}
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                          Seleccionar Empleados
                          <Badge variant="outline" className="bg-red-50">
                            {selectedEmpleados.length} seleccionados
                          </Badge>
                        </h3>

                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm font-medium mb-2">
                            Asignación de roles:
                          </p>
                          <p>
                            <span className="font-medium">Rol A (azul):</span>{" "}
                            Conductor principal con vehículo asignado
                          </p>
                          <p>
                            <span className="font-medium">Rol B (verde):</span>{" "}
                            Asistente/s de retiro
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Después de seleccionar un empleado, puede asignarle
                            un rol haciendo clic en los botones de &quot;Rol
                            A&quot; o &quot;Rol B&quot;
                          </p>

                          {/* Resumen de asignaciones actuales */}
                          {(empleadoRolA !== null || empleadoRolB !== null) && (
                            <div className="mt-3 pt-2 border-t border-blue-200">
                              <p className="font-medium mb-1">
                                Asignaciones actuales:
                              </p>
                              {empleadoRolA !== null &&
                                empleadosDisponibles && (
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-600">Rol A</Badge>
                                    <span>
                                      {
                                        empleadosDisponibles.find(
                                          (e: Empleado) => e.id === empleadoRolA
                                        )?.nombre
                                      }{" "}
                                      {
                                        empleadosDisponibles.find(
                                          (e: Empleado) => e.id === empleadoRolA
                                        )?.apellido
                                      }
                                    </span>
                                  </div>
                                )}
                              {empleadoRolB !== null &&
                                empleadosDisponibles && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-green-600">
                                      Rol B
                                    </Badge>
                                    <span>
                                      {
                                        empleadosDisponibles.find(
                                          (e: Empleado) => e.id === empleadoRolB
                                        )?.nombre
                                      }{" "}
                                      {
                                        empleadosDisponibles.find(
                                          (e: Empleado) => e.id === empleadoRolB
                                        )?.apellido
                                      }
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {empleadosDisponibles.length === 0 ? (
                          <div className="text-center py-8 border rounded-md">
                            <p className="text-gray-500">
                              No hay empleados disponibles.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {empleadosDisponibles.map((empleado) => (
                              <div
                                key={empleado.id}
                                className={`border p-3 rounded-md cursor-pointer transition-colors ${
                                  selectedEmpleados.includes(empleado.id)
                                    ? "bg-red-50 border-red-300"
                                    : "hover:bg-slate-50"
                                }`}
                                onClick={() =>
                                  handleEmpleadoSelection(empleado.id)
                                }
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-3">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                        selectedEmpleados.includes(empleado.id)
                                          ? "bg-red-500"
                                          : "bg-slate-400"
                                      }`}
                                    >
                                      {empleado.nombre.charAt(0)}
                                      {empleado.apellido.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="flex-grow">
                                    <p className="font-medium">{`${empleado.apellido}, ${empleado.nombre}`}</p>
                                    <p className="text-xs text-gray-500">{`DNI: ${empleado.documento}`}</p>
                                    <p className="text-xs text-gray-500">{`Cargo: ${empleado.cargo}`}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="bg-green-100 text-green-800 hover:bg-green-100"
                                      >
                                        {empleado.estado}
                                      </Badge>

                                      {selectedEmpleados.includes(
                                        empleado.id
                                      ) && (
                                        <div className="flex gap-1 mt-1">
                                          <Badge
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEmpleadoRolA(empleado.id);
                                              if (
                                                empleadoRolB === empleado.id
                                              ) {
                                                setEmpleadoRolB(null);
                                              }
                                            }}
                                            className={`cursor-pointer ${
                                              empleadoRolA === empleado.id
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-gray-300 hover:bg-gray-400"
                                            }`}
                                          >
                                            Rol A
                                          </Badge>
                                          <Badge
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEmpleadoRolB(empleado.id);
                                              if (
                                                empleadoRolA === empleado.id
                                              ) {
                                                setEmpleadoRolA(null);
                                              }
                                            }}
                                            className={`cursor-pointer ${
                                              empleadoRolB === empleado.id
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-gray-300 hover:bg-gray-400"
                                            }`}
                                          >
                                            Rol B
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {errors.empleadosIds && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.empleadosIds.message}
                          </p>
                        )}
                      </div>

                      {/* Selección de Vehículos */}
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                          Seleccionar Vehículos
                          <Badge variant="outline" className="bg-red-50">
                            {selectedVehiculos.length} seleccionados
                          </Badge>
                        </h3>

                        {vehiculosDisponibles.length === 0 ? (
                          <div className="text-center py-8 border rounded-md">
                            <p className="text-gray-500">
                              No hay vehículos disponibles.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vehiculosDisponibles.map((vehiculo) => (
                              <div
                                key={vehiculo.id}
                                className={`border p-3 rounded-md cursor-pointer transition-colors ${
                                  selectedVehiculos.includes(vehiculo.id)
                                    ? "bg-red-50 border-red-300"
                                    : "hover:bg-slate-50"
                                }`}
                                onClick={() =>
                                  handleVehiculoSelection(vehiculo.id)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-grow">
                                    <p className="font-medium">
                                      {vehiculo.marca} {vehiculo.modelo}
                                    </p>
                                    <p className="text-sm">
                                      Placa: {vehiculo.placa}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {vehiculo.anio} •{" "}
                                      {vehiculo.tipoCabina || "N/A"}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800">
                                    {vehiculo.estado}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {errors.vehiculosIds && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.vehiculosIds.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Crear Servicio de Retiro
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
