"use client";

import {
  getLicenciasConducir,
  getLicenciasToExpire,
  LicenciaConducir,
} from "@/app/actions/LicenciasConducir";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "../ui/local/Loader";
import { ListadoTabla } from "../ui/local/ListadoTabla";
import { TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Car,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  cargo: string;
}

export interface LicenciaConducirWithEmpleado extends LicenciaConducir {
  licencia_id: number;
  categoria: string;
  fecha_expedicion: Date;
  fecha_vencimiento: Date;
  empleado: Empleado;
}

export default function ListadoLicenciasConducirComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: LicenciaConducirWithEmpleado[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [licencias, setLicencias] = useState<LicenciaConducirWithEmpleado[]>(
    data || []
  );
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(totalItems || 0);
  const [page, setPage] = useState(currentPage || 1);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchLicencias = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      let fetchedLicencias;
      if (activeTab === "por-vencer") {
        fetchedLicencias = await getLicenciasToExpire(
          60,
          currentPage,
          itemsPerPage
        );
      } else {
        fetchedLicencias = await getLicenciasConducir(
          currentPage,
          itemsPerPage
        );
      }

      if (fetchedLicencias.data && Array.isArray(fetchedLicencias.data)) {
        setLicencias(fetchedLicencias.data);
        setTotal(fetchedLicencias.totalItems);
        setPage(fetchedLicencias.currentPage);
      } else {
        console.error("Formato de respuesta no reconocido:", fetchedLicencias);
      }
    } catch (error) {
      console.error("Error al cargar las licencias de conducir:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las licencias de conducir.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage, activeTab]);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchLicencias();
    }
  }, [fetchLicencias, isFirstLoad]);

  const getStatusInfo = (fechaVencimiento: Date) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diasRestantes = differenceInDays(vencimiento, hoy);

    if (diasRestantes < 0) {
      return {
        text: "Vencida",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        variant: "destructive" as const,
        color: "text-red-600",
      };
    } else if (diasRestantes < 30) {
      return {
        text: "Por vencer",
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        variant: "outline" as const,
        color: "text-amber-600",
      };
    } else if (diasRestantes < 60) {
      return {
        text: "Advertencia",
        icon: <Clock className="h-4 w-4 text-amber-500" />,
        variant: "outline" as const,
        color: "text-amber-600",
      };
    } else {
      return {
        text: "Vigente",
        icon: <ShieldCheck className="h-4 w-4 text-green-500" />,
        variant: "default" as const,
        color: "text-green-600",
      };
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const getCategoriaLabel = (categoria: string) => {
    const categorias: Record<string, string> = {
      A1: "A1 - Ciclomotores, motocicletas hasta 150cc",
      A2: "A2 - Motocicletas hasta 300cc",
      A3: "A3 - Motocicletas de más de 300cc",
      B1: "B1 - Automóviles, camionetas hasta 3500kg",
      B2: "B2 - Automóviles con acoplado",
      C: "C - Camiones sin acoplado",
      D1: "D1 - Transporte de pasajeros hasta 8 plazas",
      D2: "D2 - Transporte de pasajeros más de 8 plazas",
      E1: "E1 - Camiones con acoplado",
      E2: "E2 - Maquinaria especial no agrícola",
      F: "F - Vehículos para personas con discapacidad",
      G: "G - Tractores agrícolas",
    };

    return categorias[categoria] || categoria;
  };

  const filteredLicencias =
    activeTab === "todos"
      ? licencias
      : licencias.filter((licencia) => {
          const diasRestantes = differenceInDays(
            new Date(licencia.fecha_vencimiento),
            new Date()
          );
          return diasRestantes < 60 && diasRestantes > -30; // Mostrar licencias por vencer o recién vencidas
        });

  if (loading && licencias.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Licencias de Conducir
          </h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de las licencias de conducir de los empleados
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <Card className="w-full shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                <div className="flex items-center">
                  <Car className="mr-2 h-6 w-6" />
                  Licencias de Conducir
                </div>
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Listado completo de licencias de conducir registradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="todos">Todas</TabsTrigger>
              <TabsTrigger value="por-vencer">Por vencer</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border">
            <ListadoTabla
              title=""
              data={filteredLicencias}
              itemsPerPage={itemsPerPage}
              searchableKeys={[
                "empleado.nombre",
                "empleado.apellido",
                "empleado.documento",
                "categoria",
              ]}
              remotePagination
              totalItems={total}
              currentPage={page}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              columns={[
                { title: "Empleado", key: "empleado" },
                { title: "Categoría", key: "categoria" },
                { title: "Fechas", key: "fechas" },
                { title: "Estado", key: "estado" },
              ]}
              renderRow={(licencia) => (
                <>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {licencia.empleado?.nombre}{" "}
                          {licencia.empleado?.apellido}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {licencia.empleado?.documento}
                        </div>
                        {licencia.empleado?.cargo && (
                          <div className="text-xs text-muted-foreground">
                            {licencia.empleado?.cargo}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm font-medium">
                        <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {getCategoriaLabel(licencia.categoria)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[180px]">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>
                          Expedición: {formatDate(licencia.fecha_expedicion)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>
                          Vencimiento: {formatDate(licencia.fecha_vencimiento)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {licencia.fecha_vencimiento && (
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            getStatusInfo(new Date(licencia.fecha_vencimiento))
                              .variant
                          }
                        >
                          <div className="flex items-center gap-1">
                            {
                              getStatusInfo(
                                new Date(licencia.fecha_vencimiento)
                              ).icon
                            }
                            {
                              getStatusInfo(
                                new Date(licencia.fecha_vencimiento)
                              ).text
                            }
                          </div>
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {differenceInDays(
                            new Date(licencia.fecha_vencimiento),
                            new Date()
                          ) < 0
                            ? `Vencida hace ${Math.abs(
                                differenceInDays(
                                  new Date(licencia.fecha_vencimiento),
                                  new Date()
                                )
                              )} días`
                            : `Vence en ${differenceInDays(
                                new Date(licencia.fecha_vencimiento),
                                new Date()
                              )} días`}
                        </div>
                      </div>
                    )}
                  </TableCell>
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
