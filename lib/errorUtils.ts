/**
 * Utilidades mejoradas para el manejo de errores en producción
 * Diseñadas para extraer mensajes específicos del backend y mostrarlos correctamente al usuario
 */

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]> | string[];
  details?: string;
  timestamp?: string;
}

/**
 * Logger mejorado que funciona tanto en desarrollo como en producción
 */
export const errorLogger = {
  log: (context: string, error: unknown, additionalInfo?: unknown) => {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_DEBUG_ERRORS === "true"
    ) {
      console.group(`🚨 Error en ${context}`);
      console.error("Error completo:", error);
      console.error("Tipo de error:", typeof error);
      console.error(
        "Constructor:",
        (error as Record<string, unknown>)?.constructor?.name
      );

      if ((error as Record<string, unknown>)?.stack) {
        console.error("Stack trace:", (error as Record<string, unknown>).stack);
      }

      if ((error as Record<string, unknown>)?.response) {
        const response = (error as Record<string, unknown>).response as Record<
          string,
          unknown
        >;
        console.error("Response data:", response.data);
        console.error("Response status:", response.status);
        console.error("Response headers:", response.headers);
      }

      if (additionalInfo) {
        console.error("Información adicional:", additionalInfo);
      }

      console.groupEnd();
    }

    // En producción, solo logging básico
    console.error(`Error en ${context}:`, (error as Error)?.message || error);
  },
};

/**
 * Extrae el mensaje de error más específico posible del error
 */
export function extractErrorMessage(error: unknown): string {
  // Log para debugging
  errorLogger.log("extractErrorMessage", error);

  // 1. Si es un Error básico de JavaScript
  if (error instanceof Error) {
    // Verifica si el mensaje contiene información útil y no es genérico
    if (error.message && !error.message.includes("digest") && !error.message.includes("Server Components render")) {
      return error.message;
    }
    
    // Para errores de Server Components, buscar en originalError
    if (error.message.includes("Server Components render")) {
      const errorObj = error as any;
      if (errorObj.originalError) {
        const nestedMessage = extractErrorMessage(errorObj.originalError);
        if (nestedMessage && nestedMessage !== "Error desconocido en la operación") {
          return nestedMessage;
        }
      }
    }
  }

  // 2. Si es un objeto con estructura de respuesta de API
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorResponse;
    const errorObj = error as Record<string, unknown>;

    // Prioridad 1: mensaje directo
    if (apiError.message && typeof apiError.message === "string") {
      // Si el mensaje del backend está bien formado, usarlo directamente
      if (!apiError.message.includes("digest") && !apiError.message.includes("Server Components render")) {
        return apiError.message;
      }
    }

    // Prioridad 2: campo error
    if (apiError.error && typeof apiError.error === "string") {
      return apiError.error;
    }

    // Prioridad 3: detalles específicos
    if (apiError.details && typeof apiError.details === "string") {
      return apiError.details;
    }

    // Prioridad 4: errores de validación
    if (apiError.errors) {
      if (Array.isArray(apiError.errors)) {
        return apiError.errors.join(", ");
      } else if (typeof apiError.errors === "object") {
        const errorMessages = Object.values(apiError.errors).flat();
        if (errorMessages.length > 0) {
          return errorMessages.join(", ");
        }
      }
    }

    // Prioridad 5: buscar en propiedades anidadas (para errores envueltos)
    const nestedSources = [
      errorObj.originalError,
      errorObj.cause,
      (errorObj as any)?.response?.data,
      (errorObj as any)?.response?.data?.message,
      (errorObj as any)?.response?.data?.error,
    ];

    for (const source of nestedSources) {
      if (source && typeof source === "object") {
        const nestedMessage = extractErrorMessage(source);
        if (nestedMessage && nestedMessage !== "Error desconocido en la operación") {
          return nestedMessage;
        }
      } else if (source && typeof source === "string") {
        return source;
      }
    }

    // Prioridad 6: propiedades comunes de mensajes de error
    const possibleMessageKeys = ["msg", "description", "detail", "reason", "statusText"];
    for (const key of possibleMessageKeys) {
      if (errorObj[key] && typeof errorObj[key] === "string") {
        return errorObj[key] as string;
      }
    }

    // Prioridad 7: Si es un objeto de respuesta fetch con texto
    if (errorObj.text && typeof errorObj.text === "string") {
      try {
        const parsed = JSON.parse(errorObj.text);
        return extractErrorMessage(parsed);
      } catch {
        return errorObj.text;
      }
    }

    // Prioridad 8: Si tiene statusCode, intentar crear un mensaje descriptivo
    if (errorObj.statusCode && typeof errorObj.statusCode === "number") {
      const statusMessages: Record<number, string> = {
        400: "Solicitud inválida",
        401: "No autorizado",
        403: "Acceso denegado",
        404: "Recurso no encontrado",
        409: "Conflicto en la operación",
        422: "Datos de entrada inválidos",
        500: "Error interno del servidor",
      };
      
      const statusMessage = statusMessages[errorObj.statusCode];
      if (statusMessage) {
        return statusMessage;
      }
    }
  }

  // 3. Si es un string directo
  if (typeof error === "string") {
    // Si es un digest de Next.js, intentar extraer información útil
    if (error.match(/^\d+$/)) {
      return "Error en la operación. El recurso puede tener dependencias activas que impiden su eliminación.";
    }
    return error;
  }

  // 4. Último recurso: convertir a string si es posible
  try {
    const errorString = JSON.stringify(error);
    if (errorString !== "{}" && errorString !== "null") {
      // Si parece ser un digest numérico, dar un mensaje más útil
      if (errorString.match(/^\d+$/)) {
        return "Error en la operación. El recurso puede tener dependencias activas que impiden su eliminación.";
      }
      return errorString;
    }
  } catch {
    // Fallo al serializar
  }

  return "Error desconocido en la operación";
}

