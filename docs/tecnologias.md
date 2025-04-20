# 📌 Tecnologías Utilizadas en el Proyecto

Este documento describe las tecnologías utilizadas en el desarrollo del proyecto y cómo agregar nuevas herramientas en caso de ser necesario.

## 🚀 Tecnologías Actuales

### 1. [Next.js](https://nextjs.org/)
**Descripción:** Framework de React para desarrollo de aplicaciones web modernas con renderizado híbrido (SSR/SSG).  
**Instalación:**
```bash
npx create-next-app@latest mi-proyecto
cd mi-proyecto
npm install
```

### 2. [React](https://react.dev/)
**Descripción:** Biblioteca para construir interfaces de usuario interactivas mediante componentes reutilizables.  
**Instalación:**
```bash
npm install react react-dom
```

### 3. [react-hook-form](https://react-hook-form.com/)
**Descripción:** Biblioteca para manejar formularios en React de manera eficiente y con mejor rendimiento.  
**Instalación:**
```bash
npm install react-hook-form
```
**Ejemplo de uso:**
```tsx
import { useForm } from "react-hook-form";

const MyForm = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nombre")} placeholder="Nombre" />
      <button type="submit">Enviar</button>
    </form>
  );
};
```

### 4. [@hookform/resolvers](https://react-hook-form.com/get-started/#SchemaValidation)
**Descripción:** Proporciona validadores de esquema para React Hook Form con librerías como Zod.  
**Instalación:**
```bash
npm install @hookform/resolvers
```

### 5. [Zod](https://zod.dev/)
**Descripción:** Biblioteca de validación de datos basada en TypeScript.  
**Instalación:**
```bash
npm install zod
```
**Ejemplo de validación con Zod:**
```tsx
import { z } from "zod";

const schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de email inválido"),
});
```

### 6. [@radix-ui/react-label](https://www.radix-ui.com/primitives/docs/components/label)
**Descripción:** Componente accesible de etiqueta para formularios en aplicaciones React.  
**Instalación:**
```bash
npm install @radix-ui/react-label
```

### 7. [@radix-ui/react-slot](https://www.radix-ui.com/primitives/docs/components/slot)
**Descripción:** Utilidad para componer componentes de forma más flexible utilizando slots.  
**Instalación:**
```bash
npm install @radix-ui/react-slot
```

### 8. [class-variance-authority (cva)](https://cva.style/)
**Descripción:** Utilidad para definir variantes de clases CSS (especialmente con Tailwind) de forma declarativa.  
**Instalación:**
```bash
npm install class-variance-authority
```

### 9. [clsx](https://github.com/lukeed/clsx)
**Descripción:** Utilidad liviana para combinar condicionalmente clases CSS.  
**Instalación:**
```bash
npm install clsx
```

### 10. [tailwind-merge](https://tailwind-merge.vercel.app/)
**Descripción:** Herramienta para fusionar clases de Tailwind evitando conflictos como `px-2` y `px-4`.  
**Instalación:**
```bash
npm install tailwind-merge
```

### 11. [tw-animate-css](https://github.com/Jake-Short/tw-animate-css)
**Descripción:** Plugin que permite usar animaciones predefinidas tipo Animate.css con clases Tailwind.  
**Instalación:**
```bash
npm install tw-animate-css
```

### 12. [cookies-next](https://www.npmjs.com/package/cookies-next)
**Descripción:** Manejo sencillo de cookies en aplicaciones Next.js del lado del cliente y servidor.  
**Instalación:**
```bash
npm install cookies-next
```

### 13. [lucide-react](https://lucide.dev/)
**Descripción:** Colección de íconos SVG personalizables para React.  
**Instalación:**
```bash
npm install lucide-react
```

## ➕ Agregar Nuevas Tecnologías

Cuando se agregue una nueva tecnología, documentarla siguiendo este formato:
1. **Nombre de la tecnología** y enlace oficial.  
2. **Breve descripción** de su propósito y beneficios.  
3. **Comando de instalación** correspondiente.  
4. **Ejemplo de uso o configuración inicial** si aplica.

---

📝 **Última actualización:** _(2025-04-19)_  
🚀 **Mantenido por:** _(Ignacio Lopez)_