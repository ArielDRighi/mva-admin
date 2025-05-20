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

    // Update form schema and fields to match the actual data structure
    setValue("id", service.id?.toString() || "");
    setValue("cliente", service.cliente?.nombre || "");
    setValue("fechaInicio", service.fechaInicio || "");
    setValue("fechaFin", service.fechaFin || "");
    setValue("ubicacion", service.ubicacion || "");
    setValue("estado", service.estado || "");
    setValue("tipoServicio", service.tipoServicio || "");
    setValue("notas", service.notas || "");
  };

  const fetchServices = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    try {
      // Properly call the getServices function with parameters
      const fetchedServices = await getServices(
        currentPage,
        itemsPerPage,
        search
      );

      // Set states only once with the correct data
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

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <ListadoTabla
        title="Historial de Servicios"
        data={services}
        itemsPerPage={itemsPerPage}
        searchableKeys={["cliente", "descripcion", "estado"]}
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
        ]}
        renderRow={(service) => (
          <>
            <TableCell className="font-medium">{service.id}</TableCell>
            <TableCell>{service.cliente?.nombre || "Sin cliente"}</TableCell>
            <TableCell>{service.tipoServicio}</TableCell>
            <TableCell>
              {service.fechaInicio &&
                new Date(service.fechaInicio).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>
              {service.fechaFin &&
                new Date(service.fechaFin).toLocaleDateString("es-AR")}
            </TableCell>
            <TableCell>{service.ubicacion}</TableCell>
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
              >
                {service.estado}
              </Badge>
            </TableCell>
          </>
        )}
      />

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
    </>
  );
}
