"use server";

import { cookies } from "next/headers";

export interface LicenciaConducir {
  licencia_id: number;
  categoria: string;
  fecha_expedicion: Date;
  fecha_vencimiento: Date;
}
export async function getLicenciaByEmpleadoId(empleadoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/licencia/${empleadoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener licencias de conducir");

  return await res.json();
}
export interface UpdateLicenciaConducir {
  categoria?: string;
  fecha_expedicion?: Date;
  fecha_vencimiento?: Date;
}

export async function updateLicenciaConducir(
  empleadoId: number,
  licencia: UpdateLicenciaConducir
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/licencia/update/${empleadoId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(licencia),
    }
  );

  if (!res.ok) throw new Error("Error al actualizar licencia de conducir");

  return await res.json();
}

export interface CreateLicenciaConducir {
  categoria: string;
  fecha_expedicion: Date;
  fecha_vencimiento: Date;
}

export async function createLicenciaConducir(
  empleadoId: number,
  licencia: CreateLicenciaConducir
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/licencia/${empleadoId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(licencia),
    }
  );

  if (!res.ok) throw new Error("Error al crear licencia de conducir");

  return await res.json();
}

export async function getLicenciasToExpire(
  dias: number,
  page: number,
  limit: number
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/licencias/por-vencer`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener licencias de empleados");

  return await res.json();
}

export async function getLicenciasConducir(page: number, limit: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/licencias?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener licencias de empleados");

  return await res.json();
}
