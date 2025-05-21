import { ClientsImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";
import React from "react";

const ClientesPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Clientes
        </h2>
        <InfoCard
          href="/admin/dashboard/clientes/listado"
          imgSrc={ClientsImg}
          imgAlt="Icono de clientes"
          title="Gestión de Clientes"
          description="Agregá, editá o eliminá fácilmente tus clientes desde esta sección."
        />
      </section>
    </main>
  );
};

export default ClientesPage;
