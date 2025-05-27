"use server";

import { UpdateServiceDto, ServiceState } from "@/types/serviceTypes";
import {
  createAuthHeaders,
  handleApiResponse,
  createServerAction,
} from "@/lib/actions";

/**
 * Obtiene una lista paginada de servicios con posibilidad de filtrado
 */
export const getServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse(res, "Error al obtener los servicios");
}, "Error al obtener los servicios");

/**
 * Obtiene un servicio específico por su ID
 */
export const getServiceById = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, `Error al obtener el servicio con ID ${id}`);
}, "Error al obtener el servicio");

/**
 * Obtiene servicios filtrados por un rango de fechas
 */
export const getServicesByDateRange = createServerAction(
  async (startDate: string, endDate: string) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/date-range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(
      res,
      "Error al obtener servicios por rango de fechas"
    );
  },
  "Error al obtener servicios por rango de fechas"
);

/**
 * Obtiene los servicios programados para hoy
 */
export const getTodayServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/today`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener servicios de hoy");
}, "Error al obtener servicios de hoy");

/**
 * Obtiene servicios en estado SUSPENDIDO
 */
export const getPendingServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/pending`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener servicios suspendidos");
}, "Error al obtener servicios suspendidos");

/**
 * Obtiene servicios en estado EN_PROGRESO
 */
export const getInProgressServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/in-progress`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener servicios en progreso");
}, "Error al obtener servicios en progreso");

/**
 * Obtiene los baños instalados para un cliente específico
 */
export const getClientInstalledToilets = createServerAction(
  async (clientId: number) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/by-client/${clientId}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(
      res,
      `Error al obtener baños instalados para el cliente ${clientId}`
    );
  },
  "Error al obtener baños instalados para el cliente"
);

/**
 * Actualiza un servicio existente
 */
export const updateService = createServerAction(
  async (id: number, data: UpdateServiceDto) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al actualizar el servicio");
  },
  "Error al actualizar el servicio"
);

/**
 * Cambia el estado de un servicio
 */
export const changeServiceStatus = createServerAction(
  async (id: number, estado: ServiceState) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/estado`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado }),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al cambiar el estado del servicio");
  },
  "Error al cambiar el estado del servicio"
);

/**
 * Elimina un servicio específico
 */
export const deleteService = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al eliminar el servicio");
}, "Error al eliminar el servicio");

/**
 * Obtiene los servicios próximos a realizar
 */
export const getProximosServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/proximos`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener los servicios proximos");
}, "Error al obtener los servicios próximos");

/**
 * Obtiene estadísticas de los servicios
 */
export const getServicesStats = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/stats`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(
    res,
    "Error al obtener las estadisticas de servicios"
  );
}, "Error al obtener las estadísticas de servicios");

/**
 * Obtiene el resumen de servicios
 */
export const getResumeServices = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/resumen`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener el resumen de servicios");
}, "Error al obtener el resumen de servicios");

/**
 * Obtiene las limpiezas futuras programadas
 */
export const getFuturesCleanings = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/future_cleanings`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener limpiezas futuras");
}, "Error al obtener limpiezas futuras");

/**
 * Obtiene la actividad reciente global
 */
export const getRecentActivity = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/recent_activity/global`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener actividades recientes");
}, "Error al obtener actividades recientes");

enum serviceStatus {
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  SUSPENDIDO = "SUSPENDIDO",
}

/**
 * Actualiza el estado de un servicio
 */
export const updateStatusService = createServerAction(
  async (id: number, estado: serviceStatus) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/estado`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado }),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al cambiar el estado del servicio");
  },
  "Error al cambiar el estado del servicio"
);

// UTILIZAMOS TODO DE ACA PARA ABAJO
export interface CreateCapacitacionDto {
  tipoServicio: "CAPACITACION";
  fechaProgramada: string;
  fechaFin: string;
  ubicacion: string;
  asignacionesManual: {
    empleadoId: number;
  }[];
}

/**
 * Crea un servicio de capacitación
 */
export const createServiceCapacitacion = createServerAction(
  async (data: CreateCapacitacionDto) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/capacitacion`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al crear el servicio de capacitacion");
  },
  "Error al crear el servicio de capacitación"
);

/**
 * Obtiene todas las capacitaciones
 */
export const getCapacitaciones = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/capacitacion`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener capacitaciones");
}, "Error al obtener capacitaciones");

export interface CreateInstalacionDto {
  condicionContractualId: number;
  fechaProgramada: string;
  cantidadVehiculos: number;
  ubicacion: string;
  asignacionAutomatica: boolean;
  asignacionesManual: [
    {
      empleadoId?: number;
      vehiculoId: number;
      banosIds: number[];
    },
    {
      empleadoId?: number;
    }
  ];
  notas?: string;
}

/**
 * Crea un servicio de instalación
 */
export const createServiceInstalacion = createServerAction(
  async (data: CreateInstalacionDto) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/instalacion`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al crear el servicio de instalación");
  },
  "Error al crear el servicio de instalación"
);

/**
 * Obtiene las instalaciones con paginación
 */
export const getInstalaciones = createServerAction(async (page: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/instalacion?page=${page}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener instalaciones");
}, "Error al obtener instalaciones");

export interface CreateLimpiezaDto {
  tipoServicio: "LIMPIEZA";
  condicionContractualId: number;
  cantidadVehiculos: number;
  fechaProgramada: string;
  ubicacion: string;
  asignacionAutomatica: boolean;
  banosInstalados: number[];
  asignacionesManual: [
    {
      empleadoId: number;
      vehiculoId: number;
    },
    {
      empleadoId: number;
    }
  ];
  notas?: string;
}

/**
 * Crea un servicio genérico (usado principalmente para limpiezas)
 */
export const createServicioGenerico = createServerAction(
  async (data: CreateLimpiezaDto) => {
    console.log("[createServicioGenerico] Starting with data:", data);
    const headers = await createAuthHeaders();

    console.log("[createServicioGenerico] Token found, making API request");
    console.log(
      "[createServicioGenerico] API URL:",
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/generico`
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/generico`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          cache: "no-store",
        }
      );

      console.log("[createServicioGenerico] Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[createServicioGenerico] Error response:", errorText);
        throw new Error(`Error al crear el servicio generico: ${errorText}`);
      }

      const responseData = await res.json();
      console.log("[createServicioGenerico] Success response:", responseData);
      return responseData;
    } catch (error) {
      console.error("[createServicioGenerico] Exception:", error);
      throw error;
    }
  },
  "Error al crear el servicio genérico"
);

/**
 * Obtiene los servicios genéricos con paginación
 */
export const getServiciosGenericos = createServerAction(
  async (page: number) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/generico?page=${page}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al obtener servicios genericos");
  },
  "Error al obtener servicios genéricos"
);
