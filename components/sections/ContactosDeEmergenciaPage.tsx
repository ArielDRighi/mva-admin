"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";

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
import {
  UserPlus,
  UserRound,
  Phone,
  Heart,
  Edit2,
  Trash2,
  AlertCircle,
  Shirt,
  ArrowLeft,
} from "lucide-react";
import { getCookie } from "cookies-next";
import { User } from "./DashboardComponent";
import { getUserById } from "@/app/actions/users";
import {
  getMyEmergencyContacts,
  createMyEmergencyContact,
  updateMyEmergencyContact,
  deleteMyEmergencyContact,
  ContactoEmergencia,
} from "@/app/actions/contactosDeEmergencia";
import Link from "next/link";

// Schema for form validation
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
});

export default function ContactosDeEmergenciaComponent() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContacto, setSelectedContacto] =
    useState<ContactoEmergencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [employeeId, setEmployeeId] = useState(0);
  const userId = user?.id || 0;
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);

  const form = useForm({
    resolver: zodResolver(contactoEmergenciaSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      parentesco: "",
      telefono: "",
    },
  });

  useEffect(() => {
    const userCookie = getCookie("user");

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie as string);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error al parsear el usuario", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (userId === 0) return;
        setLoading(true);
        const fetchEmployee = await getUserById(userId);
        setEmployeeId(fetchEmployee.empleadoId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (employeeId === 0) return;
        setLoading(true);
        const fetchedContacts = await getMyEmergencyContacts(employeeId);
        setContactos(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Error al cargar contactos", {
          description: "No se pudieron cargar los contactos de emergencia.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  const { handleSubmit, setValue, control, reset } = form;

  // Handle edit click
  const handleEditClick = (contacto: ContactoEmergencia) => {
    setSelectedContacto(contacto);
    setIsCreating(false);

    const camposFormulario = [
      "nombre",
      "apellido",
      "parentesco",
      "telefono",
    ] as const;

    camposFormulario.forEach((key) => {
      if (contacto[key] !== undefined) {
        setValue(key, String(contacto[key]));
      }
    });
  };

  // Handle create click
  const handleCreateClick = () => {
    reset({
      nombre: "",
      apellido: "",
      parentesco: "",
      telefono: "",
    });
    setSelectedContacto(null);
    setIsCreating(true);
  };

  // Handle delete click
  const handleDeleteClick = async (id: number) => {
    try {
      console.log("Iniciando eliminación del contacto:", id);
      setLoading(true);
      const response = await deleteMyEmergencyContact(id);
      console.log("Respuesta del servidor:", response);

      // Update the local state after successful deletion
      setContactos(contactos.filter((contacto) => contacto.id !== id));
      console.log(
        "Estado actualizado, contactos restantes:",
        contactos.length - 1
      );

      console.log("Intentando mostrar toast con mensaje:", response.message);
      toast.success("Contacto eliminado correctamente");
      console.log("Toast mostrado correctamente");
    } catch (error) {
      console.error("Error completo al eliminar el contacto:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el contacto de emergencia.",
      });
    } finally {
      setLoading(false);
      console.log("Proceso de eliminación finalizado");
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof contactoEmergenciaSchema>) => {
    try {
      if (contactos.length >= 3 && !selectedContacto) {
        toast.error("Límite alcanzado", {
          description: "Solo puede agregar hasta 3 contactos de emergencia.",
        });
        return;
      }

      setLoading(true);

      if (selectedContacto) {
        // Update existing contact
        await updateMyEmergencyContact(selectedContacto.id, data);

        // Update local state with the updated data
        const updatedContacto = { ...selectedContacto, ...data };
        setContactos(
          contactos.map((contacto) =>
            contacto.id === selectedContacto.id ? updatedContacto : contacto
          )
        );

        toast.success("Contacto actualizado", {
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        // Create new contact
        if (employeeId === 0) {
          throw new Error("ID de empleado no disponible");
        }

        const newContact = await createMyEmergencyContact(employeeId, data);

        // Refresh contacts instead of trying to use the return value
        const updatedContacts = await getMyEmergencyContacts(employeeId);
        setContactos(updatedContacts);

        toast.success("Contacto agregado", {
          description:
            "El contacto de emergencia se ha agregado correctamente.",
        });
      }

      setIsCreating(false);
      setSelectedContacto(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast.error("Error", {
        description: selectedContacto
          ? "No se pudo actualizar el contacto."
          : "No se pudo crear el contacto.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Toaster position="top-right" richColors />

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/empleado/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mi Perfil
          </Link>
        </Button>
      </div>
      {/* Título principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md my-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mis Contactos de Emergencia
            </h1>
            <p className="text-blue-100">
              Gestiona tus contactos en caso de emergencia
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Contactos de Emergencia
            </CardTitle>
            <CardDescription>
              Puedes registrar hasta 3 contactos de emergencia
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            disabled={contactos.length >= 3 || loading}
            className="ml-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir Contacto
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : contactos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">
                No hay contactos registrados
              </h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Aún no tienes contactos de emergencia registrados.
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
                          <Badge variant="outline">{contacto.parentesco}</Badge>
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
