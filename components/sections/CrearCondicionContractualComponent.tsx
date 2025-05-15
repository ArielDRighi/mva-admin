"use client";

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
import { createContractualCondition } from "@/app/actions/contractualConditions";
import Loader from "@/components/ui/local/Loader";
import { Cliente } from "@/types/types";
import { getClients } from "@/app/actions/clientes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define el esquema de validación para cada paso
const clienteSchema = z.object({
  clientId: z.number().min(1, "Debe seleccionar un cliente"),
});

const condicionesSchema = z
  .object({
    tipo_de_contrato: z.enum(["Temporal", "Permanente"], {
      required_error: "El tipo de contrato es obligatorio",
    }),
    fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fecha_fin: z.string().optional(),
  })
  .superRefine((obj, ctx) => {
    // Si es Temporal y fecha_fin está vacía, añadir un error
    if (
      obj.tipo_de_contrato === "Temporal" &&
      (!obj.fecha_fin || obj.fecha_fin.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin es obligatoria para contratos temporales",
        path: ["fecha_fin"],
      });
    }
  });

const detallesSchema = z.object({
  condiciones_especificas: z.string().optional(),
  tarifa: z
    .number()
    .min(1, "La tarifa es obligatoria")
    .refine((val) => val > 0, "La tarifa debe ser un valor positivo"),
  periodicidad: z.enum(["Mensual", "Diaria", "Semanal", "Anual"], {
    required_error: "La periodicidad es obligatoria",
  }),
  estado: z.string().min(1, "El estado es obligatorio"),
});

// Combina todos los esquemas para la validación final
const baseCondicionesSchema = z.object({
  tipo_de_contrato: z.enum(["Temporal", "Permanente"], {
    required_error: "El tipo de contrato es obligatorio",
  }),
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fecha_fin: z.string().optional(),
});

