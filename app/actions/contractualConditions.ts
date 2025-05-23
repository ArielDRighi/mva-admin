"use server";

import { cookies } from "next/headers";

// Tipos para las condiciones contractuales
export type ContractualCondition = {
  condicionContractualId?: number;
  cliente?: {
    clienteId: number;
    nombre: string;
    cuit: string;
  };
  clientId?: number;
  tipo_de_contrato: "Temporal" | "Permanente";
  fecha_inicio: string;
  fecha_fin: string;
  condiciones_especificas?: string;
  tarifa: number;
  periodicidad: "Diaria" | "Semanal" | "Mensual" | "Anual";
  estado: "Activo" | "Inactivo" | "Terminado";
};

export type CreateContractualCondition = {
  clientId: number;
  tipo_de_contrato: "Temporal" | "Permanente" | string;
  fecha_inicio: string;
  fecha_fin: string;
  condiciones_especificas?: string;
  tarifa: number;
  periodicidad: "Diaria" | "Semanal" | "Mensual" | "Anual" | string;
  estado?: "Activo" | "Inactivo" | "Terminado" | string;
};

export type UpdateContractualCondition = {
  tipo_de_contrato?: "Temporal" | "Permanente";
  fecha_inicio?: string;
  fecha_fin?: string;
  condiciones_especificas?: string;
  tarifa?: number;
  periodicidad?: "Diaria" | "Semanal" | "Mensual" | "Anual";
  estado?: "Activo" | "Inactivo" | "Terminado";
};

/**
 * Obtiene todas las condiciones contractuales
 */
export async function getAllContractualConditions(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener condiciones contractuales");

  return await res.json();
}

/**
 * Obtiene una condición contractual específica por su ID
 */
export async function getContractualConditionById(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions/id/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error(`Error al obtener la condición contractual con ID ${id}`);

  return await res.json();
}

/**
 * Obtiene todas las condiciones contractuales asociadas a un cliente específico
 */
export async function getContractualConditionsByClient(clientId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions/client-id/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error(
      `Error al obtener condiciones contractuales del cliente ${clientId}`
    );

  return await res.json();
}

/**
 * Crea una nueva condición contractual
 */
export async function createContractualCondition(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions/create`,
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
    throw new Error(
      errorData.message || "Error al crear la condición contractual"
    );
  }

  return await res.json();
}

/**
 * Modifica una condición contractual existente
 */
export async function updateContractualCondition(
  id: number,
  data: UpdateContractualCondition
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions/modify/${id}`,
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
    throw new Error(
      errorData.message || "Error al actualizar la condición contractual"
    );
  }

  return await res.json();
}

/**
 * Elimina una condición contractual específica
 */
export async function deleteContractualCondition(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contractual_conditions/delete/${id}`,
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
    throw new Error(
      errorData.message || "Error al eliminar la condición contractual"
    );
  }

  return await res.json();
}
