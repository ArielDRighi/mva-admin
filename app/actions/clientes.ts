"use server";

import { cookies } from "next/headers";

export async function getClients(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  // Asegúrate de agregar el parámetro 'search' si es que hay un término de búsqueda
  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clients?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener clientes");

  return await res.json();
}
