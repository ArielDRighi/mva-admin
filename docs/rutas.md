# 📍 Rutas de la Aplicación

Este documento describe la estructura de rutas de la aplicación, organizada según la arquitectura de **Next.js**.

---

## 📁 Estructura de Rutas

| Ruta | Título | Descripción |
|------|--------|-------------|
| `/login` | **Iniciar sesión** | Ruta visible solo si el usuario no está autenticado. Impide acceso a otras secciones hasta iniciar sesión. |
| `/dashboard` | **Dashboard** | Página de inicio para usuarios administradores una vez logueados. |
| `/dashboard-employee` | **Dashboard Empleado** | Página de inicio exclusiva para empleados luego de iniciar sesión. |

---

## 🏗 Metadatos de las Páginas  

Cada página define metadatos (`metadata` en `app/` o `Head` en `pages/`).  

Ejemplo en Next.js 13+ con `app/`:

```tsx
export const metadata = {
  title: "Dashboard - Nombre de la Empresa",
  description: "Panel principal de administración.",
};
```

✍ **Última actualización:** _(2025-04-19)_  
🚀 **Mantenido por:** _(Ignacio Lopez)_

---