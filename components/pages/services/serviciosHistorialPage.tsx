import { getServices } from "@/app/actions/services";
import ListadoServiciosHistorialComponent from "@/components/sections/ListadoServiciosHistorialComponent";

export default async function HistorialServiciosPage() {
  const allServices = await getServices();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoServiciosHistorialComponent
          data={allServices.data || []}
          totalItems={allServices.totalItems || 0}
          currentPage={allServices.currentPage || 1}
          itemsPerPage={15} // Estamos usando 15 como valor fijo para itemsPerPage
        />
      </div>
    </main>
  );
}
