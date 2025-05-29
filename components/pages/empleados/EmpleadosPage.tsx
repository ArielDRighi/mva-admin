import { EmpleadosImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";
import React from "react";

const EmpleadosPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Empleados
        </h2>
        <InfoCard
          href="/admin/dashboard/empleados/listado"
          imgSrc={EmpleadosImg}
          imgAlt="Icono de empleados"
          title="Listado de Empleados"
          description="Agregá, editá o eliminá fácilmente tus empleados desde esta sección."
        />
        
        <InfoCard
          href="/admin/dashboard/empleados/licencias"
          imgSrc={EmpleadosImg}
          imgAlt="Licencias de empleados"
          title="Licencias de Empleados"
          description="Gestiona las ausencias, vacaciones y licencias de tus empleados."
        />
        
        <InfoCard
          href="/admin/dashboard/empleados/licencias_conducir"
          imgSrc={EmpleadosImg}
          imgAlt="Licencias de conducir"
          title="Licencias de Conducir"
          description="Gestiona y actualiza la información de licencias de conducir de tus empleados."
        />
        
        <InfoCard
          href="/admin/dashboard/empleados/contactos-emergencia"
          imgSrc={EmpleadosImg}
          imgAlt="Contactos de emergencia"
          title="Contactos de Emergencia"
          description="Administra los contactos de emergencia de tus empleados."
        />
      </section>
    </main>
  );
};

export default EmpleadosPage;
