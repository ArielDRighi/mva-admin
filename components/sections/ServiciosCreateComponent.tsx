"use client";

import { createServiceAutomatic } from "@/app/actions/services";
import { getClients } from "@/app/actions/clientes";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/local/FormField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Cliente } from "@/types/types";
import { getAllContractualConditions } from "@/app/actions/contractualConditions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  Calendar,
  MapPin,
  FileText,
  Truck,
  UserRound,
  ClipboardList,
  Phone,
  User2,
  FileSpreadsheet,
  ArrowLeft,
  Save,
} from "lucide-react";
import Loader from "@/components/ui/local/Loader";

const ServiciosCreateComponent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [condiciones, setConditions] = useState<{
    items: Array<{
      condicionContractualId: number;
      tipo_de_contrato: string;
      fecha_inicio: string;
      fecha_fin: string;
      condiciones_especificas: string;
      periodicidad: string;
      tarifa: string;
      estado: string;
    }>;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  }>();

  useEffect(() => {
    const fetchConditions = async () => {
      const conditions = await getAllContractualConditions();
      setConditions(conditions);
    };

    fetchConditions();
  }, []);

  // Define schema for automatic service creation
  const createServiceSchema = z.object({
    clienteId: z.number({
      required_error: "El cliente es obligatorio",
      invalid_type_error: "El ID del cliente debe ser un número",
    }),
    fechaProgramada: z
      .string()
      .min(1, "La fecha de servicio es obligatoria")
      .refine(
        (value) => !isNaN(Date.parse(value)),
        "Formato de fecha inválido"
      ),
    tipoServicio: z.string().min(1, "El tipo de servicio es obligatorio"),
    descripcion: z.string().optional(),
    ubicacion: z.string().min(1, "La ubicación es obligatoria"),
    contactoNombre: z.string().min(1, "El nombre de contacto es obligatorio"),
    contactoTelefono: z
      .string()
      .regex(/^\d{3}-\d{4}-\d{4}$/, "Formato de teléfono incorrecto"),
    estado: z.string().default("PROGRAMADO"),
    cantidadVehiculos: z.number().min(1, "Se requiere al menos un vehículo"),
    cantidadEmpleados: z.number().min(1, "Se requiere al menos un empleado"),
    cantidadBanos: z.number().min(0, "No puede ser negativo"),
    condicionContractualId: z.number({
      required_error: "La condición contractual es obligatoria",
      invalid_type_error:
        "El ID de la condición contractual debe ser un número",
    }),
  });

  const form = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      clienteId: 0,
      fechaProgramada: new Date().toISOString().split("T")[0],
      tipoServicio: "",
      descripcion: "",
      ubicacion: "",
      contactoNombre: "",
      contactoTelefono: "",
      estado: "PENDIENTE",
      cantidadVehiculos: 0,
      cantidadEmpleados: 0,
      cantidadBanos: 0,
      condicionContractualId: 0,
    },
  });

  const { control, handleSubmit, reset } = form;

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getClients();

      if (result && result.items) {
        setClients(result.items);
      } else {
        console.error("No client data returned from API");
        toast.error("Error", {
          description: "No se recibieron datos de clientes del servidor.",
        });
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los clientes.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const onSubmit = async (data: z.infer<typeof createServiceSchema>) => {
    try {
      setLoading(true);

      // Validar que se esté solicitando al menos un recurso
      if (
        data.cantidadVehiculos === 0 &&
        data.cantidadEmpleados === 0 &&
        data.cantidadBanos === 0
      ) {
        toast.error("Error", {
          description: "Debe solicitar al menos un recurso para el servicio.",
        });
        setLoading(false);
        return;
      }

      const apiData = {
        clienteId: data.clienteId,
        fechaProgramada: new Date(data.fechaProgramada).toISOString(),
        tipoServicio: data.tipoServicio,
        ubicacion: data.ubicacion,
        estado: "PROGRAMADO",
        cantidadVehiculos: Math.max(1, data.cantidadVehiculos),
        cantidadEmpleados: Math.max(1, data.cantidadEmpleados),
        cantidadBanos: data.cantidadBanos,
        asignacionAutomatica: true,
        condicionContractualId: data.condicionContractualId,
      };

      const created = await createServiceAutomatic(apiData);

      toast.success("Servicio creado", {
        description:
          "El servicio se ha creado correctamente con asignación automática.",
      });

      // Redirigir a la lista de servicios después de crearlo
      router.push("/admin/dashboard/servicios/listado");
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear el servicio.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && clients.length === 0) {
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
              Crear Nuevo Servicio
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Complete los datos para crear un servicio con asignación
              automática
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push("/admin/dashboard/servicios/listado")}
            className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center mb-4">
                  <Building className="h-4 w-4 mr-2" />
                  INFORMACIÓN DEL CLIENTE
                </h3>
                <div className="space-y-4">
                  <Controller
                    name="clienteId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Cliente"
                        name="clienteId"
                        fieldType="select"
                        value={field.value ? String(field.value) : ""}
                        onChange={(value) => field.onChange(Number(value))}
                        options={clients.map((client) => ({
                          label: client.nombre,
                          value: String(client.clienteId),
                        }))}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="condicionContractualId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Condición Contractual"
                        name="condicionContractualId"
                        fieldType="select"
                        value={field.value ? String(field.value) : ""}
                        onChange={(value) => field.onChange(Number(value))}
                        options={
                          condiciones?.items.map((condition) => ({
                            label: `${condition.tipo_de_contrato} - ${condition.tarifa} (${condition.periodicidad})`,
                            value: String(condition.condicionContractualId),
                          })) || []
                        }
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center mb-4">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  DATOS DEL SERVICIO
                </h3>
                <div className="space-y-4">
                  <Controller
                    name="tipoServicio"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Tipo de servicio"
                        name="tipoServicio"
                        fieldType="select"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { label: "Instalación", value: "INSTALACION" },
                          { label: "Retiro", value: "RETIRO" },
                          { label: "Limpieza", value: "LIMPIEZA" },
                          { label: "Mantenimiento", value: "MANTENIMIENTO" },
                        ]}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="fechaProgramada"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Fecha programada"
                        name="fechaProgramada"
                        type="date"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="ubicacion"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Dirección de servicio"
                        name="ubicacion"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center mb-4">
                  <User2 className="h-4 w-4 mr-2" />
                  CONTACTO EN SITIO
                </h3>
                <div className="space-y-4">
                  <Controller
                    name="contactoNombre"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Nombre de contacto"
                        name="contactoNombre"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="contactoTelefono"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Teléfono de contacto"
                        name="contactoTelefono"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="123-4567-8901"
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Descripción"
                        name="descripcion"
                        type="textarea"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center mb-4">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  RECURSOS REQUERIDOS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="cantidadVehiculos"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Vehículos"
                        name="cantidadVehiculos"
                        type="number"
                        value={String(field.value)}
                        onChange={(value) => field.onChange(Number(value))}
                        error={fieldState.error?.message}
                        min={0}
                      />
                    )}
                  />

                  <Controller
                    name="cantidadEmpleados"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Empleados"
                        name="cantidadEmpleados"
                        type="number"
                        value={String(field.value)}
                        onChange={(value) => field.onChange(Number(value))}
                        error={fieldState.error?.message}
                        min={0}
                      />
                    )}
                  />

                  <Controller
                    name="cantidadBanos"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormField
                        label="Sanitarios"
                        name="cantidadBanos"
                        type="number"
                        value={String(field.value)}
                        onChange={(value) => field.onChange(Number(value))}
                        error={fieldState.error?.message}
                        min={0}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/servicios/listado")}
              className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4" /> Creando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Crear Servicio
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiciosCreateComponent;
