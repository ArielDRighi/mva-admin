"use server";

import { cookies } from "next/headers";

export async function getUsers(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener usuarios");

  return await res.json();
}
export async function getUserById(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener usuario");

  return await res.json();
}
