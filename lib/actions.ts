// filepath: lib/actions.ts
import { cookies } from "next/headers";
import { handleApiError } from "./errors";

/**
 * Tipo para representar una acción de servidor con manejo de errores
 */
type ActionWithErrorHandling<Args extends unknown[], Result> = (
  ...args: Args
) => Promise<Result>;

/**
 * Wrapper para crear una acción de servidor con manejo de errores integrado
 * Esta función simplifica la creación de acciones del servidor con gestión de errores consistente
 *
 * @param action Función que implementa la lógica de la acción del servidor
 * @param defaultErrorMessage Mensaje de error por defecto
 * @returns Una nueva función que envuelve la acción original con manejo de errores
 */
export function createServerAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  defaultErrorMessage: string
): ActionWithErrorHandling<Args, Result> {
  return async (...args: Args): Promise<Result> => {
    try {
      return await action(...args);
    } catch (error) {
      // Gestionar el error y mostrar toast
      handleApiError(error, defaultErrorMessage);
      throw error; // Re-lanzar para que el cliente pueda manejarlo si es necesario
    }
  };
}

/**
 * Función auxiliar para obtener el token de autenticación de cookies
 * Esta función es compatible tanto con el servidor como con el cliente
 * @returns El token JWT almacenado en cookies o lanza un error si no existe
 */
export async function getAuthToken(): Promise<string> {
  // En el contexto del servidor
  if (typeof window === "undefined") {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error(
        "Token no encontrado. Por favor, inicia sesión nuevamente."
      );
    }

    return token;
  }
  // En el contexto del cliente
  else {
    // Importar cookies-next dinámicamente para el cliente
    const { getCookie } = await import("cookies-next");
    const token = getCookie("token") as string | undefined;

    if (!token) {
      throw new Error(
        "Token no encontrado. Por favor, inicia sesión nuevamente."
      );
    }

    return token;
  }
}

/**
 * Función auxiliar para crear los headers de una petición con autorización
 * @param contentType Tipo de contenido de la petición (por defecto application/json)
 * @returns Un objeto con los headers necesarios para la petición
 */
export async function createAuthHeaders(
  contentType: string = "application/json"
): Promise<HeadersInit> {
  const token = await getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": contentType,
  };
}

/**
 * Función para manejar respuestas de API de manera consistente
 * @param response Respuesta de fetch
 * @param errorMessage Mensaje de error por defecto
 * @returns Datos de la respuesta ya procesados
 */
export async function handleApiResponse<T>(
  response: Response,
  errorMessage: string
): Promise<T> {
  if (!response.ok) {
    // Si la respuesta no es exitosa, intentar obtener el mensaje de error del servidor
    const errorData = await response.text();
    let parsedError: unknown;

    try {
      // Intentar analizar como JSON solo si hay contenido
      if (errorData) {
        parsedError = JSON.parse(errorData);
      }
    } catch (e) {
      // Si no se puede analizar como JSON, usar el texto tal cual
      console.error("Error parsing error response:", e);
    }

    throw parsedError || errorMessage;
  }

  // Para respuestas exitosas, verificar si hay contenido
  if (response.status === 204) {
    // Para 204 No Content, retornar un objeto vacío o algún valor por defecto
    return {} as T;
  }

  // Verificar el Content-Type y Content-Length
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");

  // Si no hay contenido o es un JSON vacío, retornar un objeto vacío
  if (
    contentLength === "0" ||
    (contentType?.includes("application/json") && contentLength === "0")
  ) {
    return {} as T;
  }

  // Para respuestas con contenido, intentar analizarlas como JSON
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    // Si falla la conversión a JSON, intentar con texto
    const text = await response.text();
    if (text.trim()) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    } else {
      // Si tampoco hay texto, retornar un objeto vacío
      return {} as T;
    }
  }
}
