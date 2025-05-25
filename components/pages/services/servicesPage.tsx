import { ServiciosImg } from "@/assets/ImgDatabase";
import { InfoCard } from "@/components/ui/local/InfoCard";
import React from "react";

const ServiciosPage = () => {
  const serviceOptions = [
    {
      id: "crear",
      href: "/admin/dashboard/servicios/crear",
      imgSrc: ServiciosImg,
      imgAlt: "Icono de creación de servicios",
      title: "Creación de Servicios",
      description:
        "Crea nuevos servicios definiendo sus detalles, horarios y asignaciones.",
    },
    {
      id: "activos",
      href: "/admin/dashboard/servicios/activos",
      imgSrc: ServiciosImg,
      imgAlt: "Icono de servicios activos",
      title: "Servicios Activos",
      description:
        "Gestiona los servicios en curso y pendientes. Actualiza su estado y seguimiento.",
    },
    {
      id: "historial",
      href: "/admin/dashboard/servicios/historial",
      imgSrc: ServiciosImg,
      imgAlt: "Icono de historial de servicios",
      title: "Historial de Servicios",
      description:
        "Revisa el registro histórico de todos los servicios completados y cancelados.",
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
      <section className="w-full max-w-4xl mx-auto mt-12 px-4 space-y-6">
        <header>
          <h1 className="text-center text-3xl font-bold text-gray-900 mb-6">
            Gestión de Servicios
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Selecciona una opción para administrar los servicios del sistema
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceOptions.map((option) => (
            <InfoCard
              key={option.id}
              href={option.href}
              imgSrc={option.imgSrc}
              imgAlt={option.imgAlt}
              title={option.title}
              description={option.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ServiciosPage;
