"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Loader from "../ui/local/Loader";
import {
  Calendar,
  FileText,
  Info,
  UserRound,
  CheckCircle,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { getLicenciasByUserId } from "@/app/actions/LicenciasEmpleados";
import { getCookie } from "cookies-next";
import { getUserById } from "@/app/actions/users";
import { User } from "./DashboardComponent";

export default function EmpleadosLicenciasComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [licencias, setLicencias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedLicencia, setSelectedLicencia] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [empleadoId, setEmpleadoId] = useState(0);
  console.log("licencias", licencias);

  useEffect(() => {
    const userCookie = getCookie("user");

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie as string);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error al parsear la cookie de usuario:", e);
      }
    }
  }, []);

  // Obtener ID del empleado
  useEffect(() => {
    const obtenerEmpleado = async () => {
      try {
        const userId = user?.id || 0;
        if (userId === 0) return;

        setLoading(true);
        const datosEmpleado = await getUserById(userId);
        setEmpleadoId(datosEmpleado.empleadoId);
      } catch (error) {
        console.error("Error al obtener datos del empleado:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerEmpleado();
  }, [user?.id]);

  const fetchLicencias = useCallback(async () => {
    if (!empleadoId) return;

    const currentPage = Number(searchParams.get("page")) || 1;
    setLoading(true);

    try {
      const fetchedLicencias = await getLicenciasByUserId(empleadoId);

      if (Array.isArray(fetchedLicencias)) {
        setLicencias(fetchedLicencias);
        setTotal(fetchedLicencias.length);
      } else if (
        fetchedLicencias.data &&
        Array.isArray(fetchedLicencias.data)
      ) {
        setLicencias(fetchedLicencias.data);
        setTotal(fetchedLicencias.totalItems || fetchedLicencias.data.length);
      } else if (
        fetchedLicencias.items &&
        Array.isArray(fetchedLicencias.items)
      ) {
        setLicencias(fetchedLicencias.items);
        setTotal(fetchedLicencias.total || fetchedLicencias.items.length);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedLicencias);
      }
    } catch (error) {
      console.error("Error al cargar las licencias:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las licencias.",
      });
    } finally {
      setLoading(false);
    }
  }, [empleadoId, searchParams]);

  useEffect(() => {
    fetchLicencias();
  }, [fetchLicencias]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`?${params.toString()}`);
  };

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", search);
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleViewDetails = (licencia: any) => {
    setSelectedLicencia(licencia);
    setIsDetailsOpen(true);
  };

  const getApprovalStatus = (licencia: any) => {
    // Check for direct status field first
    if (licencia.status) {
      if (licencia.status === "APROBADO") return "APPROVED";
      if (licencia.status === "RECHAZADO") return "REJECTED";
      if (licencia.status === "PENDIENTE") return "PENDING";
    }

    // Fall back to the old aprobado boolean field if status isn't present
    if (licencia.aprobado === true) return "APPROVED";
    if (licencia.aprobado === false) return "PENDING";
    return "PENDING";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "PENDING":
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading && licencias.length === 0) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
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
          <Button
            variant="outline"
            className="bg-white hover:bg-white/90 text-blue-700"
            onClick={() => (window.location.href = "/empleado/dashboard")}
          >
            Volver
          </Button>
        </div>
      </div>
      <Card className="w-full shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                Historial de Licencias
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Consulta el historial completo de tus licencias y permisos
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="rounded-md border">
            <ListadoTabla
              title=""
              data={licencias}
              itemsPerPage={10}
              searchableKeys={[
                "tipoLicencia",
                "notas",
                "fechaInicio",
                "fechaFin",
              ]}
              remotePagination
              totalItems={total}
              currentPage={page}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              columns={[
                { title: "Tipo", key: "tipoLicencia" },
                { title: "Período", key: "fechas" },
                { title: "Estado", key: "status" },
                { title: "Detalles", key: "acciones" },
              ]}
              renderRow={(licencia) => (
                <>
                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-medium">
                        <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {licencia.tipoLicencia || licencia.type}
                      </div>
                      {licencia.notas && (
                        <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {licencia.notas}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[200px]">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>
                          Desde:{" "}
                          {formatDate(
                            licencia.fechaInicio || licencia.start_date
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>
                          Hasta:{" "}
                          {formatDate(licencia.fechaFin || licencia.end_date)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={getStatusBadgeVariant(
                        getApprovalStatus(licencia)
                      )}
                    >
                      {getApprovalStatus(licencia) === "APPROVED"
                        ? "Aprobada"
                        : getApprovalStatus(licencia) === "REJECTED"
                        ? "Rechazada"
                        : "Pendiente"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(licencia)}
                      className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Info className="h-3.5 w-3.5 mr-1" />
                      Ver detalles
                    </Button>
                  </TableCell>
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Licencia</DialogTitle>
            <DialogDescription>
              Información detallada sobre la solicitud de licencia
            </DialogDescription>
          </DialogHeader>

          {selectedLicencia && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Tipo
                  </h4>
                  <p className="text-sm font-medium mt-1">
                    {selectedLicencia.tipoLicencia || selectedLicencia.type}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Estado
                  </h4>
                  <Badge
                    className={getStatusBadgeVariant(
                      getApprovalStatus(selectedLicencia)
                    )}
                  >
                    {getApprovalStatus(selectedLicencia) === "APPROVED"
                      ? "Aprobada"
                      : getApprovalStatus(selectedLicencia) === "REJECTED"
                      ? "Rechazada"
                      : "Pendiente"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Período
                </h4>
                <div className="flex flex-col space-y-1 mt-1">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Desde:{" "}
                      {formatDate(
                        selectedLicencia.fechaInicio ||
                          selectedLicencia.start_date
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Hasta:{" "}
                      {formatDate(
                        selectedLicencia.fechaFin || selectedLicencia.end_date
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedLicencia.notas && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Notas / Motivo
                  </h4>
                  <p className="text-sm border rounded-md p-3 bg-muted/30 mt-1">
                    {selectedLicencia.notas}
                  </p>
                </div>
              )}

              {getApprovalStatus(selectedLicencia) === "PENDING" && (
                <div className="pt-2">
                  <div className="flex items-center text-sm text-amber-600 mb-2">
                    <PauseCircle className="h-4 w-4 mr-2" />
                    <span>Esta solicitud está pendiente de aprobación</span>
                  </div>
                </div>
              )}

              {getApprovalStatus(selectedLicencia) === "APPROVED" && (
                <div className="pt-2">
                  <div className="flex items-center text-sm text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Esta solicitud ha sido aprobada</span>
                  </div>
                </div>
              )}

              {getApprovalStatus(selectedLicencia) === "REJECTED" && (
                <div className="pt-2">
                  <div className="flex items-center text-sm text-red-600 mb-2">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span>Esta solicitud ha sido rechazada</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
