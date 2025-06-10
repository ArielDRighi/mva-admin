"use client";
// Eliminar las importaciones no utilizadas
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
  LogOut,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { User } from "@/components/sections/DashboardComponent";
import { deleteCookie, getCookie } from "cookies-next";
import {
  getLastServicesByUserId,
  getMineAssignedServicesInProgress,
  getMineAssignedServicesPending,
} from "@/app/actions/empleados";
import { getUserById } from "@/app/actions/users";
import {
  createEmployeeLeave,
  getLicenciasByUserId,
} from "@/app/actions/LicenciasEmpleados";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateStatusService } from "@/app/actions/services";
import { toast } from "sonner";
import { CreateEmployeeLeaveDto, LeaveType } from "@/types/types";
import { useRouter } from "next/navigation";

// Import types and utilities
import {
  ServiceStatus,
  ProximoServicio,
  Licencia,
  CompletedService,
  UpdateResponse,
  LeaveResponse,
} from "@/types/dashboardEmployeeTypes";
import { availableLeaveTypes } from "./constants/employeeConstants";
import {
  formatDate,
  formatTime,
  getServiceTypeBadge,
  getLeaveStatusBadge,
} from "./utils/employeeUtils";

// Import custom hooks
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { useServices } from "@/hooks/useServices";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useLogout } from "@/hooks/useLogout";

enum serviceStatus {
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  SUSPENDIDO = "SUSPENDIDO",
}

