"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Truck,
  UserRound,
  Bell,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { User } from "@/components/sections/DashboardComponent";
import { getCookie } from "cookies-next";
import {
  getEmployeeById,
  getLastServicesByUserId,
  getMineAssignedServicesPending,
} from "@/app/actions/empleados";
import { getUserById } from "@/app/actions/users";
import { getLicenciasByUserId } from "@/app/actions/LicenciasEmpleados";

interface ProximoServicio {
  id: number;
  clienteId: number;
  cliente?: {
    id: number;
    nombre: string;
  };
  fechaInicio?: string;
  fechaFin?: string;
  fechaProgramada: string;
  ubicacion: string;
  tipoServicio: string;
  estado: string;
  cantidadBanos?: number;
  cantidadEmpleados?: number;
  cantidadVehiculos?: number;
  notas?: string;
  vehiculo?: {
    id: number;
    modelo: string;
    patente?: string;
  };
}

// Agregar cerca de las otras interfaces al inicio del archivo

interface Licencia {
  id: number;
  employeeId: number;
  fechaInicio: string;
  fechaFin: string;
  tipoLicencia: string;
  notas: string;
  aprobado: boolean;
  employee?: {
    id: number;
    nombre: string;
    apellido: string;
    documento: string;
    cargo: string;
    estado: string;
    // Otros campos del empleado
  };
}

// Add this interface with your other interfaces at the top of the file
interface CompletedService {
  id: number;
  clienteId: number;
  cliente?: {
    id: number;
    nombre: string;
    cuit: string;
    direccion: string;
    email: string;
    telefono: string;
    contacto_principal: string;
    estado: string;
  };
  tipoServicio: string;
  estado: string;
  fechaCreacion: string;
  fechaProgramada: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  notas?: string;
  cantidadBanos?: number;
  cantidadEmpleados?: number;
  cantidadVehiculos?: number;
  asignaciones?: Array<{
    id: number;
    servicioId: number;
    empleadoId: number;
    vehiculoId?: number;
    banoId?: number;
    fechaAsignacion: string;
    empleado?: {
      id: number;
      nombre: string;
      apellido: string;
      documento: string;
    };
    vehiculo?: {
      id: number;
      numeroInterno?: number;
      placa?: string;
      marca: string;
      modelo: string;
    };
    bano?: {
      baño_id: number;
      codigo_interno: string;
      modelo: string;
      fecha_adquisicion: string;
      estado: string;
    };
  }>;
  banosInstalados?: Array<any>;
}

const completedServices = [
  {
    id: 101,
    clientName: "Festival Musical Primavera",
    serviceType: "INSTALACION",
    completedDate: "2025-05-10T11:30:00",
    location: "Parque Sarmiento",
    bathCount: 10,
    vehicleId: 3,
    vehicleModel: "Iveco Daily",
  },
  {
    id: 102,
    clientName: "Empresa Desarrollo Software",
    serviceType: "LIMPIEZA",
    completedDate: "2025-05-15T09:45:00",
    location: "Edificio Torre Norte, Puerto Madero",
    bathCount: 2,
    vehicleId: 2,
    vehicleModel: "Ford F-150",
  },
  {
    id: 103,
    clientName: "Constructora ABC",
    serviceType: "RETIRO",
    completedDate: "2025-05-18T16:20:00",
    location: "Av. Libertador 1200, CABA",
    bathCount: 3,
    vehicleId: 1,
    vehicleModel: "Mercedes Sprinter",
  },
];

const availableLeaveTypes = [
  { value: "VACACIONES", label: "Vacaciones" },
  { value: "ENFERMEDAD", label: "Licencia por enfermedad" },
  { value: "CASAMIENTO", label: "Licencia por casamiento" },
  { value: "NACIMIENTO", label: "Licencia por nacimiento" },
  { value: "FALLECIMIENTO_FAMILIAR", label: "Licencia por fallecimiento" },
  { value: "CAPACITACION", label: "Licencia por capacitación" },
  { value: "ORDINARIA", label: "Licencia ordinaria" },
];

