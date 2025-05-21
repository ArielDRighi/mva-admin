"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { TableCell } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import Loader from "../ui/local/Loader";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServices } from "@/app/actions/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  CalendarCheck,
  CalendarX,
  Search,
  RefreshCcw,
  FileText,
  Calendar,
  MapPin,
  ClipboardList,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListadoServiciosHistorialComponent({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: any[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [services, setServices] = useState<any[]>(data);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");

  const serviceDetailsSchema = z.object({
    id: z.string().optional(),
    cliente: z.string().optional(),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    ubicacion: z.string().optional(),
    estado: z.string().optional(),
    tipoServicio: z.string().optional(),
    notas: z.string().optional(),
  });

  const form = useForm<z.infer<typeof serviceDetailsSchema>>({
    resolver: zodResolver(serviceDetailsSchema),
    defaultValues: {
      cliente: "",
      fechaInicio: "",
      fechaFin: "",
      ubicacion: "",
      estado: "",
      tipoServicio: "",
      notas: "",
    },
  });

  const { handleSubmit, setValue, control } = form;

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

  const handleViewDetails = (service: any) => {
    setSelectedService(service);

    setValue("id", service.id?.toString() || "");
    setValue("cliente", service.cliente?.nombre || "");
    setValue("fechaInicio", service.fechaInicio || "");
    setValue("fechaFin", service.fechaFin || "");
    setValue("ubicacion", service.ubicacion || "");
    setValue("estado", service.estado || "");
    setValue("tipoServicio", service.tipoServicio || "");
    setValue("notas", service.notas || "");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const fetchServices = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      const fetchedServices = await getServices();

      setServices(fetchedServices.data || []);
      setTotal(fetchedServices.totalItems || 0);
      setPage(fetchedServices.currentPage || 1);
    } catch (error) {
      console.error("Error al cargar el historial de servicios:", error);
      toast.error("Error", {
        description: "No se pudo cargar el historial de servicios.",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage]);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchServices();
    }
  }, [fetchServices, isFirstLoad]);

  // Filtrar servicios según la pestaña activa
  const filteredServices =
    activeTab === "todos"
      ? services
      : services.filter(
          (service) => service.estado === activeTab.toUpperCase()
        );

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Historial de Servicios
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Consulta el registro histórico de servicios completados y
              cancelados
            </CardDescription>
          </div>
          <Button
            onClick={fetchServices}
            className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-4 w-[500px]">
              <TabsTrigger value="todos" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="completado" className="flex items-center">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Completados
              </TabsTrigger>
              <TabsTrigger value="cancelado" className="flex items-center">
                <CalendarX className="mr-2 h-4 w-4" />
                Cancelados
              </TabsTrigger>
              <TabsTrigger value="programado" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Programados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="rounded-md border">
          <ListadoTabla
            title=""
            data={filteredServices}
            itemsPerPage={itemsPerPage}
            searchableKeys={["cliente.nombre", "tipoServicio", "ubicacion"]}
            remotePagination
            totalItems={total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            columns={[
              { title: "ID", key: "id" },
              { title: "Cliente", key: "cliente.nombre" },
              { title: "Tipo de Servicio", key: "tipoServicio" },
              { title: "Fecha Inicio", key: "fechaInicio" },
              { title: "Fecha Fin", key: "fechaFin" },
              { title: "Ubicación", key: "ubicacion" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(service) => (
              <>
                <TableCell className="font-medium">{service.id}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Building className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>{service.cliente?.nombre || "Sin cliente"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <ClipboardList className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{service.tipoServicio}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>
                      {service.fechaInicio &&
                        new Date(service.fechaInicio).toLocaleDateString(
                          "es-AR"
                        )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>
                      {service.fechaFin &&
                        new Date(service.fechaFin).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">
                      {service.ubicacion}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      service.estado === "COMPLETADO"
                        ? "default"
                        : service.estado === "CANCELADO"
                        ? "destructive"
                        : service.estado === "PROGRAMADO"
                        ? "outline"
                        : "secondary"
                    }
                    className={
                      service.estado === "COMPLETADO"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : service.estado === "CANCELADO"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : service.estado === "PROGRAMADO"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {service.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(service)}
                    className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Detalles
                  </Button>
                </TableCell>
              </>
            )}
          />
        </div>
      </CardContent>

      <FormDialog
        open={!!selectedService}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedService(null);
          }
        }}
        title="Detalles del Servicio"
        description="Ver información detallada del servicio."
        onSubmit={handleSubmit(() => setSelectedService(null))}
        submitButtonText="Cerrar"
      >
        <>
          <Controller
            name="cliente"
            control={control}
            render={({ field }) => (
              <FormField
                label="Cliente"
                name="cliente"
                value={field.value || ""}
                onChange={field.onChange}
                disabled={true}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="fechaInicio"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Fecha de Inicio"
                  name="fechaInicio"
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={true}
                  type="date"
                />
              )}
            />

            <Controller
              name="fechaFin"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Fecha de Finalización"
                  name="fechaFin"
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={true}
                  type="date"
                />
              )}
            />
          </div>

          <Controller
            name="ubicacion"
            control={control}
            render={({ field }) => (
              <FormField
                label="Ubicación"
                name="ubicacion"
                value={field.value || ""}
                onChange={field.onChange}
                disabled={true}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="tipoServicio"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Tipo de Servicio"
                  name="tipoServicio"
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={true}
                />
              )}
            />

            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Estado"
                  name="estado"
                  fieldType="select"
                  value={field.value || ""}
                  onChange={field.onChange}
                  disabled={true}
                  options={[
                    { label: "COMPLETADO", value: "COMPLETADO" },
                    { label: "CANCELADO", value: "CANCELADO" },
                    { label: "PROGRAMADO", value: "PROGRAMADO" },
                    { label: "EN_PROCESO", value: "EN_PROCESO" },
                  ]}
                />
              )}
            />
          </div>

          <Controller
            name="notas"
            control={control}
            render={({ field }) => (
              <FormField
                label="Notas"
                name="notas"
                value={field.value || ""}
                onChange={field.onChange}
                disabled={true}
              />
            )}
          />
        </>
      </FormDialog>
    </Card>
  );
}
