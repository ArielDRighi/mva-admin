"use server";

import {
  CreateVehicleMaintenance,
  UpdateVehicleMaintenance,
} from "@/types/types";
import { cookies } from "next/headers";

/* Mantenimiento de Vehículos */
export async function getMantenimientosVehiculos(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener mantenimientos de vehículos");

  return await res.json();
}

export async function getMantenimientosProgramados() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/upcoming`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener mantenimientos programados");

  return await res.json();
}

export async function getMantenimientoVehiculoPorId(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error("Error al obtener el mantenimiento del vehículo");

  return await res.json();
}

export async function getMantenimientosPorVehiculo(vehiculoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/vehiculo/${vehiculoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener mantenimientos del vehículo");

  return await res.json();
}

export async function createMantenimientoVehiculo(
  data: CreateVehicleMaintenance
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehiculoId: data.vehiculoId,
        fechaMantenimiento: data.fechaMantenimiento,
        tipoMantenimiento: data.tipoMantenimiento,
        descripcion: data.descripcion,
        costo: data.costo,
        proximoMantenimiento: data.proximoMantenimiento,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al programar el mantenimiento del vehículo"
    );
  }

  return res.status;
}

export async function editMantenimientoVehiculo(
  id: number,
  data: UpdateVehicleMaintenance
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fechaMantenimiento: data.fechaMantenimiento,
        tipoMantenimiento: data.tipoMantenimiento,
        descripcion: data.descripcion,
        costo: data.costo,
        proximoMantenimiento: data.proximoMantenimiento,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al actualizar el mantenimiento del vehículo"
    );
  }

  return res.status;
}

export async function deleteMantenimientoVehiculo(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/${id}`,
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
      errorData.message || "Error al eliminar el mantenimiento del vehículo"
    );
  }

  return res.status;
}

export async function completarMantenimientoVehiculo(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicle_maintenance/${id}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al completar el mantenimiento del vehículo"
    );
  }

  return res.status;
}
