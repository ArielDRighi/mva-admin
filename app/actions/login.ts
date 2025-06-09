"use client";

import { setCookie } from "cookies-next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

/**
 * Función para autenticar al usuario y establecer las cookies de sesión
 * Esta función se ejecuta en el cliente y maneja su propio esquema de errores
 *
 * @param email Correo electrónico del usuario
 * @param password Contraseña del usuario
 * @returns Datos del usuario autenticado o lanza un error
 */
export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Credenciales inválidas");
    }

    const data = await res.json();

    setCookie("token", data.access_token);
    setCookie("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    // Utilizamos getErrorMessage para mantener consistencia con el manejo
    // de errores del resto del sistema
    const message = getErrorMessage(error) || "Error al iniciar sesión";

    toast.error("Error", {
      description: message,
    });

    console.error("Error de login:", error);

    throw error;
  }
}

export async function forgotPassword(email: string): Promise<{
  user: {
    email: string;
    nombre: string;
    newPassword: string;
  };
}> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot_password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(
        error.message || "Error al enviar el email de restablecimiento"
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    const message = getErrorMessage(error) || "Error al enviar el email";
    console.error("Error en forgot password:", error);
    throw new Error(message);
  }
}
