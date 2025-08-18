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
 * Información de contexto para errores de API
 */
export interface ApiErrorContext {
  file: string;
  endpoint: string;
  method?: string;
  statusCode?: number;
}

/**
 * Función para extraer el mensaje de error de una respuesta de API
 * @param error Error capturado (puede ser cualquier tipo)
 * @param context Información de contexto del error (archivo, endpoint, etc.)
 * @returns Un string con el mensaje de error más descriptivo disponible
 */
export function getErrorMessage(
  error: unknown,
  context?: ApiErrorContext
): string {
  let errorMessage = "";
  let statusCode = "";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    // Intentar extraer mensajes de error de respuestas de API
    const errorResponse = error as ApiErrorResponse;

    // Verifica si hay propiedad message directamente
    if (errorResponse.message) {
      errorMessage = String(errorResponse.message);
    }
    // Verifica si hay propiedad error directamente
    else if (errorResponse.error) {
      errorMessage = String(errorResponse.error);
    }
    // Si hay errores de validación, formatearlos
    else if (errorResponse.errors) {
      const errorMessages = Object.values(errorResponse.errors).flat();
      if (errorMessages.length > 0) {
        errorMessage = errorMessages.join(", ");
      }
    }
    // Si error es un objeto pero no tiene propiedades reconocibles, intenta convertirlo a string
    else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = "Error desconocido";
      }
    }

    // Extraer código de estado si está disponible
    if (errorResponse.statusCode) {
      statusCode = String(errorResponse.statusCode);
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "Ha ocurrido un error inesperado";
  }

  // Si tenemos contexto, construir mensaje detallado
  if (context) {
    const parts = [];

    if (errorMessage) {
      parts.push(errorMessage);
    }

    parts.push(`\n📁 Archivo: ${context.file}`);
    parts.push(`🔗 Endpoint: ${context.endpoint}`);

    if (context.method) {
      parts.push(`📝 Método: ${context.method}`);
    }

    if (statusCode || context.statusCode) {
      parts.push(`❌ Código: ${statusCode || context.statusCode}`);
    }

    return parts.join("\n");
  }

  return errorMessage || "Ha ocurrido un error inesperado";
}

/**
 * Procesa errores HTTP y extrae el mensaje adecuado para presentar al usuario
 * @param error El error capturado
 * @param context Información de contexto del error
 * @param defaultMessage Mensaje predeterminado si no se puede extraer uno del error
 * @returns El mensaje de error procesado para mostrar al usuario
 */
export function handleApiError(
  error: unknown,
  context?: ApiErrorContext,
  defaultMessage: string = "Ha ocurrido un error en la operación"
): string {
  const message = getErrorMessage(error, context) || defaultMessage;

  // Siempre registramos el error en la consola para depuración
  console.error("API Error:", error);
  if (context) {
    console.error("Error Context:", context);
  }

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
    handleApiError(error, undefined, errorMessage);
    return undefined;
  }
}
