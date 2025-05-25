import { ClientsImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";
import React from "react";

const UsuariosPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="max-w-4xl mx-auto mt-12 px-4 space-y-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Usuarios
        </h2>
        <InfoCard
          href="/admin/dashboard/usuarios/listado"
          imgSrc={ClientsImg}
          imgAlt="Icono de usuarios"
          title="Gestión de usuarios"
          description="Agregá, editá o eliminá fácilmente tus usuarios desde esta sección."
        />
      </section>
    </main>
  );
};

export default UsuariosPage;