const formSchema = clienteSchema
  .merge(baseCondicionesSchema)
  .merge(detallesSchema)
  .refine(
    (data) => {
      // Si es Temporal y fecha_fin está vacía, retornar false para indicar error
      if (
        data.tipo_de_contrato === "Temporal" &&
        (!data.fecha_fin || data.fecha_fin.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "La fecha de fin es obligatoria para contratos temporales",
      path: ["fecha_fin"],
    }
  );

type FormDataSchema = z.infer<typeof formSchema>;

export default function CrearCondicionContractualComponent() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTermLower) ||
          cliente.cuit.toLowerCase().includes(searchTermLower) ||
          cliente.email.toLowerCase().includes(searchTermLower)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  // Inicializar el formulario
  const form = useForm<FormDataSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: 0,
      tipo_de_contrato: "Temporal",
      fecha_inicio: new Date().toISOString().split("T")[0],
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 3))
        .toISOString()
        .split("T")[0],
      condiciones_especificas: "",
      tarifa: 2500,
      periodicidad: "Mensual",
      estado: "Activo",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = form;

  // Crear un efecto para ajustar fecha_fin cuando cambia el tipo de contrato
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "tipo_de_contrato") {
        if (value.tipo_de_contrato === "Permanente") {
          // Para contratos permanentes, establecemos una fecha muy lejana (5 años)
          const fechaLejana = new Date();
          fechaLejana.setFullYear(fechaLejana.getFullYear() + 5);
          form.setValue("fecha_fin", fechaLejana.toISOString().split("T")[0]);
        } else {
          // Para temporales, solo 3 meses por defecto
          const fechaTresMeses = new Date();
          fechaTresMeses.setMonth(fechaTresMeses.getMonth() + 3);
          form.setValue(
            "fecha_fin",
            fechaTresMeses.toISOString().split("T")[0]
          );
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, form]);

  // Maneja el avance al siguiente paso
  const handleNext = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await trigger(["clientId"]);
        break;
      case 2:
        // Si es un contrato Permanente, no validamos fecha_fin
        if (watch("tipo_de_contrato") === "Permanente") {
          isValid = await trigger(["tipo_de_contrato", "fecha_inicio"]);
        } else {
          isValid = await trigger([
            "tipo_de_contrato",
            "fecha_inicio",
            "fecha_fin",
          ]);
        }
        break;
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  // Maneja el retroceso al paso anterior
  const handleBack = () => {
    setStep(step - 1);
  };

  // Maneja el envío del formulario
  const onSubmit = async (data: FormDataSchema) => {
    setIsSubmitting(true);
    try {
      // Aquí se enviaría la data al servidor
      await createContractualCondition(data);

      toast.success("¡Contrato creado correctamente!", {
        description: "La condición contractual ha sido registrada con éxito.",
      });

      setTimeout(() => {
        router.push("/dashboard/condiciones-contractuales");
      }, 2000);
    } catch (error) {
      console.error("Error al crear la condición contractual:", error);
      toast.error("Error al crear la condición contractual", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Condición Contractual</CardTitle>
        <CardDescription>
          {step === 1 && "Selecciona el cliente para el nuevo contrato"}
          {step === 2 && "Define el tipo y período del contrato"}
          {step === 3 && "Establece los detalles financieros y condiciones"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`font-medium ${step >= 1 ? "text-blue-600" : ""}`}>
              Cliente
            </span>
            <span className={`font-medium ${step >= 2 ? "text-blue-600" : ""}`}>
              Período
            </span>
            <span className={`font-medium ${step >= 3 ? "text-blue-600" : ""}`}>
              Detalles
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Paso 1: Selección de cliente */}
        {step === 1 && (
          <div className="space-y-6">
            <Controller
              name="clientId"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cliente
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Buscar clientes por nombre, CUIT o email..."
                      className="pl-10 mb-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader />
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {filteredClientes.length > 0 ? (
                        filteredClientes.map((cliente) => (
                          <div
                            key={cliente.clienteId}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                              field.value === cliente.clienteId
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : ""
                            }`}
                            onClick={() => field.onChange(cliente.clienteId)}
                          >
                            <div className="font-medium">{cliente.nombre}</div>
                            <div className="text-sm text-gray-600">
                              CUIT: {cliente.cuit} | Email: {cliente.email}
                            </div>
                          </div>
                        ))
                      ) : searchTerm.length > 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron clientes con ese criterio de
                          búsqueda.
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
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

        {/* Paso 2: Tipo y período del contrato */}
        {step === 2 && (
          <div className="space-y-6">
            <Controller
              name="tipo_de_contrato"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Tipo de Contrato"
                  name="tipo_de_contrato"
                  fieldType="select"
                  value={field.value}
                  onChange={(value: string) => field.onChange(value)}
                  options={[
                    { label: "Temporal", value: "Temporal" },
                    { label: "Permanente", value: "Permanente" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="fecha_inicio"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Fecha de Inicio"
                    name="fecha_inicio"
                    value={field.value?.toString()}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    type="date"
                  />
                )}
              />

              {watch("tipo_de_contrato") === "Temporal" && (
                <Controller
                  name="fecha_fin"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Fecha de Fin"
                      name="fecha_fin"
                      value={field.value?.toString()}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      type="date"
                    />
                  )}
                />
              )}
            </div>
          </div>
        )}

        {/* Paso 3: Detalles financieros y condiciones */}
        {step === 3 && (
          <div className="space-y-6">
            <Controller
              name="condiciones_especificas"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Condiciones Específicas"
                  name="condiciones_especificas"
                  value={field.value?.toString() || undefined}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  type="textarea"
                  placeholder="Detalla aquí cualquier acuerdo especial (descuentos, servicios adicionales, requisitos particulares, etc.)"
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="tarifa"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Tarifa"
                    name="tarifa"
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toString()
                        : ""
                    }
                    onChange={(value) => field.onChange(parseFloat(value))}
                    error={fieldState.error?.message}
                    type="number"
                    prefix="$"
                  />
                )}
              />

              <Controller
                name="periodicidad"
                control={control}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Periodicidad"
                    name="periodicidad"
                    fieldType="select"
                    value={field.value as string}
                    onChange={(value: string) => field.onChange(value)}
                    options={[
                      { label: "Diaria", value: "Diaria" },
                      { label: "Semanal", value: "Semanal" },
                      { label: "Mensual", value: "Mensual" },
                      { label: "Anual", value: "Anual" },
                    ]}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="estado"
              control={control}
              render={({ field, fieldState }) => (
                <FormField
                  label="Estado"
                  name="estado"
                  fieldType="select"
                  value={field.value as string}
                  onChange={(value: string) => field.onChange(value)}
                  options={[
                    { label: "Activo", value: "Activo" },
                    { label: "Inactivo", value: "Inactivo" },
                  ]}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        )}

        {/* Botones de navegación */}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Anterior
            </Button>
          )}

          <div className="ml-auto">
            {step < 3 && <Button onClick={handleNext}>Siguiente</Button>}

            {step === 3 && (
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" /> Guardando...
                  </>
                ) : (
                  "Guardar Contrato"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
