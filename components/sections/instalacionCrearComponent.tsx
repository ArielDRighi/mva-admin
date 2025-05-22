"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "../ui/local/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CreateInstalacionDto,
  createServiceInstalacion,
} from "@/app/actions/services";
import { getEmployees } from "@/app/actions/empleados";
import { getVehicles } from "@/app/actions/vehiculos";
import { getSanitarios } from "@/app/actions/sanitarios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClients } from "@/app/actions/clientes";
import { getAllContractualConditions } from "@/app/actions/contractualConditions";
import { Sanitario } from "@/types/types";

// Define types for the resources
type Employee = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
  cargo: string;
};

type Vehicle = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  estado: string;
};

type Toilet = {
  id: number;
  numero_serie: string;
  modelo: string;
  estado: string;
};

type Client = {
  clientId: number;
  nombre: string;
};

// Schema for form validation - removed clienteId
const formSchema = z.object({
  ubicacion: z
    .string()
    .min(3, { message: "La ubicación debe tener al menos 3 caracteres" }),
  cantidadBanos: z.string().min(1, { message: "Ingrese la cantidad de baños" }),
  cantidadEmpleados: z
    .string()
    .min(1, { message: "Ingrese la cantidad de empleados" }),
  cantidadVehiculos: z
    .string()
    .min(1, { message: "Ingrese la cantidad de vehículos" }),
  condicionContractualId: z
    .string()
    .min(1, { message: "Seleccione una condición contractual" }),
  notas: z.string().optional(),
});
type CondicionContractual = {
  condicionContractualId: number;
  tipo_de_contrato: string;
  tarifa: string;
  periodicidad: string;
};

