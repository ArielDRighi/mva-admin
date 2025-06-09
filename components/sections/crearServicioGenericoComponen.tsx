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
import {
  CreateLimpiezaDto,
  createServicioGenerico,
} from "@/app/actions/services";
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
  Bath,
} from "lucide-react";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { getEmployees } from "@/app/actions/empleados";
import { getVehicles } from "@/app/actions/vehiculos";
import { getSanitariosByClient } from "@/app/actions/sanitarios";

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
  // Step 4
  banosInstalados: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un baño"),
  empleadosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un empleado"),
  vehiculosIds: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un vehículo"),

  // Additional fields for service creation
  tipoServicio: z.literal(ServiceType.LIMPIEZA),
  asignacionAutomatica: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type CondicionContractual = {
  condicionContractualId: number;
  clientId: number;
  tipo_de_contrato: string;
  tipo_servicio?: string; // Agregando tipo de servicio
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

export function CrearServicioGenericoComponent() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);  const [searchTermCliente, setSearchTermCliente] = useState<string>("");

  const [condicionesContractuales, setCondicionesContractuales] = useState<
    CondicionContractual[]
  >([]);

  const [banosInstalados, setBanosInstalados] = useState<Sanitario[]>([]);
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
      tipoServicio: ServiceType.LIMPIEZA,
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

        // Definimos una interfaz para la respuesta esperada
        interface ClientesResponse {
          items?: Cliente[];
          data?: Cliente[];
          total?: number;
          page?: number;
        }

        const clientesData = (await getClients()) as ClientesResponse;

        if (clientesData && typeof clientesData === "object") {
          // Si tiene la propiedad items, usarla
          if ("items" in clientesData && Array.isArray(clientesData.items)) {
            setClientes(clientesData.items);
            setFilteredClientes(clientesData.items);
          }
          // Si tiene la propiedad data, usarla como alternativa
          else if ("data" in clientesData && Array.isArray(clientesData.data)) {
            setClientes(clientesData.data);
            setFilteredClientes(clientesData.data);
          }
          // Si es directamente un array
          else if (Array.isArray(clientesData)) {
            setClientes(clientesData);
            setFilteredClientes(clientesData);
          }
          // Si no coincide con ninguno de los formatos esperados
          else {
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
  }, [searchTermCliente, clientes]); // Cargar condiciones contractuales cuando se selecciona un cliente

  useEffect(() => {
    const fetchCondicionesContractuales = async () => {
      if (selectedClientId && selectedClientId > 0) {
        try {
          setIsLoading(true);

          interface CondicionesResponse {
            items?: CondicionContractual[];
            data?: CondicionContractual[];
          }          const condicionesData = (await getContractualConditionsByClient(
            selectedClientId
          )) as CondicionesResponse | CondicionContractual[];

          // Debug temporal para ver la estructura de datos
          console.log("Condiciones contractuales recibidas:", condicionesData);

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

          // Solo resetear el valor si estamos cambiando de cliente
          // No lo resetea si ya se ha seleccionado una condición
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

          // Cargar empleados y vehículos disponibles con tipos correctos
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
                (empleado) => empleado.estado === "DISPONIBLE"
              );
            } else if (
              "items" in empleadosResponse &&
              Array.isArray(empleadosResponse.items)
            ) {
              empleadosDisp = empleadosResponse.items.filter(
                (empleado) => empleado.estado === "DISPONIBLE"
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
                (vehiculo) => vehiculo.estado === "DISPONIBLE"
              );
            } else if (
              "items" in vehiculosResponse &&
              Array.isArray(vehiculosResponse.items)
            ) {
              vehiculosDisp = vehiculosResponse.items.filter(
                (vehiculo) => vehiculo.estado === "DISPONIBLE"
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

          // Cargar baños instalados para el cliente con manejo adecuado de tipos
          interface SanitariosResponse {
            data?: Sanitario[];
            items?: Sanitario[];
          }

          const banosClienteResponse = (await getSanitariosByClient(
            selectedClientId
          )) as SanitariosResponse | Sanitario[];

          // Procesamiento de la respuesta
          if (Array.isArray(banosClienteResponse)) {
            setBanosInstalados(banosClienteResponse);
          } else if (
            banosClienteResponse &&
            typeof banosClienteResponse === "object"
          ) {
            if (
              "data" in banosClienteResponse &&
              Array.isArray(banosClienteResponse.data)
            ) {
              setBanosInstalados(banosClienteResponse.data);
            } else if (
              "items" in banosClienteResponse &&
              Array.isArray(banosClienteResponse.items)
            ) {
              setBanosInstalados(banosClienteResponse.items);
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
  }, [selectedClientId, selectedFechaProgramada, step]);
  // Manejar selección de empleado
  const handleEmpleadoSelection = (empleadoId: number) => {
    const updatedSelection = selectedEmpleados.includes(empleadoId)
      ? selectedEmpleados.filter((id) => id !== empleadoId)
      : [...selectedEmpleados, empleadoId];

    // Si estamos deseleccionando un empleado, también quitarlo de los roles
    if (selectedEmpleados.includes(empleadoId) && !updatedSelection.includes(empleadoId)) {
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
    // Estas funciones se utilizan directamente en los botones onClick
  // Actualizar las asignaciones manuales en el formulario
  const updateAsignacionesManual = (
    empleadosIds: number[], 
    vehiculosIds: number[], 
    rolA: number | null = empleadoRolA, 
    rolB: number | null = empleadoRolB
  ) => {
    // Determinar empleado A y B para asignaciones
    const empleadoA = rolA !== null ? rolA : (empleadosIds.length > 0 ? empleadosIds[0] : 0);
    const empleadoB = rolB !== null ? rolB : (empleadosIds.length > 1 ? empleadosIds[1] : 0);
    
    // Asignar vehículo al empleado A (si hay vehículos seleccionados)
    const vehiculoAsignado = vehiculosIds.length > 0 ? vehiculosIds[0] : 0;
    
    // Actualizar consola para debugging
    console.log("Asignaciones actualizadas:", {
      empleadoA,
      empleadoB,
      vehiculoAsignado,
      rolAAsignado: rolA,
      rolBAsignado: rolB
    });
    
    // Las asignaciones serán usadas en onSubmit
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
  };  // Avanzar al siguiente paso
  const handleNextStep = async () => {
    // Validar campos según el paso actual
    let isStepValid = false;

    switch (step) {
      case 1:
        isStepValid = await trigger("clienteId");
        break;
      case 2:
        // Verificar primero si hay condiciones contractuales disponibles
        if (condicionesContractuales.length === 0) {
          toast.error("Este cliente no tiene condiciones contractuales", {
            description: "Por favor, seleccione otro cliente o cree una condición contractual antes de continuar."
          });
          return false;
        }
        
        isStepValid = await trigger("condicionContractualId");
        // Double-check that we have a valid condition selected
        const currentCondicionId = getValues("condicionContractualId");
        console.log(
          "Validating step 2, condicionContractualId:",
          currentCondicionId
        );

        if (currentCondicionId <= 0 || !currentCondicionId) {
          // If form validation didn't catch it, enforce it here
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
      // Log the values before advancing to catch any issues
      console.log(
        "Advancing to next step. Current form values:",
        form.getValues()
      );
      setStep((prevStep) => prevStep + 1);
    }
  };
  // Retroceder al paso anterior
  const handlePrevStep = () => {
    // Asegurarse de que los datos del formulario sean consistentes al moverse entre pasos
    console.log(
      "Going back to previous step. Current form values:",
      form.getValues()
    );

    // Si venimos del paso 3, asegurarse de que la condición contractual esté correctamente establecida
    if (step === 3) {
      if (selectedCondicionId > 0) {
        setValue("condicionContractualId", selectedCondicionId);
        console.log("Restored condicionContractualId to", selectedCondicionId);
      }    }

    setStep((prevStep) => prevStep - 1);
  };  
  
  // Enviar formulario  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Validar que haya al menos un empleado seleccionado para el rol A si hay vehículos seleccionados
      if (data.vehiculosIds.length > 0 && empleadoRolA === null && data.empleadosIds.length === 0) {
        toast.error("Error en la asignación de roles", {
          description: "Debe seleccionar al menos un empleado para el rol de conductor (Rol A) cuando hay vehículos asignados.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Si hay vehículos y empleados pero no se asignó el rol A, asignar automáticamente
      if (data.vehiculosIds.length > 0 && empleadoRolA === null && data.empleadosIds.length > 0) {
        setEmpleadoRolA(data.empleadosIds[0]);
        // Si hay más de un empleado y no hay rol B asignado
        if (data.empleadosIds.length > 1 && empleadoRolB === null) {
          setEmpleadoRolB(data.empleadosIds[1]);
        }
        // Notificar al usuario
        toast.info("Roles asignados automáticamente", {
          description: "Se han asignado roles automáticamente a los empleados seleccionados.",
        });
      }

      // Determinar quiénes son los empleados para los roles A y B
      // Si hay roles asignados explícitamente, usarlos; si no, usar los primeros empleados seleccionados
      const empleadoA = empleadoRolA !== null 
        ? empleadoRolA 
        : (data.empleadosIds.length > 0 ? data.empleadosIds[0] : 0);
      
      // Para el empleado B, si hay un rol asignado, usarlo; 
      // si no, usar el segundo empleado seleccionado o el primero si solo hay uno y no es el mismo que empleadoA
      const empleadoB = empleadoRolB !== null
        ? empleadoRolB
        : (data.empleadosIds.length > 1 
            ? (data.empleadosIds[0] !== empleadoA ? data.empleadosIds[0] : data.empleadosIds[1])
            : (data.empleadosIds.length === 1 && data.empleadosIds[0] !== empleadoA ? data.empleadosIds[0] : 0));
      
      console.log("Asignación de roles:", { 
        empleadoA, 
        empleadoB, 
        seleccionados: data.empleadosIds, 
        rolAAsignado: empleadoRolA,
        rolBAsignado: empleadoRolB
      });      // Recuperar los empleados por nombre para mostrar en el log y confirmar
      const empleadoAObj = empleadoA ? empleadosDisponibles.find((e: Empleado) => e.id === empleadoA) : null;
      const empleadoBObj = empleadoB ? empleadosDisponibles.find((e: Empleado) => e.id === empleadoB) : null;
      
      const empleadoANombre = empleadoAObj ? `${empleadoAObj.nombre} ${empleadoAObj.apellido}` : 'Ninguno';
      const empleadoBNombre = empleadoBObj ? `${empleadoBObj.nombre} ${empleadoBObj.apellido}` : 'Ninguno';

      console.log(`Rol A (conductor): ${empleadoANombre} (ID: ${empleadoA})`);
      console.log(`Rol B (asistente): ${empleadoBNombre} (ID: ${empleadoB})`);

      // Preparar las asignaciones manuales según el formato exacto requerido por CreateLimpiezaDto
      const asignacionesManual: [
        { empleadoId: number; vehiculoId: number },
        { empleadoId: number }
      ] = [
        {
          // Rol A: Conductor principal con vehículo
          empleadoId: empleadoA,
          vehiculoId: data.vehiculosIds.length > 0 ? data.vehiculosIds[0] : 0,
        },
        {
          // Rol B: Empleado adicional/asistente
          empleadoId: empleadoB,
        },
      ];

      // Objeto para enviar a la API - usando la estructura exacta de CreateLimpiezaDto
      const servicioRequest: CreateLimpiezaDto = {
        tipoServicio: "LIMPIEZA", // Tipo literal exacto
        condicionContractualId:
          selectedCondicionId || data.condicionContractualId,
        cantidadVehiculos: data.cantidadVehiculos,
        fechaProgramada: data.fechaProgramada.toISOString(),
        ubicacion: data.ubicacion,
        asignacionAutomatica: false,
        banosInstalados: data.banosInstalados,
        asignacionesManual: asignacionesManual,
        notas: data.notas || "Limpieza mensual según contrato",
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

      // Crear el servicio y tipar correctamente la respuesta
      // Define ServicioResponse type if not imported
      type ServicioResponse = {
        id?: number;
        success?: boolean;
        message?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      };

      const response = (await createServicioGenerico(
        servicioRequest
      )) as ServicioResponse;

      // Verificar la respuesta
      if (response && response.id) {
        toast.success("Servicio de limpieza creado", {
          description: `El servicio de limpieza #${response.id} se ha creado exitosamente.`,
        });
      } else if (response && response.success) {
        toast.success("Servicio de limpieza creado", {
          description:
            response.message ||
            "El servicio de limpieza se ha creado exitosamente.",
        });
      } else {
        toast.success("Servicio de limpieza creado", {
          description: "El servicio de limpieza se ha creado exitosamente.",
        });
      }

      // Redireccionar a la página de listado de servicios después de un breve retraso
      setTimeout(() => {
        router.push("/admin/services");
      }, 1000);
    } catch (error) {
      console.error("Error al crear el servicio:", error);

      // Extraer el mensaje de error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo crear el servicio. Por favor, intente nuevamente.";

      // Log detallado para debugging
      console.log({
        errorType: typeof error,
        errorObject: JSON.stringify(error, null, 2),
        errorMessage,
      });

      // Mostrar toast con el mensaje específico del error
      toast.error("Error al crear el servicio", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && step === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
        <Loader />
      </div>
    );
  }
  // Log the current form state when component renders
  console.log("Component rendering with form state:", {
    values: form.getValues(),
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitted: form.formState.isSubmitted,
    isSubmitting: form.formState.isSubmitting,
    isSubmitSuccessful: form.formState.isSubmitSuccessful,
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crear Servicio de Limpieza</h1>
            <p className="text-gray-600">
              Complete el formulario para crear un nuevo servicio de limpieza
            </p>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2">
            <Badge
              className={`px-3 py-1 ${
                step >= 1 ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              1. Cliente
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 2 ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              2. Condición Contractual
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 3 ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              3. Detalles de Limpieza
            </Badge>
            <Badge
              className={`px-3 py-1 ${
                step >= 4 ? "bg-blue-500" : "bg-gray-300"
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
                  console.log("Form submitted successfully, data:", data);
                  onSubmit(data);
                },
                (errors) => {
                  console.error("Form validation failed:", errors);
                  console.log("Current form values:", form.getValues());
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
                            ? "border-blue-500 bg-blue-50"
                            : "hover:border-blue-300 hover:bg-blue-50/50"
                        }`}                        onClick={async () => {
                          if (cliente.clienteId !== undefined) {
                            setValue("clienteId", cliente.clienteId);
                            // Reset condicionContractualId when changing clients to avoid confusion
                            if (selectedClientId !== cliente.clienteId) {
                              setValue("condicionContractualId", 0);
                              setSelectedCondicionId(0);
                              
                              // Verificar si el cliente tiene condiciones contractuales
                              try {
                                setIsLoading(true);
                                
                                interface CondicionesResponse {
                                  items?: CondicionContractual[];
                                  data?: CondicionContractual[];
                                }
                                
                                const condicionesData = await getContractualConditionsByClient(cliente.clienteId) as CondicionesResponse | CondicionContractual[];
                                
                                let condiciones: CondicionContractual[] = [];
                                
                                if (Array.isArray(condicionesData)) {
                                  condiciones = condicionesData;
                                } else if (condicionesData && typeof condicionesData === "object") {
                                  if ("items" in condicionesData && Array.isArray(condicionesData.items)) {
                                    condiciones = condicionesData.items;
                                  } else if ("data" in condicionesData && Array.isArray(condicionesData.data)) {
                                    condiciones = condicionesData.data;
                                  }
                                }
                                
                                if (condiciones.length === 0) {
                                  toast.warning(`${cliente.nombre} no tiene condiciones contractuales`, {
                                    description: "Este cliente no tiene condiciones contractuales configuradas, lo que será necesario para crear un servicio.",
                                    duration: 5000
                                  });
                                }
                              } catch (error) {
                                console.error("Error al verificar condiciones contractuales:", error);
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }
                        }}
                      >                        <div className="font-medium text-lg">
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
                  </h2>                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader />
                    </div>
                  ) : condicionesContractuales.length === 0 ? (
                    <div className="text-center py-8 border rounded-md flex flex-col items-center">
                      <p className="text-red-500 font-semibold mb-2">
                        No hay condiciones contractuales disponibles
                      </p>
                      <p className="text-gray-500 mb-4">
                        Este cliente no tiene condiciones contractuales configuradas.
                        Primero debe crear al menos una condición contractual para poder asignarle un servicio.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handlePrevStep}
                        className="mt-2"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Seleccionar otro cliente
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
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                          onClick={() => {
                            // Update the form value
                            setValue(
                              "condicionContractualId",
                              condicion.condicionContractualId
                            );
                            // Also update the selected condition ID state
                            setSelectedCondicionId(
                              condicion.condicionContractualId
                            );
                          }}                        >
                          <div className="font-medium">
                            {condicion.tipo_servicio || condicion.tipo_de_contrato}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tipo de Contrato: {condicion.tipo_de_contrato}
                          </div>
                          <div className="text-sm text-gray-500">
                            Período:{" "}
                            {new Date(
                              condicion.fecha_inicio
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(condicion.fecha_fin).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tarifa: ${condicion.tarifa} (
                            {condicion.periodicidad})
                          </div>
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
                  )}{" "}
                  {errors.condicionContractualId && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.condicionContractualId.message}
                    </p>
                  )}
                  {/* Debug information (only visible in development) */}
                  {process.env.NODE_ENV !== "production" && (
                    <div className="mt-4 px-4 py-2 rounded bg-gray-100 border border-gray-200">
                      <h3 className="font-medium text-sm mb-1">Debug Info:</h3>
                      <p className="text-xs text-gray-600">
                        ID en el state: {selectedCondicionId}
                      </p>
                      <p className="text-xs text-gray-600">
                        ID en el formulario:{" "}
                        {getValues("condicionContractualId")}
                      </p>
                      {selectedCondicionId !==
                        getValues("condicionContractualId") && (
                        <p className="text-xs text-red-500 font-bold mt-1">
                          ¡Atención! El valor seleccionado no coincide con el
                          valor del formulario.
                        </p>
                      )}
                    </div>
                  )}
                  {/* Mostrar el valor actual para debugging */}
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Condición contractual seleccionada ID:{" "}
                      {selectedCondicionId}
                    </p>
                    <p>
                      Valor en el formulario:{" "}
                      {getValues("condicionContractualId")}
                    </p>
                    {selectedCondicionId !==
                      getValues("condicionContractualId") && (
                      <p className="text-red-500">
                        ¡Atención! El valor seleccionado no coincide con el
                        valor del formulario.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 3: Detalles de Limpieza */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clipboard className="h-5 w-5" />
                    Detalles del Servicio de Limpieza
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Fecha Programada */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Fecha Programada
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
                              placeholder="Seleccione fecha"
                              className="w-full"
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
                            placeholder="Ingrese notas adicionales sobre el servicio"
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
                    <Bath className="h-5 w-5" />
                    Selección de Baños, Empleados y Vehículos
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
                          Seleccionar Baños Instalados
                          <Badge variant="outline" className="bg-blue-50">
                            {selectedBanos.length} seleccionados
                          </Badge>
                        </h3>

                        {banosInstalados.length === 0 ? (
                          <div className="text-center py-8 border rounded-md">
                            <p className="text-gray-500">
                              No hay baños instalados para este cliente.
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
                                    ? "bg-blue-50 border-blue-300"
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

                        {errors.banosInstalados && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.banosInstalados.message}
                          </p>
                        )}
                      </div>                      {/* Selección de Empleados */}
                      <div>                        <h3 className="text-lg font-medium mb-3 flex items-center justify-between">
                          Seleccionar Empleados
                          <Badge variant="outline" className="bg-blue-50">
                            {selectedEmpleados.length} seleccionados
                          </Badge>
                        </h3>                        <div className="bg-blue-50 p-3 rounded-md mb-3 text-sm">
                          <p className="font-medium mb-1">Asignación de roles:</p>
                          <p><span className="font-medium">Rol A (azul):</span> Conductor principal con vehículo asignado</p>
                          <p><span className="font-medium">Rol B (verde):</span> Asistente/s</p>
                          <p className="mt-1 text-xs text-gray-500">Después de seleccionar un empleado, puede asignarle un rol haciendo clic en los botones de &quot;Rol A&quot; o &quot;Rol B&quot;</p>
                          
                          {/* Resumen de asignaciones actuales */}
                          {(empleadoRolA !== null || empleadoRolB !== null) && (
                            <div className="mt-3 pt-2 border-t border-blue-200">
                              <p className="font-medium mb-1">Asignaciones actuales:</p>
                              {empleadoRolA !== null && empleadosDisponibles && (
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-600">Rol A</Badge>
                                  <span>
                                    {empleadosDisponibles.find((e: Empleado) => e.id === empleadoRolA)?.nombre} {' '}
                                    {empleadosDisponibles.find((e: Empleado) => e.id === empleadoRolA)?.apellido}
                                  </span>
                                </div>
                              )}
                              {empleadoRolB !== null && empleadosDisponibles && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-green-600">Rol B</Badge>
                                  <span>
                                    {empleadosDisponibles.find((e: Empleado) => e.id === empleadoRolB)?.nombre} {' '}
                                    {empleadosDisponibles.find((e: Empleado) => e.id === empleadoRolB)?.apellido}
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
                                    ? "bg-blue-50 border-blue-300"
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
                                          ? "bg-blue-500"
                                          : "bg-slate-400"
                                      }`}
                                    >
                                      {empleado.nombre.charAt(0)}
                                      {empleado.apellido.charAt(0)}
                                    </div>
                                  </div>                                  <div className="flex-grow">
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
                                      
                                      {selectedEmpleados.includes(empleado.id) && (
                                        <div className="flex gap-1 mt-1">
                                          <Badge 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEmpleadoRolA(empleado.id);
                                              if (empleadoRolB === empleado.id) {
                                                setEmpleadoRolB(null);
                                              }
                                            }}
                                            className={`cursor-pointer ${empleadoRolA === empleado.id 
                                              ? 'bg-blue-600 hover:bg-blue-700' 
                                              : 'bg-gray-300 hover:bg-gray-400'}`}
                                          >
                                            Rol A
                                          </Badge>
                                          <Badge 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEmpleadoRolB(empleado.id);
                                              if (empleadoRolA === empleado.id) {
                                                setEmpleadoRolA(null);
                                              }
                                            }}
                                            className={`cursor-pointer ${empleadoRolB === empleado.id 
                                              ? 'bg-green-600 hover:bg-green-700' 
                                              : 'bg-gray-300 hover:bg-gray-400'}`}
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
                          <Badge variant="outline" className="bg-blue-50">
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
                                    ? "bg-blue-50 border-blue-300"
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"                    // El onClick no es necesario aquí, ya que estamos usando handleSubmit
                    // que manejará la validación y enviará los datos
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Crear Servicio
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
