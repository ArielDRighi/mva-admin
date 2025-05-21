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
import {
  Search,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        router.push("/admin/dashboard/condiciones-contractuales");
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
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Crear Condición Contractual
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {step === 1 && "Selecciona el cliente para el nuevo contrato"}
              {step === 2 && "Define el tipo y período del contrato"}
              {step === 3 && "Establece los detalles financieros y condiciones"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 text-base px-3 py-1"
          >
            Paso {step} de 3
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Indicador de progreso */}
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
              <Calendar className="h-4 w-4" /> Período
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${
                step >= 3 ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <DollarSign className="h-4 w-4" /> Detalles
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
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
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Buscar clientes por nombre, CUIT o email..."
                      className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-8 border rounded-md bg-slate-50">
                      <Loader className="text-indigo-600" />
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto border rounded-md border-slate-200">
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
                                <Tag className="h-3.5 w-3.5 text-slate-400" />{" "}
                                {cliente.cuit}
                              </span>
                              <span className="flex items-center gap-1">
                                <Search className="h-3.5 w-3.5 text-slate-400" />{" "}
                                {cliente.email}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : searchTerm.length > 0 ? (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {watch("tipo_de_contrato") === "Permanente" && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                Los contratos permanentes no requieren una fecha de finalización
                específica.
              </div>
            )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estado
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`border rounded-md p-3 cursor-pointer flex items-center justify-center ${
                        field.value === "Activo"
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => field.onChange("Activo")}
                    >
                      Activo
                    </div>
                    <div
                      className={`border rounded-md p-3 cursor-pointer flex items-center justify-center ${
                        field.value === "Inactivo"
                          ? "bg-slate-200 border-slate-300 text-slate-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={() => field.onChange("Inactivo")}
                    >
                      Inactivo
                    </div>
                  </div>
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

        {/* Botones de navegación */}
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
            {step < 3 && (
              <Button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Guardar Contrato
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
