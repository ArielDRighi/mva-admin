"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { deleteService, getInstalaciones } from "@/app/actions/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListadoTabla } from "../ui/local/ListadoTabla";
import { PaginationLocal } from "../ui/local/PaginationLocal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  Truck,
  User,
  Users,
} from "lucide-react";

// Define interfaces for type safety
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
  fechaAsignacion: string;
}

interface Instalacion {
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
  notas: string;
  asignacionAutomatica: boolean;
  banosInstalados: any[];
  condicionContractualId: number | null;
  fechaFinAsignacion: string | null;
  fechaCreacion: string;
  comentarioIncompleto: string | null;
  asignaciones: Asignacion[];
}

interface InstalacionesResponse {
  data: Instalacion[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export function ListadoInstalacionComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [selectedInstalacion, setSelectedInstalacion] =
    useState<Instalacion | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    const fetchInstalaciones = async () => {
      try {
        setLoading(true);
        const page = Number(searchParams.get("page")) || 1;
        const search = searchParams.get("search") || "";

        const response = await getInstalaciones();

        if (response && response.data) {
          setInstalaciones(response.data);
          setTotalItems(response.totalItems || 0);
          setCurrentPage(response.currentPage || 1);
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching instalaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstalaciones();
  }, [searchParams]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada";
    return format(new Date(dateString), "dd MMM yyyy", { locale: es });
  };

  // Format time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "HH:mm", { locale: es });
  };

  // Get status badge style
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Filter installations based on the active tab
  const filteredInstalaciones = instalaciones.filter(
    (instalacion) =>
      activeTab === "todos" ||
      instalacion.estado.toUpperCase() === activeTab.toUpperCase()
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <h1 className="text-2xl font-bold">Listado de Instalaciones</h1>
        <p className="text-gray-500">
          Consulta y gestiona los servicios de instalación de baños químicos.
        </p>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Instalaciones</CardTitle>
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0 pt-2">
              <Input
                placeholder="Buscar por cliente, ubicación..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm w-full"
              />
              <Button onClick={() => handleSearch(searchTerm)}>Buscar</Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/admin/dashboard/servicios/instalacion/crear")
                }
              >
                Crear Instalación
              </Button>
            </div>

            <div className="mt-4">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                  <TabsTrigger value="todos" className="flex items-center">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="programado" className="flex items-center">
                    Programados
                  </TabsTrigger>
                  <TabsTrigger
                    value="en_progreso"
                    className="flex items-center"
                  >
                    En Progreso
                  </TabsTrigger>
                  <TabsTrigger value="completado" className="flex items-center">
                    Completados
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                Cargando instalaciones...
              </div>
            ) : filteredInstalaciones.length === 0 ? (
              <div className="flex justify-center p-4">
                No hay instalaciones disponibles
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha Programada</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Recursos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstalaciones.map((instalacion) => (
                      <TableRow key={instalacion.id}>
                        <TableCell className="font-medium">
                          {instalacion.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span>
                              {instalacion.cliente?.nombre ||
                                "Cliente no especificado"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {formatDate(instalacion.fechaProgramada)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeStyle(instalacion.estado)}
                          >
                            {instalacion.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate max-w-[180px]">
                              {instalacion.ubicacion}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{instalacion.cantidadBanos} baños</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstalacion(instalacion);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              Ver
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedInstalacion(instalacion);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalItems > 10 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="text-sm">
                      Página {currentPage} de {Math.ceil(totalItems / 10)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(totalItems / 10)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      {selectedInstalacion && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Instalación</DialogTitle>
              <DialogDescription>
                ID: {selectedInstalacion.id} | Creado:{" "}
                {formatDate(selectedInstalacion.fechaCreacion)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Cliente
                  </h3>
                  <p className="text-lg font-semibold">
                    {selectedInstalacion.cliente?.nombre || "No especificado"}
                  </p>
                  {selectedInstalacion.cliente && (
                    <div className="mt-1 text-sm">
                      <p className="flex items-center gap-1">
                        <span>CUIT:</span>
                        <span className="text-muted-foreground">
                          {selectedInstalacion.cliente.cuit}
                        </span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span>Contacto:</span>
                        <span className="text-muted-foreground">
                          {selectedInstalacion.cliente.contacto_principal}
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
                        Programada:{" "}
                        {formatDate(selectedInstalacion.fechaProgramada)}{" "}
                        {formatTime(selectedInstalacion.fechaProgramada)}
                      </span>
                    </p>
                    {selectedInstalacion.fechaInicio && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-green-500" />
                        <span>
                          Inicio: {formatDate(selectedInstalacion.fechaInicio)}
                        </span>
                      </p>
                    )}
                    {selectedInstalacion.fechaFin && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-red-500" />
                        <span>
                          Fin: {formatDate(selectedInstalacion.fechaFin)}
                        </span>
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
                    <span>{selectedInstalacion.ubicacion}</span>
                  </p>
                </div>

                {selectedInstalacion.notas && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Notas
                    </h3>
                    <p className="mt-1 text-sm border rounded-md p-3 bg-muted/30">
                      {selectedInstalacion.notas}
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
                      <span>Baños: {selectedInstalacion.cantidadBanos}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>
                        Empleados: {selectedInstalacion.cantidadEmpleados}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-500" />
                      <span>
                        Vehículos: {selectedInstalacion.cantidadVehiculos}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Estado
                  </h3>
                  <div className="mt-1">
                    <Badge
                      className={getStatusBadgeStyle(
                        selectedInstalacion.estado
                      )}
                    >
                      {selectedInstalacion.estado}
                    </Badge>
                    <p className="mt-1 text-sm">
                      Asignación:{" "}
                      {selectedInstalacion.asignacionAutomatica
                        ? "Automática"
                        : "Manual"}
                    </p>
                  </div>
                </div>

                {selectedInstalacion.asignaciones &&
                  selectedInstalacion.asignaciones.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Asignaciones
                      </h3>
                      <div className="mt-2 space-y-3">
                        {/* Empleados asignados */}
                        {selectedInstalacion.asignaciones
                          .filter((asig) => asig.empleado)
                          .map((asig) => (
                            <div
                              key={`emp-${asig.id}`}
                              className="flex items-center gap-2 p-2 rounded-md bg-slate-50"
                            >
                              <User className="h-4 w-4 text-blue-500" />
                              <span>
                                {asig.empleado?.nombre}{" "}
                                {asig.empleado?.apellido}
                              </span>
                            </div>
                          ))}

                        {/* Vehículos asignados */}
                        {selectedInstalacion.asignaciones
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

                        {/* Baños asignados */}
                        {selectedInstalacion.asignaciones
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
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedInstalacion && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar esta instalación? Esta
                acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-orange-800 text-sm">
              <p>
                Cliente:{" "}
                {selectedInstalacion.cliente?.nombre || "No especificado"}
              </p>
              <p>Fecha: {formatDate(selectedInstalacion.fechaProgramada)}</p>
              <p>Estado: {selectedInstalacion.estado}</p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteService(selectedInstalacion.id)
                    .then(() => {
                      toast.success("Instalación eliminada", {
                        description:
                          "La instalación ha sido eliminada correctamente",
                      });
                      setIsDeleteDialogOpen(false);
                      // Refresh the list
                    })
                    .catch((error) => {
                      console.error("Error deleting installation:", error);
                      toast.error("Error al eliminar la instalación", {
                        description:
                          "No se pudo eliminar la instalación. Intenta nuevamente.",
                      });
                    });

                  // Refresh the list
                }}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