export function CrearInstalacionComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [selectedToilets, setSelectedToilets] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isManualAssignment, setIsManualAssignment] = useState(false);
  const [condicionesContractuales, setCondicionesContractuales] = useState<
    CondicionContractual[]
  >([]);
  console.log("condicionesContractuales", condicionesContractuales);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ubicacion: "",
      cantidadBanos: "1",
      cantidadEmpleados: "1",
      cantidadVehiculos: "1",
      condicionContractualId: "",
      notas: "",
    },
  });

  // Fetch all resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesResponse = await getEmployees();
        if (
          employeesResponse &&
          employeesResponse.data &&
          Array.isArray(employeesResponse.data)
        ) {
          setEmployees(employeesResponse.data);
        } else {
          console.error(
            "Unexpected employees response format:",
            employeesResponse
          );
          toast.error("Error: formato de respuesta de empleados inesperado");
        }

        // Fetch vehicles
        const vehiclesResponse = await getVehicles();
        if (
          vehiclesResponse &&
          vehiclesResponse.data &&
          Array.isArray(vehiclesResponse.data)
        ) {
          setVehicles(vehiclesResponse.data);
        } else {
          console.error(
            "Unexpected vehicles response format:",
            vehiclesResponse
          );
          toast.error("Error: formato de respuesta de vehículos inesperado");
        }

        // Fetch Condiciones Contractuales
        const condicionesResponse = await getAllContractualConditions();
        if (
          condicionesResponse &&
          condicionesResponse.items &&
          Array.isArray(condicionesResponse.items)
        ) {
          setCondicionesContractuales(condicionesResponse.items);
        } else {
          console.error(
            "Unexpected condiciones response format:",
            condicionesResponse
          );
          toast.error(
            "Error: formato de respuesta de condiciones contractuales inesperado"
          );
        }

        // Fetch toilets
        const toiletsResponse = await getSanitarios();
        if (
          toiletsResponse &&
          toiletsResponse.items &&
          Array.isArray(toiletsResponse.items)
        ) {
          // Transform the data to ensure we have the correct ID field
          const formattedToilets = toiletsResponse.items.map(
            (toilet: Sanitario) => ({
              id: parseInt(toilet.baño_id || "0"),
              numero_serie: toilet.codigo_interno || "",
              modelo: toilet.modelo || "",
              estado: toilet.estado || "",
            })
          );
          console.log("Formatted toilets:", formattedToilets);
          setToilets(formattedToilets);
        } else {
          console.error("Unexpected toilets response format:", toiletsResponse);
          toast.error("Error: formato de respuesta de baños inesperado");
        }

        // Here you would also fetch clients
        const clientsResponse = await getClients();
        setClients(clientsResponse.items);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Error al cargar los recursos");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!scheduledDate) {
      toast.error("Debe seleccionar una fecha programada");
      return;
    }

    setLoading(true);

    try {
      // Format date as YYYY-MM-DD (without time part)
      const formattedDate = scheduledDate.toISOString().split("T")[0];

      const serviceData: CreateInstalacionDto = {
        condicionContractualId: parseInt(data.condicionContractualId),
        fechaProgramada: formattedDate,
        cantidadVehiculos: parseInt(data.cantidadVehiculos),
        ubicacion: data.ubicacion,
        notas: data.notas || "",
        asignacionAutomatica: !isManualAssignment,
        asignacionesManual: [],
        empleadoAId:
          selectedEmployees.length > 0 ? selectedEmployees[0] : undefined,
        empleadoBId:
          selectedEmployees.length > 1 ? selectedEmployees[1] : undefined,
      };

      // Add manual assignments if needed
      if (isManualAssignment) {
        const asignacionesManual = [];

        // Create a single assignment with all selected resources
        asignacionesManual.push({
          empleadoId: selectedEmployees.length > 0 ? selectedEmployees[0] : 0,
          vehiculoId: selectedVehicles.length > 0 ? selectedVehicles[0] : 0,
          banosIds: selectedToilets.length > 0 ? selectedToilets : [],
        });

        // Update manual assignments in service data
        serviceData.asignacionesManual = asignacionesManual;
      }

      // Log complete data before sending to API
      console.log("Sending service data:", serviceData);

      await createServiceInstalacion(serviceData);

      toast.success("Instalación creada exitosamente");

      // Reset form and states
      form.reset();
      setScheduledDate(null);
      setSelectedEmployees([]);
      setSelectedVehicles([]);
      setSelectedToilets([]);

      // Redirect to services list
      router.push("/admin/dashboard/servicios/instalaciones/listado");
    } catch (error) {
      console.error("Error creating installation service:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear la instalación"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers for selecting resources
  const handleEmployeeSelection = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleVehicleSelection = (id: number) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((vehId) => vehId !== id) : [...prev, id]
    );
  };

  const handleToiletSelection = (id: number) => {
    setSelectedToilets((prev) =>
      prev.includes(id)
        ? prev.filter((toiletId) => toiletId !== id)
        : [...prev, id]
    );
  };

  if (loading && employees.length === 0) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="w-full shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
          <CardTitle className="text-2xl font-bold">
            Crear Instalación
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Complete los datos para crear un nuevo servicio de instalación
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Removed cliente field */}

                {/* Fecha Programada */}
                <FormItem>
                  <FormLabel>Fecha Programada</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={scheduledDate}
                      onChange={(date: Date | null) => setScheduledDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Seleccione fecha (YYYY-MM-DD)"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      minDate={new Date()}
                    />
                  </FormControl>
                  {!scheduledDate && (
                    <p className="text-sm font-medium text-destructive">
                      Debe seleccionar una fecha
                    </p>
                  )}
                </FormItem>

                {/* Condición Contractual - moved up for importance */}
                <FormField
                  control={form.control}
                  name="condicionContractualId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condición Contractual</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una condición contractual" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {condicionesContractuales.length === 0 ? (
                            <SelectItem value="loading" disabled>
                              Cargando condiciones contractuales...
                            </SelectItem>
                          ) : (
                            condicionesContractuales.map((condicion) => (
                              <SelectItem
                                key={condicion.condicionContractualId}
                                value={condicion.condicionContractualId.toString()}
                              >
                                {condicion.tipo_de_contrato} -{" "}
                                {condicion.periodicidad}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad de Empleados */}
                <FormField
                  control={form.control}
                  name="cantidadEmpleados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de Empleados</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad de Vehículos */}
                <FormField
                  control={form.control}
                  name="cantidadVehiculos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de Vehículos</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ubicación */}
              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notas */}
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Información adicional sobre la instalación (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de asignación */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual-assignment"
                  checked={isManualAssignment}
                  onCheckedChange={(checked) => {
                    setIsManualAssignment(checked === true);
                  }}
                />
                <label
                  htmlFor="manual-assignment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Asignación manual de recursos
                </label>
              </div>

              {/* Selección manual de recursos */}
              {isManualAssignment && (
                <Accordion type="single" collapsible className="w-full">
                  {/* Empleados */}
                  <AccordionItem value="employees">
                    <AccordionTrigger>
                      Empleados ({selectedEmployees.length} seleccionados)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[200px] w-full rounded-md border">
                        <div className="p-4">
                          {employees.map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-center space-x-2 mb-2"
                            >
                              <Checkbox
                                id={`employee-${employee.id}`}
                                checked={selectedEmployees.includes(
                                  employee.id
                                )}
                                onCheckedChange={() =>
                                  handleEmployeeSelection(employee.id)
                                }
                              />
                              <label
                                htmlFor={`employee-${employee.id}`}
                                className="text-sm font-medium leading-none"
                              >
                                {employee.nombre} {employee.apellido} -{" "}
                                {employee.cargo} - {employee.estado}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Vehículos */}
                  <AccordionItem value="vehicles">
                    <AccordionTrigger>
                      Vehículos ({selectedVehicles.length} seleccionados)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[200px] w-full rounded-md border">
                        <div className="p-4">
                          {vehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              className="flex items-center space-x-2 mb-2"
                            >
                              <Checkbox
                                id={`vehicle-${vehicle.id}`}
                                checked={selectedVehicles.includes(vehicle.id)}
                                onCheckedChange={() =>
                                  handleVehicleSelection(vehicle.id)
                                }
                              />
                              <label
                                htmlFor={`vehicle-${vehicle.id}`}
                                className="text-sm font-medium leading-none"
                              >
                                {vehicle.marca} {vehicle.modelo} -{" "}
                                {vehicle.placa} - {vehicle.estado}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Baños */}
                  <AccordionItem value="toilets">
                    <AccordionTrigger>
                      Baños ({selectedToilets.length} seleccionados)
                    </AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-[200px] w-full rounded-md border">
                        <div className="p-4">
                          {toilets.map((toilet) => (
                            <div
                              key={toilet.id}
                              className="flex items-center space-x-2 mb-2"
                            >
                              <Checkbox
                                id={`toilet-${toilet.id}`}
                                checked={selectedToilets.includes(toilet.id)}
                                onCheckedChange={() =>
                                  handleToiletSelection(toilet.id)
                                }
                              />
                              <label
                                htmlFor={`toilet-${toilet.id}`}
                                className="text-sm font-medium leading-none"
                              >
                                {toilet.modelo} - {toilet.numero_serie} -{" "}
                                {toilet.estado}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <CardFooter className="flex justify-between px-0 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(
                      "/admin/dashboard/servicios/instalaciones/listado"
                    )
                  }
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader className="h-4 w-4" />
                  ) : (
                    "Crear Instalación"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
