"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  FileText,
  MapPin,
  Truck,
  User,
  Users,
  Bath,
} from "lucide-react";

// Tipos
interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
}

interface Vehiculo {
  id: number;
  numeroInterno: string;
  placa: string;
  marca: string;
  modelo: string;
  estado: string;
}

interface Bano {
  baño_id: number;
  codigo_interno: string;
  modelo: string;
  estado: string;
}

interface Asignacion {
  id: number;
  servicioId: number;
  empleadoId?: number;
  empleado?: Empleado;
  vehiculoId?: number;
  vehiculo?: Vehiculo;
  banoId?: number;
  bano?: Bano;
  rolEmpleado?: string | null;
  fechaAsignacion: string;
}

interface Cliente {
  clienteId: number;
  nombre: string;
  email: string;
  cuit: string;
  direccion: string;
  telefono: string;
  contacto_principal: string;
  estado: string;
}

interface Servicio {
  id: number;
  clienteId: number | null;
  cliente: Cliente | null;
  fechaProgramada: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  tipoServicio: string;
  estado: string;
  cantidadBanos: number;
  cantidadEmpleados: number;
  cantidadVehiculos: number;
  ubicacion: string;
  notas: string | null;
  asignacionAutomatica: boolean;
  banosInstalados: string[] | null;
  condicionContractualId: number | null;
  fechaFinAsignacion: string | null;
  fechaCreacion: string;
  comentarioIncompleto: string | null;
  asignaciones: Asignacion[];
}

interface ServiceDetailsModalProps {
  servicio: Servicio | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banosCompletos?: Bano[];
}

// Funciones auxiliares
const formatDate = (dateString: string | null) => {
  if (!dateString) return "No especificada";
  return format(new Date(dateString), "dd MMM yyyy", { locale: es });
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return "";
  return format(new Date(dateString), "HH:mm", { locale: es });
};

const getStatusBadgeStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "PROGRAMADO":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "EN_PROGRESO":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "COMPLETADO":
      return "bg-green-100 text-green-800 border-green-300";
    case "CANCELADO":
      return "bg-red-100 text-red-800 border-red-300";
    case "SUSPENDIDO":
      return "bg-gray-200 text-gray-800 border-gray-400";
    case "INCOMPLETO":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export function ServiceDetailsModal({
  servicio,
  open,
  onOpenChange,
  banosCompletos = [],
}: ServiceDetailsModalProps) {
  if (!servicio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Servicio</DialogTitle>
          <DialogDescription>
            ID: {servicio.id} | Tipo: {servicio.tipoServicio} | Creado:{" "}
            {formatDate(servicio.fechaCreacion)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Cliente
              </h3>
              <p className="text-lg font-semibold">
                {servicio.cliente?.nombre || "No especificado"}
              </p>
              {servicio.cliente && (
                <div className="mt-1 text-sm">
                  <p className="flex items-center gap-1">
                    <span>CUIT:</span>
                    <span className="text-muted-foreground">
                      {servicio.cliente.cuit}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span>Contacto:</span>
                    <span className="text-muted-foreground">
                      {servicio.cliente.contacto_principal}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Fechas
              </h3>
              <div className="mt-1 space-y-1">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  <span>
                    Programada: {formatDate(servicio.fechaProgramada)}{" "}
                    {formatTime(servicio.fechaProgramada)}
                  </span>
                </p>
                {servicio.fechaInicio && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-green-500" />
                    <span>Inicio: {formatDate(servicio.fechaInicio)}</span>
                  </p>
                )}
                {servicio.fechaFin && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-red-500" />
                    <span>Fin: {formatDate(servicio.fechaFin)}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Ubicación
              </h3>
              <p className="mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{servicio.ubicacion}</span>
              </p>
            </div>

            {servicio.notas && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Notas
                </h3>
                <p className="mt-1 text-sm border rounded-md p-3 bg-muted/30">
                  {servicio.notas}
                </p>
              </div>
            )}

            {servicio.comentarioIncompleto && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Comentario (Incompleto)
                </h3>
                <p className="mt-1 text-sm border rounded-md p-3 bg-orange-50 text-orange-800">
                  {servicio.comentarioIncompleto}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Recursos
              </h3>
              <div className="mt-1 space-y-2">
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Baños: {servicio.cantidadBanos}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span>Empleados: {servicio.cantidadEmpleados}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>Vehículos: {servicio.cantidadVehiculos}</span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Estado
              </h3>
              <div className="mt-1">
                <Badge className={getStatusBadgeStyle(servicio.estado)}>
                  {servicio.estado}
                </Badge>
                <p className="mt-1 text-sm">
                  Asignación:{" "}
                  {servicio.asignacionAutomatica ? "Automática" : "Manual"}
                </p>
              </div>
            </div>

            {servicio.asignaciones && servicio.asignaciones.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Asignaciones
                </h3>
                <div className="mt-2 space-y-3">
                  {/* Empleados asignados */}
                  {servicio.asignaciones
                    .filter((asig) => asig.empleado)
                    .map((asig) => (
                      <div
                        key={`emp-${asig.id}`}
                        className="flex items-center gap-2 p-2 rounded-md bg-slate-50"
                      >
                        <User className="h-4 w-4 text-blue-500" />
                        <span>
                          {asig.empleado?.nombre} {asig.empleado?.apellido}
                          {asig.rolEmpleado && (
                            <Badge
                              variant="outline"
                              className={`ml-2 ${asig.rolEmpleado === "A" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                            >
                              Rol {asig.rolEmpleado}
                            </Badge>
                          )}
                        </span>
                      </div>
                    ))}

                  {/* Vehículos asignados */}
                  {servicio.asignaciones
                    .filter((asig) => asig.vehiculo)
                    .map((asig) => (
                      <div
                        key={`veh-${asig.id}`}
                        className="flex items-center gap-2 p-2 rounded-md bg-slate-50"
                      >
                        <Truck className="h-4 w-4 text-green-500" />
                        <span>
                          {asig.vehiculo?.marca} {asig.vehiculo?.modelo} (
                          {asig.vehiculo?.placa})
                        </span>
                      </div>
                    ))}

                  {/* Baños asignados desde asignaciones (para servicios de instalación) */}
                  {servicio.tipoServicio !== "LIMPIEZA" &&
                    servicio.tipoServicio !== "RETIRO" &&
                    servicio.asignaciones
                      .filter((asig) => asig.bano)
                      .map((asig) => (
                        <div
                          key={`ban-${asig.id}`}
                          className="flex items-center gap-2 p-2 rounded-md bg-slate-50"
                        >
                          <FileText className="h-4 w-4 text-purple-500" />
                          <span>
                            Baño #{asig.bano?.codigo_interno} (Modelo:{" "}
                            {asig.bano?.modelo})
                          </span>
                        </div>
                      ))}

                  {/* Baños instalados para servicios de LIMPIEZA y RETIRO */}
                  {(servicio.tipoServicio === "LIMPIEZA" ||
                    servicio.tipoServicio === "RETIRO") &&
                    renderBanosInstalados(servicio, banosCompletos)}
                </div>
              </div>
            )}

            {/* Mostrar baños instalados si no hay asignaciones pero sí banosInstalados */}
            {(!servicio.asignaciones || servicio.asignaciones.length === 0) &&
              servicio.banosInstalados &&
              servicio.banosInstalados.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Baños Instalados
                  </h3>
                  <div className="mt-2 space-y-3">
                    {renderBanosInstalados(servicio, banosCompletos)}
                  </div>
                </div>
              )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Función auxiliar para renderizar baños instalados
function renderBanosInstalados(servicio: Servicio, banosCompletos: Bano[]) {
  if (!servicio.banosInstalados || servicio.banosInstalados.length === 0) {
    return null;
  }

  return servicio.banosInstalados.map((banoCodigoInterno, index) => {
    // Buscar el baño completo por código interno
    const banoCompleto = banosCompletos.find(
      (bano) => String(bano.codigo_interno) === String(banoCodigoInterno)
    );

    const isRetiro = servicio.tipoServicio === "RETIRO";
    const bgClass = isRetiro ? "bg-red-50" : "bg-blue-50";
    const iconClass = isRetiro ? "text-red-500" : "text-blue-500";

    return (
      <div
        key={`instalado-${banoCodigoInterno}-${index}`}
        className={`flex items-center gap-2 p-2 rounded-md ${bgClass}`}
      >
        <Bath className={`h-4 w-4 ${iconClass}`} />
        <span>
          Baño #{banoCodigoInterno}
          {banoCompleto && ` (Modelo: ${banoCompleto.modelo})`}
          {servicio.tipoServicio === "LIMPIEZA" && (
            <Badge
              variant="outline"
              className="ml-2 bg-blue-100 text-blue-800"
            >
              Para Limpieza
            </Badge>
          )}
          {servicio.tipoServicio === "RETIRO" && (
            <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
              Para Retiro
            </Badge>
          )}
        </span>
      </div>
    );
  });
}

export type { Servicio, Asignacion, Cliente, Empleado, Vehiculo, Bano };
