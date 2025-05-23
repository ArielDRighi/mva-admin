"use server";

import { UpdateServiceDto, ServiceState } from "@/types/serviceTypes";
import { cookies } from "next/headers";

/**
 * Obtiene una lista paginada de servicios con posibilidad de filtrado
 */
export async function getServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al obtener los servicios");

  return await res.json();
}

/**
 * Obtiene un servicio específico por su ID
 */
export async function getServiceById(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el servicio");

  return await res.json();
}

/**
 * Obtiene servicios filtrados por un rango de fechas
 */
export async function getServicesByDateRange(
  startDate: string,
  endDate: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/date-range?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error("Error al obtener servicios por rango de fechas");

  return await res.json();
}

/**
 * Obtiene los servicios programados para hoy
 */
export async function getTodayServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/today`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener servicios de hoy");

  return await res.json();
}

/**
 * Obtiene servicios en estado SUSPENDIDO
 */
export async function getPendingServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener servicios suspendidos");

  return await res.json();
}

/**
 * Obtiene servicios en estado EN_PROGRESO
 */
export async function getInProgressServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/in-progress`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener servicios en progreso");

  return await res.json();
}

/**
 * Obtiene los baños instalados para un cliente específico
 */
export async function getClientInstalledToilets(clientId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/by-client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Error al obtener baños instalados para el cliente ${clientId}`
    );
  }

  return res.json();
}

/**
 * Actualiza un servicio existente
 */
export async function updateService(id: number, data: UpdateServiceDto) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar el servicio");
  }

  return res.json();
}

/**
 * Cambia el estado de un servicio
 */
export async function changeServiceStatus(id: number, estado: ServiceState) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al cambiar el estado del servicio"
    );
  }

  return res.json();
}

/**
 * Elimina un servicio específico
 */
export async function deleteService(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al eliminar el servicio");
  }

  return res.status;
}

export async function getProximosServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/proximos`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener los servicios proximos");

  return await res.json();
}

export async function getServicesStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error("Error al obtener las estadisticas de servicios");

  return await res.json();
}
export async function getResumeServices() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/resumen`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el resumen de servicios");

  return await res.json();
}

export async function getFuturesCleanings() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/future_cleanings`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener limpiezas futuras");

  return await res.json();
}

export async function getRecentActivity() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/recent_activity/global`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener actividades recientes");

  return await res.json();
}
enum serviceStatus {
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  SUSPENDIDO = "SUSPENDIDO",
}
export async function updateStatusService(id: number, estado: serviceStatus) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al cambiar el estado del servicio");

  return await res.json();
}

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

export async function createServiceCapacitacion(data: CreateCapacitacionDto) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/capacitacion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al crear el servicio de capacitacion");

  return await res.json();
}

export async function getCapacitaciones() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/capacitacion`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener capacitaciones");

  return await res.json();
}

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

export async function createServiceInstalacion(data: CreateInstalacionDto) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/instalacion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al crear el servicio de instalacion");

  return await res.json();
}

export async function getInstalaciones(page: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/instalacion?page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener instalaciones");

  return await res.json();
}

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

export async function createServicioGenerico(data: CreateLimpiezaDto) {
  console.log("[createServicioGenerico] Starting with data:", data);
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.error("[createServicioGenerico] Token not found");
    throw new Error("Token no encontrado");
  }

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
}
