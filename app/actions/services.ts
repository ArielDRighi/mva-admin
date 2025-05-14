"use server";

import {
  UpdateServiceDto,
  ServiceState,
  CreateServiceDtoAutomatico,
  CreateServiceDtoManual,
  ManualAssignment,
} from "@/types/serviceTypes";
import { cookies } from "next/headers";

/**
 * Obtiene una lista paginada de servicios con posibilidad de filtrado
 */
export async function getServices(
  page: number = 1,
  limit: number = 15,
  search: string = "",
  filters: Record<string, any> = {}
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  let queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append("search", search);

  // Agregar filtros adicionales si existen
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/services?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    console.log(
      "URL de solicitud:",
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/services?${queryParams.toString()}`
    );
    console.log("Estado de respuesta:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(
        `Error al obtener servicios: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    console.log("Datos recibidos:", data);
    return data;
  } catch (error) {
    console.error("Error en getServices:", error);
    throw error;
  }
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
 * Crea un nuevo servicio con asignación automática de recursos
 * Esta función utiliza la ruta /services/create/automatic
 */
export async function createServiceAutomatic(data: CreateServiceDtoAutomatico) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/create/automatic`,
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

  // Get the response data first before checking status
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || "Error al crear el servicio");
  }

  // Return the already parsed response data
  return responseData;
}

/**
 * Crea un nuevo servicio con asignación manual de recursos
 * Esta función utiliza la ruta /services/create/manual
 */
export async function createServiceManual(
  data: CreateServiceDtoManual & {
    asignacionesManual: ManualAssignment[];
  }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  // Validar que hay al menos una asignación manual
  if (!data.asignacionesManual || data.asignacionesManual.length === 0) {
    throw new Error("Se requiere al menos una asignación manual de recursos");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/create/manual`,
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

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));

    if (res.status === 400 && errorData.message?.includes("asignación")) {
      throw new Error("Se requiere proporcionar asignaciones manuales válidas");
    } else if (res.status === 403) {
      throw new Error("No tienes permisos para crear servicios");
    } else {
      throw new Error(
        errorData.message || "Error al crear el servicio con asignación manual"
      );
    }
  }
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
