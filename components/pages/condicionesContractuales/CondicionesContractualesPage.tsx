import { CondicionesContractualesPageImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";
import React from "react";

const CondicionesContractualesPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Condiciones Contractuales
        </h2>
        <InfoCard
          href="/admin/dashboard/condiciones-contractuales/listado"
          imgSrc={CondicionesContractualesPageImg}
          imgAlt="Icono de Condiciones Contractuales"
          title="Listado de Condiciones Contractuales"
          description="Consultá el listado completo de condiciones contractuales disponibles y gestioná su información."
        />
        <InfoCard
          href="/admin/dashboard/condiciones-contractuales/crear"
          imgSrc={CondicionesContractualesPageImg}
          imgAlt="Icono de Condiciones Contractuales"
          title="Crear de Condiciones Contractuales"
          description="Crea nuevas condiciones contractuales para gestionar la información de los contratos."
        />
      </section>
    </main>
  );
};

export default CondicionesContractualesPage;
