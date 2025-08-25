/**
 * Utilidades para validación y limpieza de campos de formularios
 * Incluye funciones para limpiar automáticamente espacios en emails
 */

import { z } from "zod";

/**
 * Esquema de validación para email que automáticamente limpia espacios
 * Esta función se puede reutilizar en cualquier formulario
 * 
 * @param customMessage Mensaje de error personalizado (opcional)
 * @returns Esquema de validación de zod para email
 */
export function createEmailSchema(customMessage?: string) {
  return z
    .string()
    .min(1, "El email es obligatorio")
    .transform((email) => email.trim()) // Elimina espacios al principio y al final
    .pipe(
      z
        .string()
        .email(customMessage || "Formato de email inválido")
        .transform((email) => email.toLowerCase()) // Convierte a minúsculas para consistencia
    );
}

/**
 * Esquema más flexible para emails que también limpia espacios internos
 * Útil para casos donde el usuario puede haber puesto espacios accidentales
 * 
 * @param customMessage Mensaje de error personalizado (opcional)
 * @returns Esquema de validación de zod para email
 */
export function createStrictEmailSchema(customMessage?: string) {
  return z
    .string()
    .min(1, "El email es obligatorio")
    .transform((email) => {
      // Elimina TODOS los espacios (al principio, al final y en el medio)
      return email.replace(/\s+/g, '');
    })
    .pipe(
      z
        .string()
        .email(customMessage || "Formato de email inválido")
        .transform((email) => email.toLowerCase())
    );
}

/**
 * Esquema personalizado para emails con regex personalizada (como en ListadoClientes)
 * Mantiene la validación original pero añade limpieza de espacios
 * 
 * @param customMessage Mensaje de error personalizado (opcional)
 * @returns Esquema de validación de zod para email
 */
export function createClientEmailSchema(customMessage?: string) {
  return z
    .string()
    .min(1, "El email es obligatorio")
    .transform((email) => email.replace(/\s+/g, '')) // Elimina todos los espacios
    .pipe(
      z
        .string()
        .regex(
          /^[^@]+@[^@]+\.[^@]+$/,
          customMessage || "Formato de email inválido, ejemplo: contacto@empresa.com"
        )
        .transform((email) => email.toLowerCase())
    );
}

/**
 * Función helper para limpiar strings de manera general
 * Útil para otros campos que también pueden tener espacios no deseados
 * 
 * @param trimOnly Si true, solo elimina espacios al principio y final. Si false, elimina todos los espacios
 * @returns Esquema de transformación de zod
 */
export function createCleanStringSchema(trimOnly: boolean = true) {
  return z
    .string()
    .transform((str) => {
      if (trimOnly) {
        return str.trim();
      } else {
        return str.replace(/\s+/g, '');
      }
    });
}

/**
 * Validador para CUIT que también limpia espacios y guiones
 * Útil para mantener formato consistente
 * 
 * @returns Esquema de validación de zod para CUIT
 */
export function createCUITSchema() {
  return z
    .string()
    .min(1, "El CUIT es obligatorio")
    .transform((cuit) => {
      // Elimina espacios, guiones y cualquier carácter no numérico excepto guiones para el formato
      return cuit.replace(/\s+/g, '');
    })
    .pipe(
      z
        .string()
        .refine(
          (cuit) => {
            // Permite formato XX-XXXXXXXX-X o 11 dígitos seguidos
            return /^\d{2}-\d{8}-\d{1}$/.test(cuit) || /^\d{11}$/.test(cuit);
          },
          {
            message: "Formato de CUIT inválido. Use XX-XXXXXXXX-X o 11 dígitos seguidos",
          }
        )
    );
}

/**
 * Validador para teléfonos que limpia espacios y caracteres especiales
 * 
 * @returns Esquema de validación de zod para teléfono
 */
export function createPhoneSchema() {
  return z
    .string()
    .min(1, "El teléfono es obligatorio")
    .transform((phone) => {
      // Elimina espacios pero mantiene guiones, paréntesis y signos + para formatos internacionales
      return phone.replace(/\s+/g, '');
    })
    .pipe(
      z
        .string()
        .min(7, "El teléfono debe tener al menos 7 caracteres")
        .max(20, "El teléfono no puede tener más de 20 caracteres")
    );
}

/**
 * Ejemplo de uso en un componente:
 * 
 * const myFormSchema = z.object({
 *   email: createEmailSchema("Email de contacto inválido"),
 *   cuit: createCUITSchema(),
 *   telefono: createPhoneSchema(),
 *   nombre: createCleanStringSchema(true), // Solo trim
 * });
 */
