import { toast } from "sonner";
import { createAuthHeaders } from "./actions";
import { isTokenExpiring, refreshAuthToken } from "./tokenUtils";
import { getCookie, deleteCookie } from "cookies-next";

interface InterceptorConfig {
  enableLogging?: boolean;
  enableToasts?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface ErrorContext {
  file?: string;
  endpoint: string;
  method: string;
  statusCode?: number;
  timestamp: string;
  userAgent: string;
  url: string;
}

class EnhancedFetchInterceptor {
  private config: InterceptorConfig;
  private originalFetch: typeof fetch;

  constructor(config: InterceptorConfig = {}) {
    this.config = {
      enableLogging: true,
      enableToasts: true,
      enableRetry: false,
      maxRetries: 3,
      ...config,
    };
    this.originalFetch = globalThis.fetch;
    this.setupInterceptor();
  }

  private setupInterceptor() {
    globalThis.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const startTime = Date.now();
      let url: string;

      // Extraer URL y método
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else {
        url = input.url;
      }

      const method = init?.method || "GET";

      // Contexto del error
      const errorContext: ErrorContext = {
        endpoint: this.extractEndpoint(url),
        method: method.toUpperCase(),
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : "Server",
        url: typeof window !== "undefined" ? window.location.href : url,
      };

      try {
        // Ejecutar petición original
        const response = await this.originalFetch(input, init);
        const duration = Date.now() - startTime;

        // Log de peticiones exitosas
        if (this.config.enableLogging && response.ok) {
          console.log(
            `✅ ${method.toUpperCase()} ${url} - ${
              response.status
            } (${duration}ms)`
          );
        }

        // Si no es exitosa, manejar error
        if (!response.ok) {
          await this.handleErrorResponse(
            response.clone(),
            errorContext,
            duration
          );
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.handleNetworkError(error, errorContext, duration);
        throw error;
      }
    };
  }

  private async handleErrorResponse(
    response: Response,
    context: ErrorContext,
    duration: number
  ) {
    const statusCode = response.status;
    const errorMessage = `Error ${statusCode}`;
    let serverMessage = "";

    // Intentar extraer mensaje del servidor
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        serverMessage = errorData.message || errorData.error || "";
      } else {
        serverMessage = await response.text();
      }
    } catch (e) {
      console.warn("No se pudo extraer mensaje del servidor:", e);
    }

    // Crear mensaje detallado
    const detailedMessage = this.createDetailedErrorMessage(
      serverMessage || errorMessage,
      { ...context, statusCode },
      duration
    );

    // Log del error
    if (this.config.enableLogging) {
      console.group(`🚨 HTTP ${statusCode} Error`);
      console.error("📋 Detalles:", {
        status: statusCode,
        endpoint: context.endpoint,
        method: context.method,
        serverMessage,
        duration: `${duration}ms`,
        timestamp: context.timestamp,
      });
      console.error("🔗 URL completa:", response.url);
      console.error("📱 User Agent:", context.userAgent);
      console.groupEnd();
    }

    // Mostrar toast
    if (this.config.enableToasts) {
      this.showErrorToast(detailedMessage, statusCode);
    }
  }

  private handleNetworkError(
    error: unknown,
    context: ErrorContext,
    duration: number
  ) {
    const errorMessage =
      error instanceof Error ? error.message : "Error de red desconocido";

    const detailedMessage = this.createDetailedErrorMessage(
      errorMessage,
      { ...context, statusCode: 0 },
      duration
    );

    // Log del error
    if (this.config.enableLogging) {
      console.group("🚨 Network Error");
      console.error("📋 Detalles:", {
        error: errorMessage,
        endpoint: context.endpoint,
        method: context.method,
        duration: `${duration}ms`,
        timestamp: context.timestamp,
      });
      console.error("🌐 Contexto:", context);
      console.groupEnd();
    }

    // Mostrar toast
    if (this.config.enableToasts) {
      this.showErrorToast(detailedMessage, 0);
    }
  }

  private createDetailedErrorMessage(
    originalMessage: string,
    context: ErrorContext & { statusCode: number },
    duration: number
  ): string {
    const lines = [
      originalMessage || "Error en la petición",
      "",
      `📁 Interceptor: Red/HTTP`,
      `🔗 Endpoint: ${context.endpoint}`,
      `📝 Método: ${context.method}`,
      `⏰ Duración: ${duration}ms`,
      `⏰ Tiempo: ${new Date(context.timestamp).toLocaleString("es-ES")}`,
    ];

    if (typeof window !== "undefined") {
      lines.push(`🌐 Página: ${new URL(context.url).pathname}`);
    }

    if (context.statusCode > 0) {
      lines.splice(4, 0, `❌ Código: ${context.statusCode}`);
    } else {
      lines.splice(4, 0, `❌ Tipo: Error de conectividad`);
    }

    return lines.join("\n");
  }

  private showErrorToast(message: string, statusCode: number) {
    const title =
      statusCode >= 500
        ? "🚨 Error del Servidor"
        : statusCode >= 400
        ? "⚠️ Error de Cliente"
        : statusCode === 0
        ? "🌐 Error de Conexión"
        : "❌ Error de Red";

    toast.error(title, {
      description: message,
      duration: statusCode >= 500 ? 12000 : statusCode === 0 ? 8000 : 6000,
    });
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Extraer la parte de la API
      const apiMatch = pathname.match(/\/api\/(.+)/);
      if (apiMatch) {
        return `/api/${apiMatch[1]}`;
      }

      return pathname;
    } catch {
      return url;
    }
  }

  public restore() {
    globalThis.fetch = this.originalFetch;
  }
}

// Función original mantenida para compatibilidad
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Si no estamos en el cliente, usar fetch normal con los headers de autenticación
  if (typeof window === "undefined") {
    const headers = await createAuthHeaders();
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  // En el cliente, manejar el refresh del token automáticamente
  try {
    // Obtener el token actual
    const currentToken = getCookie("token") as string | undefined;

    // Verificar si el token está por expirar y refrescarlo si es necesario
    if (currentToken && isTokenExpiring(currentToken)) {
      console.log("Token está por expirar, intentando refrescar...");
      const refreshed = await refreshAuthToken();

      if (!refreshed) {
        console.error("No se pudo refrescar el token, redirigiendo al login");
        deleteCookie("token");
        deleteCookie("user");
        window.location.href = "/login";
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
      }
    }

    // Obtener headers actualizados
    const headers = await createAuthHeaders();

    // Realizar la petición con headers actualizados
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  } catch (error) {
    console.error("Error en fetchWithAuth:", error);
    throw error;
  }
}

// Funciones para inicializar el interceptor mejorado
export function setupEnhancedFetchInterceptor(config?: InterceptorConfig) {
  if (typeof globalThis !== "undefined") {
    return new EnhancedFetchInterceptor(config);
  }
  return null;
}

// Función para uso en desarrollo
export function enableDetailedNetworkLogging() {
  return setupEnhancedFetchInterceptor({
    enableLogging: true,
    enableToasts: true,
    enableRetry: false,
  });
}

// Función para producción (menos verbose)
export function enableProductionInterceptor() {
  return setupEnhancedFetchInterceptor({
    enableLogging: false,
    enableToasts: true,
    enableRetry: false,
  });
}
