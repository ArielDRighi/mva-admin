import React from "react";
import { InfoCard } from "../ui/local/InfoCard";
import { ClientsImg } from "@/assets/ImgDatabase";

const SanitariosPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sanitarios
        </h2>
        <InfoCard
          href="/dashboard/sanitarios/listado"
          imgSrc={ClientsImg}
          imgAlt="Icono de sanitarios"
          title="Gestión de Sanitarios"
          description="Consultá el listado completo de sanitarios disponibles y gestioná su información."
        />
        <InfoCard
          href="/dashboard/sanitarios/mantenimiento"
          imgSrc={ClientsImg}
          imgAlt="Icono de sanitarios en mantenimiento"
          title="Gestión de Sanitarios en Mantenimiento"
          description="Supervisá y administrá los sanitarios que se encuentran actualmente en mantenimiento."
        />
      </section>
    </main>
  );
};

export default SanitariosPage;
