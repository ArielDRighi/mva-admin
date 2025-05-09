"use server";

import { Sanitario } from "@/types/types";
import { cookies } from "next/headers";

export async function getSanitarios(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener sanitarios");

  return await res.json();
}

export async function editSanitario(id: string, data: Sanitario) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_interno: data.codigo_interno,
        modelo: data.modelo,
        fecha_adquisicion: data.fecha_adquisicion,
        estado: data.estado,
      }),
      cache: "no-store",
    }
  );

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al editar el sanitario");
  }

  return res.status;
}

export async function deleteSanitario(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/${id}`,
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
    throw new Error(errorData.message || "Error al eliminar el sanitario");
  }

  return res.status;
}

export async function createSanitario(data: Sanitario) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigo_interno: data.codigo_interno,
      modelo: data.modelo,
      fecha_adquisicion: data.fecha_adquisicion,
      estado: data.estado,
    }),
    cache: "no-store",
  });

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al crear el sanitario");
  }

  return res.status;
}