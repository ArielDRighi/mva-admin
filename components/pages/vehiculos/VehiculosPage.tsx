import React from "react";
import { VehiculosImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";

const VehiculosPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Vehiculos
        </h2>
        <InfoCard
          href="/dashboard/vehiculos/listado"
          imgSrc={VehiculosImg}
          imgAlt="Icono de vehiculos"
          title="Gestión de Vehiculos"
          description="Consultá el listado completo de vehiculos disponibles y gestioná su información."
        />
        <InfoCard
          href="/dashboard/vehiculos/mantenimiento"
          imgSrc={VehiculosImg}
          imgAlt="Icono de vehiculos en mantenimiento"
          title="Gestión de Vehiculos en Mantenimiento"
          description="Supervisá y administrá los vehiculos que se encuentran actualmente en mantenimiento."
        />
      </section>
    </main>
  );
};

export default VehiculosPage;
