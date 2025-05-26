"use client";

import { setCookie } from "cookies-next";

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Credenciales inválidas");

  const data = await res.json();

  // Establecer las cookies para la sesión
  setCookie("token", data.access_token);
  setCookie("user", JSON.stringify(data.user));

  return data;
}
