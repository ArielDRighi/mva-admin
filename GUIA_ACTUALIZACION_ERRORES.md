# Guía de Actualización del Manejo de Errores

## Resumen de Cambios Implementados

Se ha mejorado el manejo de errores en toda la aplicación para incluir información detallada sobre:

- 📁 **Archivo**: Ubicación exacta del error
- 🔗 **Endpoint**: Ruta del backend utilizada
- 📝 **Método**: Tipo de petición HTTP (GET, POST, PUT, DELETE)
- ❌ **Código**: Código de estado HTTP del error

## Archivos Actualizados

### ✅ Completamente Actualizados

- `lib/errors.ts` - Funciones base de manejo de errores
- `lib/actions.ts` - Funciones auxiliares de servidor
- `app/actions/clientes.ts` - Gestión de clientes
- `app/actions/empleados.ts` - Gestión de empleados (parcial)
- `app/actions/users.ts` - Gestión de usuarios (parcial)

### 🔄 Pendientes de Actualizar

- `app/actions/services.ts` - Gestión de servicios (muchas funciones)
- `app/actions/vehiculos.ts` - Gestión de vehículos
- `app/actions/sanitarios.ts` - Gestión de baños químicos
- `app/actions/mantenimiento_vehiculos.ts` - Mantenimiento de vehículos
- `app/actions/LicenciasConducir.ts` - Licencias de conducir
- `app/actions/LicenciasEmpleados.ts` - Licencias de empleados
- `app/actions/salaryAdvanceActions.ts` - Adelantos salariales
- `app/actions/contactosDeEmergencia.ts` - Contactos de emergencia
- `app/actions/contactosEmergenciaAdmin.ts` - Contactos admin
- `app/actions/contractualConditions.ts` - Condiciones contractuales
- `app/actions/clothing.ts` - Gestión de vestimenta

## Patrón de Actualización

### Para `handleApiResponse`:

**ANTES:**

```typescript
return handleApiResponse(res, "Error al obtener datos");
```

**DESPUÉS:**

```typescript
return handleApiResponse(res, "Error al obtener datos", {
  file: "app/actions/[NOMBRE_ARCHIVO].ts",
  endpoint: "/api/[ENDPOINT]",
  method: "GET|POST|PUT|DELETE",
});
```

### Para `createServerAction`:

**ANTES:**

```typescript
export const miFuncion = createServerAction(async (param) => {
  // lógica
  return handleApiResponse(res, "Error");
}, "Error en la operación");
```

**DESPUÉS:**

```typescript
export const miFuncion = createServerAction(
  async (param) => {
    // lógica
    return handleApiResponse(res, "Error", {
      file: "app/actions/[ARCHIVO].ts",
      endpoint: "/api/[ENDPOINT]",
      method: "[MÉTODO]",
    });
  },
  "Error en la operación",
  {
    file: "app/actions/[ARCHIVO].ts",
    endpoint: "/api/[ENDPOINT]",
    method: "[MÉTODO]",
  }
);
```

## Mapeo de Endpoints por Archivo

| Archivo                       | Endpoint Base                   | Métodos Comunes        |
| ----------------------------- | ------------------------------- | ---------------------- |
| `clientes.ts`                 | `/api/clients`                  | GET, POST, PUT, DELETE |
| `empleados.ts`                | `/api/employees`                | GET, POST, PUT, DELETE |
| `services.ts`                 | `/api/services`                 | GET, POST, PUT, DELETE |
| `vehiculos.ts`                | `/api/vehicles`                 | GET, POST, PUT, DELETE |
| `users.ts`                    | `/api/users`                    | GET, POST, PUT, DELETE |
| `sanitarios.ts`               | `/api/chemical-toilets`         | GET, POST, PUT, DELETE |
| `mantenimiento_vehiculos.ts`  | `/api/vehicle-maintenance`      | GET, POST, PUT, DELETE |
| `LicenciasConducir.ts`        | `/api/licenses`                 | GET, POST, PUT, DELETE |
| `LicenciasEmpleados.ts`       | `/api/employee-licenses`        | GET, POST, PUT, DELETE |
| `salaryAdvanceActions.ts`     | `/api/salary-advances`          | GET, POST, PUT, DELETE |
| `contactosDeEmergencia.ts`    | `/api/emergency-contacts`       | GET, POST, PUT, DELETE |
| `contactosEmergenciaAdmin.ts` | `/api/emergency-contacts-admin` | GET, POST, PUT, DELETE |
| `contractualConditions.ts`    | `/api/contractual-conditions`   | GET, POST, PUT, DELETE |
| `clothing.ts`                 | `/api/clothing`                 | GET, POST, PUT, DELETE |

## Endpoints Específicos Comunes

### Patrones de URL

- Lista general: `/api/[recurso]`
- Por ID: `/api/[recurso]/:id`
- Con paginación: `/api/[recurso]?page=X&limit=Y`
- Con búsqueda: `/api/[recurso]?search=término`
- Por rango de fechas: `/api/[recurso]/date-range?startDate=X&endDate=Y`
- Estados específicos: `/api/[recurso]/[estado]` (ej: `/api/services/today`)

## Formato de Mensaje de Error

Cuando se implementa correctamente, los mensajes de error aparecerán con este formato:

```
[Mensaje del backend si existe, sino mensaje por defecto]

📁 Archivo: app/actions/[archivo].ts
🔗 Endpoint: /api/[endpoint]
📝 Método: [GET|POST|PUT|DELETE]
❌ Código: [código HTTP]
```

## Próximos Pasos

1. **Aplicar el patrón** a todos los archivos listados como "pendientes"
2. **Verificar** que cada endpoint coincida con la documentación del backend
3. **Probar** los mensajes de error en desarrollo
4. **Documentar** cualquier endpoint especial o poco común

## Notas Importantes

- ⚠️ **Verificar endpoints**: Algunos endpoints pueden tener rutas específicas
- 🔍 **Revisar métodos**: Asegurarse de que el método HTTP sea correcto
- 📝 **Consistencia**: Mantener el formato de nombres de archivo consistente
- 🧪 **Probar**: Verificar que los errores se muestren correctamente en la UI

---

_Última actualización: ${new Date().toLocaleDateString('es-ES')}_
