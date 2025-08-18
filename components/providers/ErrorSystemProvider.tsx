"use client";

import { useEffect } from "react";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary";
import { setupEnhancedFetchInterceptor } from "@/lib/enhancedFetchInterceptor";

interface ErrorSystemProviderProps {
  children: React.ReactNode;
  environment?: "development" | "production";
}

export function ErrorSystemProvider({ 
  children, 
  environment = "development" 
}: ErrorSystemProviderProps) {
  useEffect(() => {
    // Configurar interceptor según el ambiente
    const interceptorConfig = {
      enableLogging: environment === "development",
      enableToasts: true,
      enableRetry: false,
    };

    const interceptor = setupEnhancedFetchInterceptor(interceptorConfig);

    // Log de inicialización
    if (environment === "development") {
      console.log("🚀 Sistema de manejo de errores mejorado inicializado");
      console.log("📋 Configuración:", interceptorConfig);
    }

    // Cleanup al desmontar
    return () => {
      if (interceptor) {
        interceptor.restore();
      }
    };
  }, [environment]);

  // Manejar errores no capturados
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("🚨 Promise rechazada no manejada:", event.reason);
      
      // Crear contexto de error
      const errorContext = {
        type: "Unhandled Promise Rejection",
        reason: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      console.group("🔍 Detalles del error no manejado");
      console.table(errorContext);
      console.groupEnd();

      // Prevenir el log por defecto del browser
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error("🚨 Error de JavaScript no manejado:", event.error);
      
      const errorContext = {
        type: "Unhandled JavaScript Error",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      console.group("🔍 Detalles del error de JavaScript");
      console.table(errorContext);
      console.groupEnd();
    };

    // Agregar listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Cleanup
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      {children}
    </GlobalErrorBoundary>
  );
}
