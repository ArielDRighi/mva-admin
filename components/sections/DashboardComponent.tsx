"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  TruckIcon,
  User2Icon,
  Toilet,
  Activity,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type User = {
  id: number;
  nombre: string;
  email: string;
  empleadoId: number | null;
  estado: string;
  roles: string[];
};

const DashboardComponent = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Hardcoded data for dashboard
  const resources = {
    vehicles: { total: 15, available: 8, maintenance: 2, assigned: 5 },
    employees: { total: 22, available: 10, unavailable: 3, assigned: 9 },
    toilets: { total: 35, available: 12, maintenance: 4, assigned: 19 },
  };

  const recentActivity = [
    {
      type: "SERVICIO",
      action: "COMPLETADO",
      description: "Instalación para Cliente ABC",
      time: "Hace 1 hora",
      user: "Carlos Ramírez",
    },
    {
      type: "MANTENIMIENTO",
      action: "PROGRAMADO",
      description: "Vehículo Ford F-150 (ABC123)",
      time: "Hace 2 horas",
      user: "Laura González",
    },
    {
      type: "SERVICIO",
      action: "ASIGNADO",
      description: "Limpieza para Cliente XYZ",
      time: "Hace 3 horas",
      user: "Juan Pérez",
    },
    {
      type: "BAÑO",
      action: "MANTENIMIENTO",
      description: "Baño #12 en reparación",
      time: "Hace 5 horas",
      user: "Sistema",
    },
    {
      type: "CLIENTE",
      action: "NUEVO",
      description: "Eventos Premium SA",
      time: "Hace 6 horas",
      user: "Ana Martínez",
    },
  ];

  const upcomingMaintenance = [
    {
      id: 1,
      type: "Vehículo",
      resource: "Ford F-150 (ABC123)",
      date: "2025-05-17",
      maintenance: "Cambio de aceite y filtros",
      priority: "Alta",
    },
    {
      id: 2,
      type: "Baño",
      resource: "Baño #08",
      date: "2025-05-18",
      maintenance: "Revisión general",
      priority: "Media",
    },
    {
      id: 3,
      type: "Vehículo",
      resource: "Mercedes Sprinter (XYZ789)",
      date: "2025-05-20",
      maintenance: "Mantenimiento preventivo",
      priority: "Baja",
    },
    {
      id: 4,
      type: "Baño",
      resource: "Baño #15",
      date: "2025-05-22",
      maintenance: "Reparación de válvula",
      priority: "Alta",
    },
  ];

  const servicesByType = [
    { type: "INSTALACIÓN", count: 25, percentage: 36 },
    { type: "LIMPIEZA", count: 32, percentage: 46 },
    { type: "RETIRO", count: 10, percentage: 14 },
    { type: "REPARACIÓN", count: 3, percentage: 4 },
  ];

  const todayServices = [
    {
      id: 1,
      client: "Constructora Norte SA",
      type: "INSTALACIÓN",
      status: "PROGRAMADO",
      time: "09:30",
      address: "Av. Santa Fe 1234",
    },
    {
      id: 2,
      client: "Eventos Exclusivos",
      type: "RETIRO",
      status: "EN_PROGRESO",
      time: "10:15",
      address: "Ruta 2 km 50",
    },
    {
      id: 3,
      client: "Parque Industrial Este",
      type: "LIMPIEZA",
      status: "PROGRAMADO",
      time: "13:00",
      address: "Calle Industrial 500",
    },
    {
      id: 4,
      client: "Centro Cultural Recoleta",
      type: "MANTENIMIENTO",
      status: "COMPLETADO",
      time: "08:45",
      address: "Junín 1930",
    },
  ];

  const pendingServices = 12;
  const completedServices = 8;

  const pendingContractRenewals = [
    { client: "Constructora Norte SA", expiration: "2025-05-25" },
    { client: "Eventos Exclusivos", expiration: "2025-06-01" },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return "bg-blue-100 text-blue-800";
      case "EN_PROGRESO":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETADO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-yellow-100 text-yellow-800";
      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido, {user?.nombre || "Administrador"}
          </h1>
          <p className="text-gray-500 mt-1">
            Panel de control MVA - {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            onClick={() => router.push("/dashboard/servicios/crear")}
            className="bg-primary hover:bg-primary/90"
          >
            Nuevo Servicio
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/reportes")}
          >
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Resource summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.vehicles.available}/{resources.vehicles.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehículos disponibles
            </p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span>Disponibles</span>
                <span className="font-semibold">
                  {resources.vehicles.available} (
                  {Math.round(
                    (resources.vehicles.available / resources.vehicles.total) *
                      100
                  )}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (resources.vehicles.available / resources.vehicles.total) *
                  100
                }
                className="h-1"
              />
              <div className="flex justify-between text-xs mt-2">
                <Badge variant="outline" className="bg-blue-50">
                  Asignados: {resources.vehicles.assigned}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  En mant.: {resources.vehicles.maintenance}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <User2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.employees.available}/{resources.employees.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Empleados disponibles
            </p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span>Disponibles</span>
                <span className="font-semibold">
                  {resources.employees.available} (
                  {Math.round(
                    (resources.employees.available /
                      resources.employees.total) *
                      100
                  )}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (resources.employees.available / resources.employees.total) *
                  100
                }
                className="h-1"
              />
              <div className="flex justify-between text-xs mt-2">
                <Badge variant="outline" className="bg-blue-50">
                  Asignados: {resources.employees.assigned}
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  Inactivos: {resources.employees.unavailable}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Baños</CardTitle>
            <Toilet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.toilets.available}/{resources.toilets.total}
            </div>
            <p className="text-xs text-muted-foreground">Baños disponibles</p>
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span>Disponibles</span>
                <span className="font-semibold">
                  {resources.toilets.available} (
                  {Math.round(
                    (resources.toilets.available / resources.toilets.total) *
                      100
                  )}
                  %)
                </span>
              </div>
              <Progress
                value={
                  (resources.toilets.available / resources.toilets.total) * 100
                }
                className="h-1"
              />
              <div className="flex justify-between text-xs mt-2">
                <Badge variant="outline" className="bg-blue-50">
                  Asignados: {resources.toilets.assigned}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  En mant.: {resources.toilets.maintenance}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's services and summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Servicios de hoy</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/servicios/listado")}
                >
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center p-3 border rounded-md"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="font-semibold text-lg">
                        {service.time}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{service.client}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.address}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="secondary">{service.type}</Badge>
                      <span
                        className={`mt-1 text-xs px-2 py-1 rounded ${getStatusColor(
                          service.status
                        )}`}
                      >
                        {service.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
                {todayServices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay servicios programados para hoy
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Resumen de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-xl text-blue-700">
                    {pendingServices}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Servicios Pendientes
                  </div>
                  <div className="text-sm">Programados para esta semana</div>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="font-bold text-xl text-green-700">
                    {completedServices}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">
                    Servicios Completados
                  </div>
                  <div className="text-sm">En las últimas 24 horas</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Distribución de servicios
                </div>
                {servicesByType.map((service, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{service.type}</span>
                      <span>
                        {service.count} ({service.percentage}%)
                      </span>
                    </div>
                    <Progress value={service.percentage} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs with upcoming maintenance and recent activity */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="maintenance">
              <Clock className="mr-2 h-4 w-4" />
              Mantenimientos Programados
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Actividad Reciente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Mantenimientos</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMaintenance.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingMaintenance.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-md p-4 relative"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-gray-50">
                            {item.type}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{item.resource}</h3>
                        <p className="text-sm text-gray-600">
                          {item.maintenance}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay mantenimientos programados próximamente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-start pb-4 border-b last:border-0"
                    >
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        {activity.type === "SERVICIO" && (
                          <TruckIcon className="h-5 w-5" />
                        )}
                        {activity.type === "MANTENIMIENTO" && (
                          <Clock className="h-5 w-5" />
                        )}
                        {activity.type === "BAÑO" && (
                          <Toilet className="h-5 w-5" />
                        )}
                        {activity.type === "CLIENTE" && (
                          <User2Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium">{activity.action}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Por: {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Alerts and notifications */}
      {pendingContractRenewals.length > 0 && (
        <div className="mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                <CardTitle className="text-red-800">Alertas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingContractRenewals.map((contract, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white p-3 rounded-md border border-red-100"
                  >
                    <div>
                      <p className="font-medium">{contract.client}</p>
                      <p className="text-sm text-gray-600">
                        Contrato vence el{" "}
                        {new Date(contract.expiration).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push("/dashboard/contratos")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Renovar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardComponent;
