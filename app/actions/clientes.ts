"use server";

import { cookies } from "next/headers"; // ✅ MUY IMPORTANTE

export async function getClients() {
  const cookieStore = await cookies(); // Aquí usamos `await` para asegurarnos de que se resuelva correctamente

  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al obtener clientes");

  return await res.json();
}