// Utility function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Utility function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // Consistent format that doesn't depend on locale
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Function to get the badge style for service type
const getServiceTypeBadge = (type: string) => {
  switch (type) {
    case "INSTALACION":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "LIMPIEZA":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "RETIRO":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  }
};

// Function to get the badge style for leave status
const getLeaveStatusBadge = (status: string) => {
  switch (status) {
    case "APROBADO":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "RECHAZADO":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "PENDIENTE":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  }
};

const DashboardEmployeeComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [proximosServicios, setProximosServicios] =
    useState<ProximoServicio[]>();
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(0);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [lastServices, setLastServices] = useState<CompletedService[]>([]);
  const userId = user?.id || 0;
  console.log("lastServices", lastServices);

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
        const fetchServicios = await getMineAssignedServicesPending(employeeId);
        const fetchLicencias = await getLicenciasByUserId(employeeId);
        const fetchLastServices = await getLastServicesByUserId(employeeId);
        setLastServices(fetchLastServices);
        setLicencias(fetchLicencias);
        setProximosServicios(fetchServicios);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, userId]);

  return (
    <div className="container px-4 sm:px-6 mx-auto py-6 space-y-6 md:space-y-8">
      {/* Header with employee info - Updated with better colors */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-white">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ¡Bienvenido, {user?.nombre.toUpperCase()}!
            </h1>
            <p className="mt-1 text-blue-100">
              {user?.roles} •{" "}
              <Badge className="bg-white/20 text-white hover:bg-white/30 ml-1">
                {user?.estado}
              </Badge>
            </p>
          </div>
          <Button className="bg-white text-blue-700 hover:bg-blue-50" asChild>
            <Link href="/empleado/perfil">Ver mi perfil</Link>
          </Button>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Upcoming services card */}
        <Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
            <CardTitle className="text-blue-800 dark:text-blue-300">
              Mis próximos servicios
            </CardTitle>
            <CardDescription>
              Servicios programados para los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando servicios...
              </div>
            ) : !proximosServicios || proximosServicios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes servicios asignados
              </div>
            ) : (
              proximosServicios.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col md:flex-row gap-4 p-3 sm:p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        className={getServiceTypeBadge(service.tipoServicio)}
                      >
                        {service.tipoServicio}
                      </Badge>
                      <h3 className="font-medium">
                        {service.cliente?.nombre ||
                          `Cliente ID: ${service.clienteId}`}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>
                          {formatDate(service.fechaProgramada)} -{" "}
                          {formatTime(service.fechaProgramada)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="break-words">{service.ubicacion}</span>
                      </div>
                      {service.vehiculo && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-green-500" />
                          <span>
                            Vehículo: {service.vehiculo.modelo} (ID:{" "}
                            {service.vehiculo.id})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                      asChild
                    >
                      <Link href={`/empleado/servicios/${service.id}`}>
                        Ver detalles
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-center mt-4">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/empleado/servicios">Ver todos los servicios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave management card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-purple-800 dark:text-purple-300">
                  Mis licencias
                </CardTitle>
                <CardDescription>
                  Gestión de licencias y permisos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Activas</TabsTrigger>
                <TabsTrigger value="request">Solicitar</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando licencias...
                  </div>
                ) : !licencias || licencias.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes licencias activas o pendientes
                  </div>
                ) : (
                  licencias.map((licencia) => (
                    <div
                      key={licencia.id}
                      className="border rounded-lg p-3 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">
                            {licencia.tipoLicencia}
                          </span>
                        </div>
                        <Badge
                          className={getLeaveStatusBadge(
                            licencia.aprobado ? "APROBADO" : "PENDIENTE"
                          )}
                        >
                          {licencia.aprobado ? "APROBADO" : "PENDIENTE"}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>Desde: {formatDate(licencia.fechaInicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>Hasta: {formatDate(licencia.fechaFin)}</span>
                        </div>
                        {licencia.notas && (
                          <div className="text-muted-foreground mt-1 italic">
                            "{licencia.notas}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/empleado/licencias">Ver historial completo</Link>
                </Button>
              </TabsContent>

              <TabsContent value="request" className="mt-4">
                <div className="border rounded-lg p-4 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
                  <h3 className="font-medium mb-3">Solicitar nueva licencia</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para solicitar una nueva licencia o permiso, selecciona el
                    tipo y completa el formulario detallado.
                  </p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <Link href="/empleado/licencias/nueva">
                      Solicitar licencia
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">
                    Tipos de licencias disponibles:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {availableLeaveTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center text-sm"
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 text-purple-500" />
                        {type.label}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Completed services section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-b">
          <CardTitle className="text-green-800 dark:text-green-300">
            Servicios completados recientemente
          </CardTitle>
          <CardDescription>Últimos servicios realizados</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground col-span-full">
                Cargando servicios completados...
              </div>
            ) : !lastServices ||
              (Array.isArray(lastServices) && lastServices.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground col-span-full">
                No hay servicios completados recientes
              </div>
            ) : (
              Array.isArray(lastServices) &&
              lastServices.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-lg p-4 hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={getServiceTypeBadge(service.tipoServicio)}
                    >
                      {service.tipoServicio}
                    </Badge>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Completado</span>
                    </div>
                  </div>

                  <h3 className="font-medium mb-2">
                    {service.cliente?.nombre ||
                      `Cliente ID: ${service.clienteId}`}
                  </h3>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>{formatDate(service.fechaProgramada)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="truncate">{service.ubicacion}</span>
                    </div>
                    {service.cantidadBanos && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>Baños: {service.cantidadBanos}</span>
                      </div>
                    )}
                    {service.asignaciones &&
                      service.asignaciones.length > 0 &&
                      service.asignaciones[0].vehiculo && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-green-500" />
                          <span>
                            Vehículo: {service.asignaciones[0].vehiculo.modelo}
                            {service.asignaciones[0].vehiculo.placa &&
                              ` (${service.asignaciones[0].vehiculo.placa})`}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>

          {lastServices &&
            Array.isArray(lastServices) &&
            lastServices.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link href="/empleado/servicios/completados">
                    Ver todos los servicios completados
                  </Link>
                </Button>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Quick links section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-b pb-3">
            <CardTitle className="text-amber-800 dark:text-amber-300 text-sm">
              Acceso rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="justify-start hover:bg-amber-50 dark:hover:bg-amber-950"
                asChild
              >
                <Link href="/empleado/horarios">
                  <Calendar className="mr-2 h-4 w-4 text-amber-600" />
                  Mi horario semanal
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start hover:bg-amber-50 dark:hover:bg-amber-950"
                asChild
              >
                <Link href="/empleado/compañeros">
                  <UserRound className="mr-2 h-4 w-4 text-amber-600" />
                  Ver equipo de trabajo
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start hover:bg-amber-50 dark:hover:bg-amber-950"
                asChild
              >
                <Link href="/empleado/vehiculos">
                  <Truck className="mr-2 h-4 w-4 text-amber-600" />
                  Vehículos asignados
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950 dark:to-cyan-950 border-b pb-3">
            <CardTitle className="text-sky-800 dark:text-sky-300 text-sm">
              Herramientas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="justify-start hover:bg-sky-50 dark:hover:bg-sky-950"
                asChild
              >
                <Link href="/empleado/reportes">
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-sky-600" />
                  Mis reportes
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start hover:bg-sky-50 dark:hover:bg-sky-950"
                asChild
              >
                <Link href="/empleado/notificaciones">
                  <Bell className="mr-2 h-4 w-4 text-sky-600" />
                  Notificaciones
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardEmployeeComponent;
