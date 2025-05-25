"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/local/FormField";
import { FormDialog } from "@/components/ui/local/FormDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmpleadoSelector } from "@/components/ui/local/SearchSelector/Selectors";
import {
  UserPlus,
  UserRound,
  Phone,
  Heart,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import Loader from "@/components/ui/local/Loader";
import {
  ContactoEmergencia,
  createEmployeeEmergencyContact,
  deleteEmployeeEmergencyContact,
  getEmployeeEmergencyContacts,
  updateEmployeeEmergencyContact,
} from "@/app/actions/contactosEmergenciaAdmin";
import { getEmployees } from "@/app/actions/empleados";
import { Empleado } from "@/types/types";

const contactoEmergenciaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  parentesco: z.string().min(1, "El parentesco es obligatorio"),
  telefono: z
    .string()
    .regex(
      /^\d{3}-\d{4}-\d{4}$/,
      "Formato de teléfono incorrecto, debe ser xxx-xxxx-xxxx"
    )
    .or(z.string().regex(/^\d{10,11}$/, "Debe tener entre 10 y 11 dígitos")),
  empleadoId: z.number().min(1, "Debe seleccionar un empleado"),
});

export default function ContactosEmergenciaAdminComponent() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContacto, setSelectedContacto] =
    useState<ContactoEmergencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Empleado[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Empleado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(
    null
  );
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);

  const form = useForm({
    resolver: zodResolver(contactoEmergenciaSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      parentesco: "",
      telefono: "",
      empleadoId: 0,
    },
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getEmployees();
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
          setFilteredEmployees(response.data);
        } else {
          console.error("Formato de respuesta inesperado:", response);
          toast.error("Error al cargar empleados");
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        toast.error("Error al cargar empleados");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchContactos = async () => {
      if (!selectedEmployee || !selectedEmployee.id) return;

      try {
        setLoading(true);
        const data = await getEmployeeEmergencyContacts(selectedEmployee.id);

        if (data.emergencyContacts && Array.isArray(data.emergencyContacts)) {
          setContactos(data.emergencyContacts);
        } else if (Array.isArray(data)) {
          setContactos(data);
        } else {
          console.error("Estructura de respuesta inesperada:", data);
          setContactos([]);
        }
      } catch (error) {
        console.error("Error al cargar contactos:", error);
        toast.error("Error al cargar contactos de emergencia");
        setContactos([]); // Asegúrate de inicializar con array vacío
      } finally {
        setLoading(false);
      }
    };

    fetchContactos();
  }, [selectedEmployee]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.documento.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const { handleSubmit, setValue, control, reset } = form;

  const handleEditClick = (contacto: ContactoEmergencia) => {
    setSelectedContacto(contacto);
    setIsCreating(false);

    setValue("nombre", contacto.nombre);
    setValue("apellido", contacto.apellido);
    setValue("parentesco", contacto.parentesco);
    setValue("telefono", contacto.telefono);
    setValue("empleadoId", selectedEmployee?.id || 0);
  };

  const handleCreateClick = () => {
    reset({
      nombre: "",
      apellido: "",
      parentesco: "",
      telefono: "",
      empleadoId: selectedEmployee?.id || 0,
    });
    setSelectedContacto(null);
    setIsCreating(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (
      !confirm("¿Está seguro que desea eliminar este contacto de emergencia?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteEmployeeEmergencyContact(id);
      if (selectedEmployee?.id) {
        const data = await getEmployeeEmergencyContacts(selectedEmployee.id);
        setContactos(data.emergencyContacts || []);
      }

      toast.success("Contacto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      toast.error("Error al eliminar el contacto");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof contactoEmergenciaSchema>) => {
    try {
      setLoading(true);
      if (selectedContacto) {
        const updateData = {
          nombre: data.nombre,
          apellido: data.apellido,
          parentesco: data.parentesco,
          telefono: data.telefono,
        };
        await updateEmployeeEmergencyContact(selectedContacto.id, updateData);
        toast.success("Contacto actualizado correctamente");
      } else {
        const response = await createEmployeeEmergencyContact(data.empleadoId, {
          nombre: data.nombre,
          apellido: data.apellido,
          parentesco: data.parentesco,
          telefono: data.telefono,
        });
        console.log("Respuesta de creación:", response);
        toast.success("Contacto creado correctamente");
      }
      if (selectedEmployee?.id) {
        const updatedData = await getEmployeeEmergencyContacts(
          selectedEmployee.id
        );
        console.log("Datos actualizados:", updatedData);
        if (
          updatedData.emergencyContacts &&
          Array.isArray(updatedData.emergencyContacts)
        ) {
          setContactos(updatedData.emergencyContacts);
        } else if (Array.isArray(updatedData)) {
          setContactos(updatedData);
        }
      }

      setIsCreating(false);
      setSelectedContacto(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error(
        selectedContacto
          ? "Error al actualizar contacto"
          : "Error al crear contacto"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = async (employee: Empleado) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md my-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Contactos de Emergencia
            </h1>
            <p className="text-blue-100">
              Gestión de contactos de emergencia de los empleados
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>
              Seleccione un empleado para ver sus contactos
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre o documento..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading && !selectedEmployee ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron empleados
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 rounded-md border cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedEmployee?.id === employee.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {employee.nombre} {employee.apellido}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.documento}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">
                Contactos de Emergencia
              </CardTitle>
              <CardDescription>
                {selectedEmployee
                  ? `Contactos de ${selectedEmployee.nombre} ${selectedEmployee.apellido}`
                  : "Seleccione un empleado para ver sus contactos"}
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateClick}
              disabled={!selectedEmployee || loading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Añadir Contacto
            </Button>
          </CardHeader>
          <CardContent>
            {loading && selectedEmployee ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : !selectedEmployee ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Seleccione un empleado</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Debe seleccionar un empleado para ver sus contactos de
                  emergencia
                </p>
              </div>
            ) : contactos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  No hay contactos registrados
                </h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Este empleado no tiene contactos de emergencia registrados.
                </p>
                <Button onClick={handleCreateClick}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Añadir Primer Contacto
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Parentesco</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactos.map((contacto) => (
                      <TableRow key={contacto.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {contacto.nombre} {contacto.apellido}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-500" />
                            <Badge variant="outline">
                              {contacto.parentesco}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span>{contacto.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(contacto)}
                              disabled={loading}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteClick(contacto.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FormDialog
        open={isCreating || selectedContacto !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedContacto(null);
          }
        }}
        title={selectedContacto ? "Editar Contacto" : "Añadir Contacto"}
        description={
          selectedContacto
            ? "Actualiza la información del contacto de emergencia."
            : "Completa el formulario para registrar un nuevo contacto de emergencia."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <Controller
              name="empleadoId"
              control={control}
              render={({ field, fieldState }) => (
                <EmpleadoSelector
                  label="Empleado"
                  name="empleadoId"
                  value={field.value}
                  onChange={(empleadoId) => field.onChange(empleadoId)}
                  error={fieldState.error?.message}
                  disabled={!!selectedEmployee || loading}
                />
              )}
            />
          </div>

          <Controller
            name="nombre"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Nombre"
                name="nombre"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el nombre"
                disabled={loading}
              />
            )}
          />

          <Controller
            name="apellido"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Apellido"
                name="apellido"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el apellido"
                disabled={loading}
              />
            )}
          />

          <Controller
            name="parentesco"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Parentesco"
                name="parentesco"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: Familiar, Cónyuge, Amigo"
                disabled={loading}
              />
            )}
          />

          <Controller
            name="telefono"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Teléfono"
                name="telefono"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ej: 123-4567-8901"
                disabled={loading}
              />
            )}
          />
        </div>
      </FormDialog>
    </div>
  );
}
