"use client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shirt,
  Package,
  Edit,
  RotateCw,
  Ruler,
  Calendar,
  Save,
} from "lucide-react";
import Link from "next/link";
import { User } from "./DashboardComponent";
import { getUserById } from "@/app/actions/users";
import {
  getMyClothing,
  updateMyClothing,
  createMyClothing,
} from "@/app/actions/clothing";
import { toast } from "sonner";

// Tipo para datos de vestimenta
interface VestimentaUsuario {
  calzado_talle: string;
  pantalon_talle: string;
  camisa_talle: string;
  campera_bigNort_talle: string;
  pielBigNort_talle: string;
  medias_talle: string;
  pantalon_termico_bigNort_talle: string;
  campera_polar_bigNort_talle: string;
  mameluco_talle: string;
}

export default function VestimentaEmpleadoComponent() {
  const [isEditingTalles, setIsEditingTalles] = useState(false);
  const [tallesEditados, setTallesEditados] =
    useState<VestimentaUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const userId = user?.id || 0;
  const [employeeId, setEmployeeId] = useState(0);
  const [clothing, setClothing] = useState<VestimentaUsuario | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

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
        console.error("Error fetching services:", error);
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
        const fetchClothing = await getMyClothing(employeeId);

        // Check if we received an error object instead of valid data
        if (fetchClothing.error || fetchClothing.statusCode) {
          setClothing(null);
        } else {
          setClothing(fetchClothing);
          // Only initialize tallesEditados with valid data
          if (!tallesEditados) {
            setTallesEditados(fetchClothing);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setClothing(null);
      } finally {
        setLoading(false);
        setDataFetched(true);
      }
    };

    if (employeeId !== 0) {
      fetchData();
    }
  }, [employeeId]);

  // Manejador para cambios en talles
  const handleTalleChange = (key: keyof VestimentaUsuario, value: string) => {
    setTallesEditados((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
          }
        : null
    );
  };

  const handleSaveTalles = async () => {
    try {
      setLoading(true);
      if (!tallesEditados || employeeId === 0) {
        toast.error("No hay datos para guardar");
        return;
      }

      // Extraer solo las propiedades de talles
      const tallesParaEnviar = {
        calzado_talle: tallesEditados.calzado_talle,
        pantalon_talle: tallesEditados.pantalon_talle,
        camisa_talle: tallesEditados.camisa_talle,
        campera_bigNort_talle: tallesEditados.campera_bigNort_talle,
        pielBigNort_talle: tallesEditados.pielBigNort_talle,
        medias_talle: tallesEditados.medias_talle,
        pantalon_termico_bigNort_talle:
          tallesEditados.pantalon_termico_bigNort_talle,
        campera_polar_bigNort_talle: tallesEditados.campera_polar_bigNort_talle,
        mameluco_talle: tallesEditados.mameluco_talle,
      };

      // Llamar a la API para actualizar los talles
      const result = await updateMyClothing(employeeId, tallesParaEnviar);

      // Verificar si la actualización fue exitosa o si necesitamos crear un nuevo registro
      if (result.error || result.statusCode) {
        // Si falló la actualización, intentar crear un nuevo registro

        const created = await createMyClothing(employeeId, tallesParaEnviar);

        if (created.error || created.statusCode) {
          throw new Error("No se pudieron guardar los talles");
        }
      }

      // Actualizar el estado local con los datos guardados
      setClothing(tallesEditados);
      setIsEditingTalles(false);

      // Mostrar mensaje de éxito
      toast.success("Talles actualizados correctamente");
    } catch (error) {
      console.error("Error al guardar los talles:", error);
      toast.error("Error al guardar los talles");
    } finally {
      setLoading(false);
    }
  };

  // Manejador para cancelar edición
  const handleCancelEdit = () => {
    setTallesEditados(clothing);
    setIsEditingTalles(false);
  };

  // Componente para mostrar el nombre legible de las prendas
  const getNombrePrenda = (key: string): string => {
    const mapping: Record<string, string> = {
      calzado_talle: "Calzado de seguridad",
      pantalon_talle: "Pantalón",
      camisa_talle: "Camisa",
      campera_bigNort_talle: "Campera BigNort",
      pielBigNort_talle: "Piel BigNort",
      medias_talle: "Medias",
      pantalon_termico_bigNort_talle: "Pantalón térmico BigNort",
      campera_polar_bigNort_talle: "Campera polar BigNort",
      mameluco_talle: "Mameluco",
    };
    return mapping[key] || key;
  };

  // Función para manejar la creación de talles
  const handleCreateTalles = async () => {
    try {
      setLoading(true);
      if (employeeId === 0) {
        toast.error("Error: No se pudo identificar al empleado");
        return;
      }

      // Crear registro inicial de talles vacío
      const initialTalles = {
        calzado_talle: "",
        pantalon_talle: "",
        camisa_talle: "",
        campera_bigNort_talle: "",
        pielBigNort_talle: "",
        medias_talle: "",
        pantalon_termico_bigNort_talle: "",
        campera_polar_bigNort_talle: "",
        mameluco_talle: "",
      };

      createMyClothing(employeeId, initialTalles);

      // Actualizar el estado local con los datos creados
      setClothing(initialTalles);
      setTallesEditados(initialTalles);
      setIsEditingTalles(true);

      toast.success(
        "Registro de talles creado. Ahora puedes completar tus talles."
      );
    } catch (error) {
      console.error("Error al crear registro de talles:", error);
      toast.error("Error al crear el registro de talles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 sm:px-6 mx-auto py-6 space-y-6 md:space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/empleado/dashboard")}
          asChild
        >
          <Link href="/empleado/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mi Perfil
          </Link>
        </Button>
      </div>

      {/* Título principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Shirt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Mi Vestimenta Laboral
            </h1>
            <p className="text-blue-100">{user?.nombre.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="talles">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="talles">Mis Talles</TabsTrigger>
        </TabsList>

        {/* Tab de Talles */}
        <TabsContent value="talles" className="mt-6">
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-purple-800 dark:text-purple-300">
                    Mis Talles Registrados
                  </CardTitle>
                  <CardDescription>
                    Información actualizada de tus talles para vestimenta
                    laboral
                  </CardDescription>
                </div>
                {clothing && (
                  <Button
                    onClick={() => {
                      if (isEditingTalles) {
                        handleSaveTalles();
                      } else {
                        setIsEditingTalles(true);
                      }
                    }}
                    disabled={loading}
                    className={
                      isEditingTalles ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    {loading ? (
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditingTalles ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Edit className="mr-2 h-4 w-4" />
                    )}
                    {isEditingTalles ? "Guardar Cambios" : "Editar Talles"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading && !dataFetched ? (
                <div className="flex justify-center py-8">
                  <RotateCw className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !clothing && dataFetched ? (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium mb-2">
                      No tienes talles registrados
                    </p>
                    <p className="text-sm">
                      Para solicitar vestimenta laboral, primero debes registrar
                      tus talles
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateTalles}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="mr-2 h-4 w-4" />
                    )}
                    Cargar mis talles
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(
                    isEditingTalles ? tallesEditados || {} : clothing || {}
                  )
                    .filter(([key]) => key.includes("_talle"))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="border rounded-md p-4 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-700 mb-2">
                          {getNombrePrenda(key)}
                        </div>
                        {isEditingTalles ? (
                          <Input
                            value={value}
                            onChange={(e) =>
                              handleTalleChange(
                                key as keyof VestimentaUsuario,
                                e.target.value
                              )
                            }
                            className="mt-1"
                            placeholder="Ingrese el talle"
                          />
                        ) : (
                          <div className="flex items-center">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              Talle: {value || "No especificado"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {isEditingTalles && (
                <div className="flex justify-end mt-6 gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
