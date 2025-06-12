"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, User, Phone, MapPin, Mail, Loader2 } from "lucide-react";
import { getToiletServices } from "@/app/actions/sanitarios";
import { toast } from "sonner";

interface ToiletServicesDialogProps {
  toiletId: string;
  toiletName: string;
  children: React.ReactNode;
}

interface ServiceData {
  clientedireccion: string;
  clienteemail: string;
  clienteid: number;
  clientenombre: string;
  clientetelefono: string;
  estadoservicio: string;
  fechafin: string;
  fechainicio: string;
  fechaprogramada: string;
  notasservicio: string;
  servicioid: number;
  tiposervicio: string;
  ubicacionservicio: string;
}

export function ToiletServicesDialog({
  toiletId,
  toiletName,
  children,
}: ToiletServicesDialogProps) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getToiletServices(Number(toiletId));
      console.log("Fetched services:", data);
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open, toiletId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; label: string }> = {
      ACTIVO: { variant: "default", label: "Activo" },
      COMPLETADO: { variant: "secondary", label: "Completado" },
      CANCELADO: { variant: "destructive", label: "Cancelado" },
      PENDIENTE: { variant: "outline", label: "Pendiente" },
      PROGRAMADO: { variant: "default", label: "Programado" },
    };

    const statusInfo = statusMap[status] || {
      variant: "outline",
      label: status,
    };

    return (
      <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[1200px] max-w-[95vw] h-[600px] max-h-[85vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Servicios Asignados - {toiletName}
          </DialogTitle>
          <DialogDescription>
            Lista de servicios a los que está asignado este baño químico
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Este baño no está asignado a ningún servicio actualmente
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="rounded-md border">
              <Table>
                {" "}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Servicio</TableHead>
                    <TableHead className="w-[200px]">Cliente</TableHead>
                    <TableHead className="w-[220px]">Contacto</TableHead>
                    <TableHead className="w-[240px]">Fechas</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.servicioid}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.tiposervicio}</p>
                          {service.ubicacionservicio && (
                            <p className="text-sm text-muted-foreground">
                              {service.ubicacionservicio}
                            </p>
                          )}
                          {service.notasservicio && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.notasservicio}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {service.clientenombre}
                            </span>
                          </div>
                          {service.clientedireccion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{service.clientedireccion}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {service.clienteemail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{service.clienteemail}</span>
                            </div>
                          )}
                          {service.clientetelefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{service.clientetelefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Programada:</span>{" "}
                            {new Date(
                              service.fechaprogramada
                            ).toLocaleDateString("es-ES")}
                          </p>
                          <p>
                            <span className="font-medium">Inicio:</span>{" "}
                            {new Date(service.fechainicio).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Fin:</span>{" "}
                            {new Date(service.fechafin).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(service.estadoservicio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
