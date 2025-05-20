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
  console.log("Condiciones:", condiciones);

  useEffect(() => {
    const fetchConditions = async () => {
      const conditions = await getAllContractualConditions();
      setConditions(conditions);
    };

    fetchConditions();
  }, []);

  // Define schema for automatic service creation
  // ...existing code...
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
    tipoServicio: z.string().min(1, "El tipo de servicio es obligatorio"), // Changed from tipo_servicio
    descripcion: z.string().optional(),
    ubicacion: z.string().min(1, "La ubicación es obligatoria"), // Changed from direccion_servicio
    contactoNombre: z.string().min(1, "El nombre de contacto es obligatorio"), // Changed from contacto_nombre
    contactoTelefono: z
      .string()
      .regex(/^\d{3}-\d{4}-\d{4}$/, "Formato de teléfono incorrecto"),
    estado: z.string().default("PROGRAMADO"),
    cantidadVehiculos: z.number().min(1, "Se requiere al menos un vehículo"),
    cantidadEmpleados: z.number().min(1, "Se requiere al menos un empleado"),
    cantidadBanos: z.number().min(0, "No puede ser negativo"), // Changed from cantidad_sanitarios
    condicionContractualId: z.number({
      required_error: "La condición contractual es obligatoria",
      invalid_type_error:
        "El ID de la condición contractual debe ser un número",
    }),
  });
  // ...existing code...

  // ...existing code...
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
  // ...existing code...

  const { control, handleSubmit, reset } = form;

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getClients();

      if (result && result.items) {
        // Update this line - data is in the "items" property
        setClients(result.items);
        console.log("Clients loaded:", result.items);
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

  // Effect for logging clients state changes
  useEffect(() => {
    console.log("Clients state updated:", clients);
  }, [clients]);

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

      // ...existing code...
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
      // ...existing code...

      console.log("Transformed API data:", apiData);
      const created = await createServiceAutomatic(apiData);
      console.log("Service created:", created);

      // Now you can use the created service data if needed
      // router.push(`/dashboard/servicios/detalle/${created.id}`);

      toast.success("Servicio creado", {
        description:
          "El servicio se ha creado correctamente con asignación automática.",
      });
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        Crear Servicio (Asignación Automática)
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Recursos Requeridos (Asignación Automática)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="cantidadVehiculos"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Cantidad de vehículos"
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
                  label="Cantidad de empleados"
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
                  label="Cantidad de sanitarios"
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

        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/servicios/listado")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Servicio"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiciosCreateComponent;