/**
 * Maneja errores de manera inteligente para diferentes contextos
 */
export function handleSmartError(
  error: unknown,
  context: string,
  fallbackMessage?: string
): string {
  errorLogger.log(context, error);

  let extractedMessage = extractErrorMessage(error);

  // Si el mensaje parece ser un error envuelto de Server Components, 
  // intentar extraer información más útil del error original
  if (extractedMessage.includes("An error occurred in the Server Components render")) {
    // Verificar si tenemos información del error original
    const errorObj = error as Record<string, unknown>;
    
    // Buscar en diferentes propiedades donde podría estar el mensaje real
    const possibleSources = [
      errorObj.originalError,
      errorObj.cause,
      errorObj.details,
      (errorObj as any)?.response?.data,
      (errorObj as any)?.response?.data?.message,
      (errorObj as any)?.response?.data?.error,
      // También buscar en el digest si existe
      (errorObj as any)?.digest,
    ];

    for (const source of possibleSources) {
      if (source) {
        const innerMessage = extractErrorMessage(source);
        if (innerMessage && !innerMessage.includes("Server Components render") && innerMessage !== "Error desconocido en la operación") {
          extractedMessage = innerMessage;
          break;
        }
      }
    }

    // Si tenemos un digest, intentar extraer información útil
    if (extractedMessage.includes("Server Components render") && (errorObj as any)?.digest) {
      const digest = (errorObj as any).digest as string;
      
      // Para errores específicos conocidos, proporcionar mensajes más útiles
      if (context.toLowerCase().includes("vehicle") || context.toLowerCase().includes("vehículo")) {
        extractedMessage = "No se pudo eliminar el vehículo. Es posible que tenga servicios activos asignados. Revise los servicios en curso.";
      } else if (context.toLowerCase().includes("employee") || context.toLowerCase().includes("empleado")) {
        extractedMessage = "No se pudo eliminar el empleado. Es posible que tenga tareas o servicios asignados. Revise las asignaciones activas.";
      } else {
        extractedMessage = fallbackMessage || "Error en la operación. El recurso puede tener dependencias activas que impiden su eliminación.";
      }
    }

    // Si aún no tenemos un mensaje útil, usar el fallback específico del contexto
    if (extractedMessage.includes("Server Components render")) {
      extractedMessage = fallbackMessage || "Error en la operación. Contacte al administrador si el problema persiste.";
    }
  }

  // Si solo tenemos un digest numérico, proporcionar un mensaje más útil basado en el contexto
  if (extractedMessage.match(/^\d+$/) || extractedMessage === "Error en la operación. El recurso puede tener dependencias activas que impiden su eliminación.") {
    if (context.toLowerCase().includes("vehicle") || context.toLowerCase().includes("vehículo")) {
      extractedMessage = "No se pudo eliminar el vehículo. Es posible que tenga servicios activos asignados o mantenimientos pendientes. Revise las asignaciones activas.";
    } else if (context.toLowerCase().includes("employee") || context.toLowerCase().includes("empleado")) {
      extractedMessage = "No se pudo eliminar el empleado. Es posible que tenga tareas o servicios asignados. Revise las asignaciones activas.";
    } else if (context.toLowerCase().includes("sanitario") || context.toLowerCase().includes("toilet")) {
      extractedMessage = "No se pudo eliminar el sanitario. Es posible que esté asignado a servicios activos. Revise las asignaciones actuales.";
    } else {
      extractedMessage = fallbackMessage || "Error en la operación. El recurso puede tener dependencias activas que impiden su eliminación.";
    }
  }

  // Filtrar otros mensajes internos de Next.js/React que no son útiles para el usuario
  const internalPatterns = [
    /digest:/i,
    /The server could not finish this Suspense boundary/i,
    /This error happened while generating the page/i,
    /Network request failed/i,
    /Failed to fetch/i,
  ];

  const isInternalError = internalPatterns.some((pattern) =>
    pattern.test(extractedMessage)
  );

  if (isInternalError) {
    // Si es un error interno, usar el mensaje de fallback o uno genérico
    extractedMessage =
      fallbackMessage ||
      "Error de conexión con el servidor. Intenta nuevamente.";
  }

  // Limpiar el mensaje de caracteres extraños
  extractedMessage = extractedMessage
    .replace(/"/g, "")
    .replace(/\n/g, " ")
    .trim();

  return extractedMessage;
}

/**
 * Hook personalizado para manejar errores en componentes React
 */
export function useErrorHandler() {
  return {
    handleError: (
      error: unknown,
      context: string,
      fallbackMessage?: string
    ) => {
      return handleSmartError(error, context, fallbackMessage);
    },
    logError: (context: string, error: unknown, additionalInfo?: unknown) => {
      errorLogger.log(context, error, additionalInfo);
    },
  };
}

/**
 * Verifica si un error es de red/conectividad
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (
      errorObj.code === "NETWORK_ERROR" ||
      errorObj.name === "NetworkError" ||
      (typeof errorObj.message === "string" &&
        (errorObj.message.includes("network") ||
          errorObj.message.includes("fetch") ||
          errorObj.message.includes("connection")))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica si un error es de autenticación
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (
      errorObj.statusCode === 401 ||
      errorObj.status === 401 ||
      (typeof errorObj.message === "string" &&
        (errorObj.message.includes("unauthorized") ||
          errorObj.message.includes("token") ||
          errorObj.message.includes("authentication")))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Procesa errores específicamente para toasts
 */
export function processErrorForToast(error: unknown, context: string) {
  const message = handleSmartError(error, context);

  // Determinar el tipo de error para personalizar el toast
  const toastConfig = {
    title: "Error",
    description: message,
    duration: 5000,
  };

  if (isNetworkError(error)) {
    toastConfig.title = "Error de Conexión";
    toastConfig.description =
      "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    toastConfig.duration = 7000;
  } else if (isAuthError(error)) {
    toastConfig.title = "Error de Autenticación";
    toastConfig.description =
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
    toastConfig.duration = 8000;
  }

  return toastConfig;
}
