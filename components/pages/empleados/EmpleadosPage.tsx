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
          title="Gestión de Empleados"
          description="Agregá, editá o eliminá fácilmente tus empleados desde esta sección."
        />
      </section>
    </main>
  );
};

export default EmpleadosPage;
