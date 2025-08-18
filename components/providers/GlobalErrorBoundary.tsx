"use client";

import React from "react";
import { toast } from "sonner";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Global Error Boundary caught an error:", error);
    console.error("Error info:", errorInfo);

    // Crear mensaje de error detallado
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown"
    };

    // Mostrar toast con información detallada
    toast.error("Error en la aplicación", {
      description: `
🚨 Error crítico detectado

📁 Componente: ${this.extractComponentFromStack(errorInfo.componentStack || "")}
🔗 Página: ${typeof window !== "undefined" ? window.location.pathname : "unknown"}
📝 Mensaje: ${error.message}
⏰ Tiempo: ${new Date().toLocaleString("es-ES")}
❌ Tipo: Error de renderizado de componente

Stack: ${error.stack?.split("\n")[0] || "No disponible"}
      `,
      duration: 10000,
    });

    // Log estructurado para debugging
    console.group("🔍 Error Details");
    console.table(errorDetails);
    console.groupEnd();

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  private extractComponentFromStack(componentStack: string): string {
    const lines = componentStack.split("\n");
    const componentLine = lines.find(line => line.trim().startsWith("at "));
    if (componentLine) {
      const match = componentLine.match(/at (\w+)/);
      return match ? match[1] : "Unknown Component";
    }
    return "Unknown Component";
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={this.handleReset} />;
      }

      // Fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="text-red-600 text-6xl mb-4">🚨</div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Error en la Aplicación
            </h1>
            <p className="text-red-600 mb-4">
              Se ha producido un error inesperado. Los detalles han sido registrados.
            </p>
            
            <div className="bg-red-100 p-3 rounded mb-4 text-left">
              <p className="text-sm text-red-700 font-semibold">Detalles del error:</p>
              <p className="text-xs text-red-600 mt-1">
                📁 Componente: {this.extractComponentFromStack(this.state.errorInfo?.componentStack || "")}
              </p>
              <p className="text-xs text-red-600">
                📝 Mensaje: {this.state.error?.message}
              </p>
              <p className="text-xs text-red-600">
                ⏰ Tiempo: {new Date().toLocaleString("es-ES")}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar el error boundary desde componentes funcionales
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error("🚨 Manual error report:", error);
    
    toast.error("Error detectado", {
      description: `
🚨 Error reportado manualmente

📁 Contexto: ${errorInfo?.componentStack ? "Componente React" : "Función/Hook"}
📝 Mensaje: ${error.message}
⏰ Tiempo: ${new Date().toLocaleString("es-ES")}
❌ Tipo: Error manejado manualmente

${error.stack?.split("\n").slice(0, 3).join("\n") || "Stack no disponible"}
      `,
      duration: 8000,
    });
  };
};
