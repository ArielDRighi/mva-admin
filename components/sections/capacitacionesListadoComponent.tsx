"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarClock,
  MapPin,
  User,
  Clock,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getCapacitaciones, deleteService } from "@/app/actions/services";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  estado: string;
}

interface Asignacion {
  id: number;
  empleadoId: number;
  empleado: Empleado;
  fechaAsignacion: string;
}

interface Capacitacion {
  id: number;
  fechaProgramada: string;
  estado: string;
  ubicacion: string;
  fechaCreacion: string;
  asignaciones: Asignacion[];
}

interface CapacitacionesResponse {
  data: Capacitacion[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export function CapacitacionesListadoComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCapacitacion, setSelectedCapacitacion] =
    useState<Capacitacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [capacitacionToDelete, setCapacitacionToDelete] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchCapacitaciones = async () => {
      setLoading(true);
      try {
        const pageParam = searchParams.get("page") || "1";
        const searchParam = searchParams.get("search") || "";

        setPage(parseInt(pageParam));
        setSearch(searchParam);

        const response = await getCapacitaciones({
          page: parseInt(pageParam),
          limit: 10, // You can adjust the limit as needed
          search: searchParam,
        });

        if (response) {
          setCapacitaciones(response.data);
          setTotalItems(response.totalItems);
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Error al cargar capacitaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacitaciones();
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", search);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROGRAMADO":
        return <Badge className="bg-blue-500">Programado</Badge>;
      case "COMPLETADO":
        return <Badge className="bg-green-500">Completado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case "EN_PROGRESO":
        return <Badge className="bg-yellow-500">En Progreso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getEmployeesList = (asignaciones: Asignacion[]) => {
    return asignaciones
      .map(
        (asignacion) =>
          `${asignacion.empleado.nombre} ${asignacion.empleado.apellido}`
      )
      .join(", ");
  };

  const handleOpenModal = (capacitacion: Capacitacion) => {
    setSelectedCapacitacion(capacitacion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCapacitacion(null);
  };

  const handleDeleteCapacitacion = (id: number) => {
    setCapacitacionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!capacitacionToDelete) return;

    try {
      await deleteService(capacitacionToDelete);
      toast.success("Capacitación eliminada", {
        description: "La capacitación ha sido eliminada correctamente.",
      });

      // Refresh the list after deletion
      const response = await getCapacitaciones();
      if (response) {
        setCapacitaciones(response.data);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error al eliminar la capacitación:", error);
      toast.error("Error", {
        description: "No se pudo eliminar la capacitación.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCapacitacionToDelete(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <h1 className="text-2xl font-bold">Listado de Capacitaciones</h1>
        <p className="text-gray-500">
          Administra las capacitaciones programadas para los empleados.
        </p>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Capacitaciones</CardTitle>
            <div className="flex items-center space-x-2 pt-2">
              <Input
                placeholder="Buscar por ubicación o empleado..."
                value={search}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              <Button onClick={handleSearch}>Buscar</Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/admin/dashboard/servicios/capacitaciones/crear")
                }
              >
                Crear Capacitación
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">
                Cargando capacitaciones...
              </div>
            ) : capacitaciones.length === 0 ? (
              <div className="flex justify-center p-4">
                No hay capacitaciones disponibles
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha Programada</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Empleados</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capacitaciones.map((capacitacion) => (
                      <TableRow key={capacitacion.id}>
                        <TableCell className="font-medium">
                          {capacitacion.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(capacitacion.fechaProgramada)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(capacitacion.estado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {capacitacion.ubicacion}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(capacitacion.fechaCreacion)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            {getEmployeesList(capacitacion.asignaciones)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(capacitacion)}
                            >
                              Ver
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteCapacitacion(capacitacion.id)
                              }
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <div className="text-sm">
                      Página {page} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedCapacitacion && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Detalle de Capacitación #{selectedCapacitacion.id}
              </DialogTitle>
              <DialogDescription>
                Información detallada sobre la capacitación.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Fecha Programada
                  </h3>
                  <p className="flex items-center mt-1">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(selectedCapacitacion.fechaProgramada)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Estado
                  </h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedCapacitacion.estado)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Ubicación
                </h3>
                <p className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedCapacitacion.ubicacion}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Fecha de Creación
                </h3>
                <p className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(selectedCapacitacion.fechaCreacion)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Empleados Asignados
                </h3>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedCapacitacion.asignaciones.map((asignacion) => (
                    <div
                      key={asignacion.id}
                      className="flex items-center p-2 border rounded-md"
                    >
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {asignacion.empleado.nombre}{" "}
                        {asignacion.empleado.apellido}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCloseModal();
                    handleDeleteCapacitacion(selectedCapacitacion.id);
                  }}
                  className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
              <Button onClick={handleCloseModal}>
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar esta capacitación? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center p-4 border rounded-md bg-red-50">
              <div className="mr-4 p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">
                  La capacitación será eliminada permanentemente
                </p>
                <p className="text-sm text-muted-foreground">
                  Todos los datos asociados a esta capacitación se perderán.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
