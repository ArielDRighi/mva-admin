/**
 * Tipo para los mensajes de error personalizados en las respuestas de la API
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Función para extraer el mensaje de error de una respuesta de API
 * @param error Error capturado (puede ser cualquier tipo)
 * @returns Un string con el mensaje de error más descriptivo disponible
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    // Intentar extraer mensajes de error de respuestas de API
    const errorResponse = error as ApiErrorResponse;

    if (errorResponse.message) {
      return errorResponse.message;
    }

    if (errorResponse.error) {
      return errorResponse.error;
    }

    // Si hay errores de validación, formatearlos
    if (errorResponse.errors) {
      const errorMessages = Object.values(errorResponse.errors).flat();
      if (errorMessages.length > 0) {
        return errorMessages.join(", ");
      }
    }
  }

  if (typeof error === "string") {
    return error;
  }

  // Si no se puede determinar, enviar un mensaje genérico
  return "Ha ocurrido un error inesperado";
}

/**
 * Maneja errores HTTP y muestra un toast con el mensaje apropiado
 * @param error El error capturado
 * @param defaultMessage Mensaje predeterminado si no se puede extraer uno del error
 * @returns El mensaje de error para uso adicional si es necesario
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = "Ha ocurrido un error en la operación"
): string {
  const message = getErrorMessage(error) || defaultMessage;

  // Solo intentar mostrar toast si estamos en el cliente
  if (typeof window !== "undefined") {
    // En el cliente, podemos usar el toast
    import("sonner").then((sonnerModule) => {
      const { toast } = sonnerModule;
      toast.error("Error", {
        description: message,
      });
    }).catch(() => {
      console.error("No se pudo cargar el módulo de toast");
    });
  }

  // Siempre registramos el error en la consola para depuración
  console.error("API Error:", error);

  return message;
}

/**
 * Función específica para manejar errores de acciones del servidor
 * @param action Función asíncrona que ejecuta una acción del servidor
 * @param onSuccess Función opcional a ejecutar si la acción es exitosa
 * @param errorMessage Mensaje de error personalizado
 * @returns Una función que ejecuta la acción y maneja los errores
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  onSuccess?: (result: T) => void,
  errorMessage?: string
): Promise<T | undefined> {
  try {
    const result = await action();

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    handleApiError(error, errorMessage);
    return undefined;
  }
}
