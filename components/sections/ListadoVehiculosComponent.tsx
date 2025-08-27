"use client";

import {
  createVehicle,
  deleteVehicle,
  editVehicle,
  getVehicles,
} from "@/app/actions/vehiculos";
import { UpdateVehiculo, Vehiculo } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { processErrorForToast } from "@/lib/errorUtils";
import { z } from "zod";
import Loader from "../ui/local/Loader";
import { ListadoTabla } from "../ui/local/ListadoTabla";
import { TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FormDialog } from "../ui/local/FormDialog";
import { FormField } from "../ui/local/FormField";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  PauseCircle,
  BadgeInfo,
  Calendar,
  Tag,
  Info,
  X, // Agregar este icono
} from "lucide-react";
import { useMaintenanceVehicleStore } from "@/store/maintenanceVehicleStore";

interface VehicleResponse {
  data: Vehiculo[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

const ListadoVehiculosComponent = ({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
}: {
  data: Vehiculo[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeData = Array.isArray(data) ? data : [];

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(safeData);
  const [total, setTotal] = useState<number>(totalItems);
  const [page, setPage] = useState<number>(currentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );

  const vehiculoSchema = z.object({
    numeroInterno: z.string().nullable(),
    placa: z.string().min(1, "La placa es obligatoria"),
    marca: z.string().min(1, "La marca es obligatoria"),
    modelo: z.string().min(1, "El modelo es obligatorio"),
    anio: z.coerce
      .number()
      .min(1900, "El año debe ser mayor a 1900")
      .max(new Date().getFullYear() + 1, "El año no puede ser futuro"),
    tipoCabina: z.string().min(1, "El tipo de cabina es obligatorio"),
    fechaVencimientoVTV: z.string().nullable(),
    fechaVencimientoSeguro: z.string().nullable(),
    esExterno: z.boolean(),
    estado: z.enum(["DISPONIBLE", "ASIGNADO", "INACTIVO", "BAJA"], {
      errorMap: () => ({
        message: "El estado es obligatorio y debe ser válido",
      }),
    }),
  });

  const form = useForm<z.infer<typeof vehiculoSchema>>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      numeroInterno: null,
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      tipoCabina: "simple",
      fechaVencimientoVTV: null,
      fechaVencimientoSeguro: null,
      esExterno: false,
      estado: "DISPONIBLE",
    },
  });

  const { handleSubmit, setValue, control, reset } = form;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`?${params.toString()}`);
  };

  const handleSearchChange = (search: string) => {
    // Solo actualizar el estado local, no la URL
    // La URL se actualizará cuando el debounce del ListadoTabla termine
    setSearchTerm(search);

    // Actualizar URL cuando llegue la llamada desde ListadoTabla (ya con debounce)
    const params = new URLSearchParams(searchParams.toString());

    if (!search || search.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", search);
    }

    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const handleEditClick = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setIsCreating(false);

    const camposFormulario = [
      "numeroInterno",
      "placa",
      "marca",
      "modelo",
      "anio",
      "tipoCabina",
      "fechaVencimientoVTV",
      "fechaVencimientoSeguro",
      "esExterno",
      "estado",
    ] as const;

    camposFormulario.forEach((key) => {
      if (key in vehiculo) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(key as any, vehiculo[key as keyof typeof vehiculo]);
      }
    });
  };
  const handleCreateClick = () => {
    reset({
      numeroInterno: null,
      placa: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      tipoCabina: "simple",
      fechaVencimientoVTV: null,
      fechaVencimientoSeguro: null,
      esExterno: false,
      estado: "DISPONIBLE",
    });
    setSelectedVehiculo(null);
    setIsCreating(true);
  };

  const handleDeleteClick = (id: number) => {
    setVehiculoToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehiculoToDelete) return;

    try {
      await deleteVehicle(vehiculoToDelete);
      toast.success("Vehículo eliminado", {
        description: "El vehículo se ha eliminado correctamente.",
      });
      await fetchVehiculos();
    } catch (error) {
      const errorConfig = processErrorForToast(error, 'eliminar vehículo');
      
      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: errorConfig.duration,
      });
    } finally {
      setConfirmDialogOpen(false);
      setVehiculoToDelete(null);
    }
  };

  const handleChangeStatus = async (id: number, estado: string) => {
    try {
      await editVehicle(id.toString(), { estado } as UpdateVehiculo);
      toast.success("Estado actualizado", {
        description: `El vehículo ahora está ${estado}.`,
      });
      await fetchVehiculos();
    } catch (error) {
      const errorConfig = processErrorForToast(error, 'cambiar estado de vehículo');
      
      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: errorConfig.duration,
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof vehiculoSchema>) => {
    try {
      if (selectedVehiculo && selectedVehiculo.id) {
        // Guardar la respuesta del servidor para verificar si hubo éxito
        const statusCode = await editVehicle(
          selectedVehiculo.id.toString(),
          data
        );
        // Solo mostrar toast de éxito si se completó correctamente
        if (statusCode >= 200 && statusCode < 300) {
          toast.success("Vehículo actualizado", {
            description: "Los cambios se han guardado correctamente.",
          });
        }
      } else {
        await createVehicle(data);
        toast.success("Vehículo creado", {
          description: "El vehículo se ha agregado correctamente.",
        });
      }

      await fetchVehiculos();
      setIsCreating(false);
      setSelectedVehiculo(null);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);

      // Extraer el mensaje de error
      let errorMessage = "Ocurrió un problema al procesar la solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Mostrar el toast con el mensaje específico del error
      toast.error("Error", {
        description: errorMessage,
        duration: 5000, // Duración aumentada para que sea más visible
      });
    }
  };

  const fetchVehiculos = useCallback(async () => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    setLoading(true);

    console.log(
      `Buscando vehículos con término: "${search}" en página ${currentPage}, filtro activo: ${activeTab}`
    );

    try {
      // Make sure itemsPerPage is always a number with a fallback value
      const perPage = itemsPerPage || 15;

      // Si estamos en un filtro específico, traemos todos los datos de ese estado
      const shouldLoadAll = activeTab !== "todos";
      const fetchedVehiculos = (await getVehicles(
        shouldLoadAll ? 1 : currentPage,
        shouldLoadAll ? 999999 : perPage, // Número grande para traer todos
        search
      )) as VehicleResponse;

      setVehiculos(fetchedVehiculos.data);
      setTotal(fetchedVehiculos.totalItems);
      setPage(fetchedVehiculos.currentPage);
    } catch (error) {
      console.error("Error al cargar los vehículos:", error);

      // Extraer el mensaje de error
      let errorMessage = "Error al cargar los vehículos.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, itemsPerPage, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Siempre resetear a página 1 cuando cambiamos de filtro
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
  };

  const filteredVehiculos =
    activeTab === "todos"
      ? vehiculos
      : vehiculos.filter((veh) => veh.estado === activeTab.toUpperCase());

  // Determinar si usar paginación remota o local
  const useRemotePagination = activeTab === "todos";
  const effectiveTotalItems = useRemotePagination ? total : filteredVehiculos.length;
  const effectiveCurrentPage = useRemotePagination ? page : Number(searchParams.get("page")) || 1;

  // Manejador de página que funciona tanto para paginación remota como local
  const handlePageChangeUnified = (page: number) => {
    if (useRemotePagination) {
      handlePageChange(page);
    } else {
      // Para paginación local, solo actualizamos la URL para mantener consistencia
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.replace(`?${params.toString()}`);
    }
  };

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      fetchVehiculos();
    }
  }, [fetchVehiculos, isFirstLoad, activeTab]);

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">
              Gestión de Vehículos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm md:text-base">
              Administra la información de los vehículos de la empresa
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateClick}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 mt-3 md:mt-0"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Vehículo</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Agregar esta sección de información de estados */}
        <div className="mt-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 w-full">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm md:text-base">
                Estados de Vehículos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    DISPONIBLE
                  </Badge>
                  <span className="text-blue-800 dark:text-blue-200 text-xs md:text-sm">
                    Disponible para comenzar un servicio
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                    ASIGNADO
                  </Badge>
                  <span className="text-blue-800 dark:text-blue-200 text-xs md:text-sm">
                    Reservado para un servicio específico
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs">
                    INACTIVO
                  </Badge>
                  <span className="text-blue-800 dark:text-blue-200 text-xs md:text-sm">
                    No está activo para servicios
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                    BAJA
                  </Badge>
                  <span className="text-blue-800 dark:text-blue-200 text-xs md:text-sm">
                    Ya no pertenece a la compañía
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Tabs
            defaultValue="todos"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full h-auto p-1 bg-gray-100 rounded-lg">
              <TabsTrigger 
                value="todos" 
                className="flex items-center text-xs py-1.5 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Truck className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Todos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="disponible" 
                className="flex items-center text-xs py-1.5 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <CheckCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Disponibles</span>
                <span className="sm:hidden">Disp.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="asignado" 
                className="flex items-center text-xs py-1.5 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <BadgeInfo className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Asignados</span>
                <span className="sm:hidden">Asig.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="mantenimiento" 
                className="flex items-center text-xs py-1.5 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm col-span-2 sm:col-span-1"
              >
                <PauseCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Mantenimiento</span>
                <span className="sm:hidden">Mant.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="baja" 
                className="flex items-center text-xs py-1.5 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Trash2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Baja</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Agregar buscador responsivo antes de la tabla */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSearchChange(searchTerm);
          }} className="flex gap-2 flex-1">
            <Input
              placeholder="Buscar por placa, marca o modelo... (presiona Enter)"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-0"
            />
            <Button type="submit" className="shrink-0">Buscar</Button>
          </form>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        
        <div className="rounded-md border">
          {" "}
          <ListadoTabla
            title=""
            data={filteredVehiculos}
            itemsPerPage={itemsPerPage}
            searchableKeys={[]} // Removemos la búsqueda interna ya que tenemos el buscador externo
            searchPlaceholder=""
            searchValue=""
            onSearchClear={() => {}}
            remotePagination={useRemotePagination}
            totalItems={effectiveTotalItems}
            currentPage={effectiveCurrentPage}
            onPageChange={handlePageChangeUnified}
            onSearchChange={() => {}} // Función vacía ya que manejamos la búsqueda externamente
            columns={[
              { title: "Vehículo", key: "vehiculo" },
              { title: "Información", key: "informacion", className: "hidden sm:table-cell" },
              { title: "Vencimientos", key: "vencimientos", className: "hidden lg:table-cell" },
              { title: "Estado", key: "estado" },
              { title: "Acciones", key: "acciones" },
            ]}
            renderRow={(vehiculo) => (
              <>
                <TableCell className="min-w-[200px] sm:min-w-[250px]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                    </div>
                    <div>
                      {" "}
                      <div className="font-medium text-sm sm:text-base">{vehiculo.placa}</div>
                      {vehiculo.numeroInterno && (
                        <div className="text-xs font-medium text-gray-500">
                          N° Interno: {vehiculo.numeroInterno}
                        </div>
                      )}
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
                        <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        {vehiculo.marca} {vehiculo.modelo}
                      </div>
                      {/* Mostrar información adicional en móvil */}
                      <div className="sm:hidden mt-1 space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Año: {vehiculo.anio} | Cabina: {vehiculo.tipoCabina.charAt(0).toUpperCase() + vehiculo.tipoCabina.slice(1)}
                        </div>
                        {(vehiculo.fechaVencimientoVTV || vehiculo.fechaVencimientoSeguro) && (
                          <div className="text-xs text-amber-600">
                            {vehiculo.fechaVencimientoVTV && `VTV: ${new Date(vehiculo.fechaVencimientoVTV).toLocaleDateString("es-AR")}`}
                            {vehiculo.fechaVencimientoVTV && vehiculo.fechaVencimientoSeguro && " | "}
                            {vehiculo.fechaVencimientoSeguro && `Seguro: ${new Date(vehiculo.fechaVencimientoSeguro).toLocaleDateString("es-AR")}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>{" "}
                </TableCell>
                <TableCell className="min-w-[150px] hidden sm:table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>Año: {vehiculo.anio}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Truck className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span>
                        Cabina:{" "}
                        {vehiculo.tipoCabina.charAt(0).toUpperCase() +
                          vehiculo.tipoCabina.slice(1)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="min-w-[180px] hidden lg:table-cell">
                  {vehiculo.fechaVencimientoVTV ||
                  vehiculo.fechaVencimientoSeguro ? (
                    <div className="flex flex-col gap-1">
                      {vehiculo.fechaVencimientoVTV && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>
                            VTV:{" "}
                            {new Date(
                              vehiculo.fechaVencimientoVTV
                            ).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      )}
                      {vehiculo.fechaVencimientoSeguro && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>
                            Seguro:{" "}
                            {new Date(
                              vehiculo.fechaVencimientoSeguro
                            ).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No hay vencimientos registrados
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      vehiculo.estado === "DISPONIBLE"
                        ? "default"
                        : vehiculo.estado === "BAJA"
                        ? "destructive"
                        : "outline"
                    }
                    className={
                      vehiculo.estado === "DISPONIBLE"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : vehiculo.estado === "ASIGNADO"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : vehiculo.estado === "MANTENIMIENTO"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : vehiculo.estado === "BAJA"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {vehiculo.estado}
                  </Badge>
                  <div className="mt-2 text-xs text-gray-500">
                    {vehiculo.esExterno
                      ? "Vehículo externo"
                      : "Vehículo propio"}
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(vehiculo)}
                      className="cursor-pointer border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-xs"
                    >
                      <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        vehiculo.id && handleDeleteClick(vehiculo.id)
                      }
                      className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 text-xs"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sm:hidden">Del</span>
                    </Button>

                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 sm:ml-1">
                      {vehiculo.estado !== "DISPONIBLE" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            vehiculo.id &&
                            handleChangeStatus(vehiculo.id, "DISPONIBLE")
                          }
                          className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                          <span className="hidden sm:inline">Disponible</span>
                          <span className="sm:hidden">Disp</span>
                        </Button>
                      )}{" "}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (vehiculo.id) {
                            // Resetear el store primero para evitar estados residuales
                            useMaintenanceVehicleStore.getState().reset();

                            // Establecer el vehículo y abrir el modal
                            useMaintenanceVehicleStore
                              .getState()
                              .openCreateModal(vehiculo.id);

                            // Mostrar notificación
                            toast.info("Programar mantenimiento", {
                              description: `Creando mantenimiento para el vehículo ${vehiculo.placa}`,
                            });

                            // Navegar a la página de mantenimiento
                            router.push(
                              `/admin/dashboard/vehiculos/mantenimiento`
                            );
                          }
                        }}
                        className="cursor-pointer text-xs"
                      >
                        <PauseCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        <span className="hidden sm:inline">Mantenimiento</span>
                        <span className="sm:hidden">Mant</span>
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </>
            )}
          />
        </div>
      </CardContent>
      <FormDialog
        open={isCreating || selectedVehiculo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setSelectedVehiculo(null);
          }
        }}
        title={selectedVehiculo ? "Editar Vehículo" : "Crear Vehículo"}
        description={
          selectedVehiculo
            ? "Modificar información del vehículo en el sistema."
            : "Completa el formulario para registrar un nuevo vehículo."
        }
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-4">
          <Controller
            name="numeroInterno"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Número Interno (Opcional)"
                name="numeroInterno"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Número identificatorio interno"
              />
            )}
          />
          <Controller
            name="placa"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Placa"
                name="placa"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese la placa"
              />
            )}
          />
          <Controller
            name="marca"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Marca"
                name="marca"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese la marca"
              />
            )}
          />
          <Controller
            name="modelo"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Modelo"
                name="modelo"
                value={field.value?.toString() || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Ingrese el modelo"
              />
            )}
          />
          <Controller
            name="anio"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Año"
                name="anio"
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
                placeholder="Ej: 2023"
              />
            )}
          />{" "}
          <Controller
            name="tipoCabina"
            control={control}
            defaultValue="simple"
            render={({ field, fieldState }) => {
              const capitalizeFirstLetter = (string: string) => {
                return string && string.length > 0
                  ? string.charAt(0).toUpperCase() + string.slice(1)
                  : "Simple";
              };
              // Aseguramos que siempre haya un valor por defecto
              const displayValue = field.value
                ? capitalizeFirstLetter(field.value)
                : "Simple";

              return (
                <FormField
                  label="Tipo de Cabina"
                  name="tipoCabina"
                  fieldType="select"
                  value={displayValue}
                  onChange={(value) => {
                    field.onChange(value.toLowerCase());
                  }}
                  options={[
                    { label: "Simple", value: "Simple" },
                    { label: "Doble", value: "Doble" },
                  ]}
                  error={fieldState.error?.message}
                />
              );
            }}
          />
          <Controller
            name="fechaVencimientoVTV"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Vencimiento VTV (Opcional)"
                name="fechaVencimientoVTV"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="fechaVencimientoSeguro"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Vencimiento Seguro (Opcional)"
                name="fechaVencimientoSeguro"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />{" "}
          <Controller
            name="esExterno"
            control={control}
            defaultValue={false}
            render={({ field, fieldState }) => {
              // Siempre debe tener un valor por defecto (false = "Vehículo propio")
              const value = field.value === undefined ? false : field.value;
              const currentLabel =
                value === true ? "Vehículo externo" : "Vehículo propio";

              return (
                <FormField
                  label="Tipo de Vehículo"
                  name="esExterno"
                  fieldType="select"
                  value={currentLabel}
                  onChange={(value) => {
                    field.onChange(value === "Vehículo externo");
                  }}
                  options={[
                    { label: "Vehículo propio", value: "Vehículo propio" },
                    { label: "Vehículo externo", value: "Vehículo externo" },
                  ]}
                  error={fieldState.error?.message}
                />
              );
            }}
          />
          <Controller
            name="estado"
            control={control}
            render={({ field, fieldState }) => (
              <FormField
                label="Estado"
                name="estado"
                fieldType="select"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { label: "Disponible", value: "DISPONIBLE" },
                  { label: "Asignado", value: "ASIGNADO" },
                  { label: "Inactivo", value: "INACTIVO" },
                  { label: "Baja", value: "BAJA" },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </FormDialog>
      <FormDialog
        open={confirmDialogOpen}
        submitButtonText="Eliminar"
        submitButtonVariant="destructive"
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialogOpen(false);
            setVehiculoToDelete(null);
          }
        }}
        title="Confirmar eliminación"
        onSubmit={(e) => {
          e.preventDefault();
          confirmDelete();
        }}
      >
        <div className="space-y-4 py-4">
          <p className="text-destructive font-semibold">¡Atención!</p>
          <p>
            Esta acción eliminará permanentemente este vehículo. Esta operación
            no se puede deshacer.
          </p>
          <p>¿Estás seguro de que deseas continuar?</p>
        </div>
      </FormDialog>
    </Card>
  );
};

export default ListadoVehiculosComponent;
