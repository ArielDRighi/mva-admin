import { getServices } from "@/app/actions/services";
import ListadoServiciosHistorialComponent from "@/components/sections/ListadoServiciosHistorialComponent";

export default async function HistorialServiciosPage({
  searchParams,
}: {
  searchParams?: { page?: string; search?: string };
}) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";

  try {
    const services = await getServices(page, 15, search);

    return (
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 grid-cols-1">
          <ListadoServiciosHistorialComponent
            data={services.data || []}
            totalItems={services.totalItems || 0}
            currentPage={services.currentPage || 1}
            itemsPerPage={15} // Estamos usando 15 como valor fijo para itemsPerPage
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error al cargar el historial de servicios:", error);
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <h3 className="text-lg font-medium">Error</h3>
          <p>No se pudo cargar el historial de servicios.</p>
        </div>
      </main>
    );
  }
}