const DashboardEmployeeComponent = () => {
  // Use custom hooks for state management and logic
  const { user, employeeId, loading: userLoading } = useEmployeeData();
  const {
    proximosServicios,
    inProgressServices,
    lastServices,
    selectedService,
    selectedCompletedService,
    isModalOpen,
    isCompletedServiceModalOpen,
    startingTask,
    completingTask,
    loading: servicesLoading,
    setSelectedService,
    setSelectedCompletedService,
    setIsModalOpen,
    setIsCompletedServiceModalOpen,
    handleStartTask,
    handleCompleteTask,
    refreshServices,
  } = useServices(employeeId);
  const {
    licencias,
    selectedLeaveType,
    startDate,
    endDate,
    notesText,
    isSubmittingLeave,
    isLeaveModalOpen,
    setSelectedLeaveType,
    setStartDate,
    setEndDate,
    setNotesText,
    setIsLeaveModalOpen,
    handleLeaveRequest,
    openLeaveModal,
    closeLeaveModal,
  } = useLeaveManagement(employeeId);

  const { handleLogoutClick } = useLogout();
  const userId = user?.id || 0;
  const loading = userLoading || servicesLoading;
  const router = useRouter();

  return (
    <div className="container px-4 sm:px-6 mx-auto py-6 space-y-6 md:space-y-8">
      {/* Header with employee info - Updated with better colors */}{" "}
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
            </p>{" "}
            {/* Quick links section moved to header */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/contactos_emergencia"
                  className="flex items-center"
                >
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm line-clamp-2">
                    Contactos de emergencia
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link href="/empleado/vestimenta" className="flex items-center">
                  <UserRound className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Mis talles de ropa</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/licencia_conducir"
                  className="flex items-center"
                >
                  <Truck className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Mi licencia de conducir</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/adelantos-salario"
                  className="flex items-center"
                >
                  <DollarSign className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Adelantos de salario</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            {" "}
            <Button
              variant="outline"
              className="bg-red-500 text-white hover:bg-red-600 border-none"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </div>{" "}
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Upcoming services card - Now full width */}
        <Card className="lg:col-span-3 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
            <CardTitle className="text-blue-800 dark:text-blue-300">
              Mis servicios programados
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
                  className="flex flex-col md:flex-row gap-4 p-3 sm:p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedService(service);
                    setIsModalOpen(true);
                  }}
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
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setSelectedService(service);
                        setIsModalOpen(true);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))
            )}{" "}
          </CardContent>
        </Card>

        {/* InProgress services card - Now spans the full width */}
        <Card className="lg:col-span-3 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-b">
            <CardTitle className="text-green-800 dark:text-green-300">
              Mis servicios en progreso
            </CardTitle>
            <CardDescription>
              Servicios que están actualmente en ejecución
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando servicios...
              </div>
            ) : !inProgressServices || inProgressServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tienes servicios en progreso
              </div>
            ) : (
              inProgressServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col md:flex-row gap-4 p-3 sm:p-4 border border-green-200 rounded-lg bg-green-50/50 hover:bg-green-100/60 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedService(service);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        className={getServiceTypeBadge(service.tipoServicio)}
                      >
                        {service.tipoServicio}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        EN PROGRESO
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
                      {service.cantidadBanos !== undefined &&
                        service.cantidadBanos > 0 && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>Baños: {service.cantidadBanos}</span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 md:mt-0">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedService(service);
                        setIsModalOpen(true);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
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
                  className="border rounded-lg p-4 hover:bg-green-50 dark:hover:bg-green-950 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCompletedService(service);
                    setIsCompletedServiceModalOpen(true);
                  }}
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
          </div>{" "}
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
      {/* Leave management card - Moved to the bottom */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-purple-800 dark:text-purple-300">
                Mis licencias
              </CardTitle>
              <CardDescription>Gestión de licencias y permisos</CardDescription>
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
                          &quot;{licencia.notas}&quot;
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
                  onClick={openLeaveModal}
                >
                  Solicitar licencia
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">
                  Tipos de licencias disponibles:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {availableLeaveTypes.map((type) => (
                    <div key={type.value} className="flex items-center text-sm">
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
      {/* Service Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle del Servicio</DialogTitle>
            <DialogDescription>
              Información completa del servicio asignado
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={getServiceTypeBadge(selectedService.tipoServicio)}
                >
                  {selectedService.tipoServicio}
                </Badge>
                {selectedService.estado === "EN_PROGRESO" && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    EN PROGRESO
                  </Badge>
                )}
                <h2 className="font-semibold text-lg">
                  {selectedService.cliente?.nombre ||
                    `Cliente ID: ${selectedService.clienteId}`}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b py-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Fecha y Hora
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>{formatDate(selectedService.fechaProgramada)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{formatTime(selectedService.fechaProgramada)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Ubicación
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="break-words">
                        {selectedService.ubicacion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedService.cantidadBanos && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Cantidad de Baños
                      </h3>
                      <div className="mt-1">
                        <span>{selectedService.cantidadBanos}</span>
                      </div>
                    </div>
                  )}

                  {selectedService.cantidadEmpleados && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Personal Asignado
                      </h3>
                      <div className="mt-1">
                        <span>
                          {selectedService.cantidadEmpleados} empleados
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedService.vehiculo && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Vehículo
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Truck className="h-4 w-4 text-green-500" />
                        <span>
                          {selectedService.vehiculo.modelo}
                          {selectedService.vehiculo.patente &&
                            ` (${selectedService.vehiculo.patente})`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedService.notas && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Notas
                  </h3>
                  <p className="mt-1 text-sm border rounded-md p-3 bg-muted/30">
                    {selectedService.notas}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </Button>
            {selectedService && selectedService.estado === "PROGRAMADO" && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStartTask(selectedService.id)}
                disabled={startingTask}
              >
                {startingTask ? "Iniciando..." : "Comenzar Tarea"}
              </Button>
            )}
            {selectedService && selectedService.estado === "EN_PROGRESO" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleCompleteTask(selectedService.id)}
                disabled={completingTask}
              >
                {completingTask ? "Completando..." : "Completar Tarea"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Completed Service Detail Modal */}
      <Dialog
        open={isCompletedServiceModalOpen}
        onOpenChange={setIsCompletedServiceModalOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Servicio Completado</DialogTitle>
            <DialogDescription>
              Detalles del servicio finalizado
            </DialogDescription>
          </DialogHeader>

          {selectedCompletedService && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={getServiceTypeBadge(
                    selectedCompletedService.tipoServicio
                  )}
                >
                  {selectedCompletedService.tipoServicio}
                </Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  COMPLETADO
                </Badge>
                <h2 className="font-semibold text-lg">
                  {selectedCompletedService.cliente?.nombre ||
                    `Cliente ID: ${selectedCompletedService.clienteId}`}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b py-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Fecha Programada
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        {formatDate(selectedCompletedService.fechaProgramada)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Período de Ejecución
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>
                        Inicio:{" "}
                        {formatDate(selectedCompletedService.fechaInicio)}{" "}
                        {formatTime(selectedCompletedService.fechaInicio)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>
                        Fin: {formatDate(selectedCompletedService.fechaFin)}{" "}
                        {formatTime(selectedCompletedService.fechaFin)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Ubicación
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="break-words">
                        {selectedCompletedService.ubicacion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedCompletedService.cantidadBanos && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Cantidad de Baños
                      </h3>
                      <div className="mt-1">
                        <span>{selectedCompletedService.cantidadBanos}</span>
                      </div>
                    </div>
                  )}

                  {selectedCompletedService.cantidadEmpleados && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Personal Asignado
                      </h3>
                      <div className="mt-1">
                        <span>
                          {selectedCompletedService.cantidadEmpleados} empleados
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCompletedService.asignaciones &&
                    selectedCompletedService.asignaciones.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Equipo y Vehículos
                        </h3>
                        {selectedCompletedService.asignaciones.map(
                          (asignacion) => (
                            <div key={asignacion.id} className="mt-1">
                              {asignacion.empleado && (
                                <div className="flex items-center gap-2">
                                  <UserRound className="h-4 w-4 text-blue-500" />
                                  <span>
                                    {asignacion.empleado.nombre}{" "}
                                    {asignacion.empleado.apellido}
                                  </span>
                                </div>
                              )}
                              {asignacion.vehiculo && (
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-green-500" />
                                  <span>
                                    {asignacion.vehiculo.modelo}
                                    {asignacion.vehiculo.placa &&
                                      ` (${asignacion.vehiculo.placa})`}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>

              {selectedCompletedService.notas && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Notas
                  </h3>
                  <p className="mt-1 text-sm border rounded-md p-3 bg-muted/30">
                    {selectedCompletedService.notas}
                  </p>
                </div>
              )}

              {selectedCompletedService.cliente &&
                selectedCompletedService.cliente.contacto_principal && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Contacto del Cliente
                    </h3>
                    <div className="mt-1 text-sm">
                      <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedCompletedService.cliente.contacto_principal}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedCompletedService.cliente.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedCompletedService.cliente.telefono}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompletedServiceModalOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Leave Request Modal */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Solicitar Licencia</DialogTitle>
            <DialogDescription>
              Complete el formulario para solicitar una nueva licencia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type selection */}
            <div className="space-y-2">
              <label htmlFor="leaveType" className="block text-sm font-medium">
                Tipo de licencia *
              </label>
              <select
                id="leaveType"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedLeaveType}
                onChange={(e) =>
                  setSelectedLeaveType(e.target.value as LeaveType)
                }
              >
                <option value="">-- Selecciona un tipo --</option>
                {availableLeaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  Fecha inicio *
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium">
                  Fecha fin *
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Notes field */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Notas o justificación
              </label>
              <textarea
                id="notes"
                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px]"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Explique motivos o agregue información adicional"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            {" "}
            <Button variant="outline" onClick={closeLeaveModal}>
              Cancelar
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleLeaveRequest}
              disabled={
                isSubmittingLeave ||
                !selectedLeaveType ||
                !startDate ||
                !endDate
              }
            >
              {isSubmittingLeave ? "Enviando solicitud..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardEmployeeComponent;
