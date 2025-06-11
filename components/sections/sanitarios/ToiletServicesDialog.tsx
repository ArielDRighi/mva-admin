'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, User, Phone, MapPin, Mail, Loader2 } from 'lucide-react';
import { getToiletServices } from '@/app/actions/sanitarios';
import { toast } from 'sonner';

interface ToiletServicesDialogProps {
  toiletId: string;
  toiletName: string;
  children: React.ReactNode;
}

interface ServiceData {
  servicioId: number;
  servicioNombre: string;
  servicioDescripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoServicio: string;
  clienteId: number;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  clienteDireccion: string;
}

export function ToiletServicesDialog({ toiletId, toiletName, children }: ToiletServicesDialogProps) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getToiletServices(Number(toiletId));
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar los servicios');
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
      'ACTIVO': { variant: 'default', label: 'Activo' },
      'COMPLETADO': { variant: 'secondary', label: 'Completado' },
      'CANCELADO': { variant: 'destructive', label: 'Cancelado' },
      'PENDIENTE': { variant: 'outline', label: 'Pendiente' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline', label: status };
    
    return (
      <Badge variant={statusInfo.variant as any}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
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
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.servicioId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.servicioNombre}</p>
                          {service.servicioDescripcion && (
                            <p className="text-sm text-muted-foreground">
                              {service.servicioDescripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{service.clienteNombre}</span>
                          </div>
                          {service.clienteDireccion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{service.clienteDireccion}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {service.clienteEmail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{service.clienteEmail}</span>
                            </div>
                          )}
                          {service.clienteTelefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{service.clienteTelefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Inicio:</span>{' '}
                            {new Date(service.fechaInicio).toLocaleDateString('es-ES')}
                          </p>
                          <p>
                            <span className="font-medium">Fin:</span>{' '}
                            {new Date(service.fechaFin).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(service.estadoServicio)}
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
