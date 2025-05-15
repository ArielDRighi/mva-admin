import { getAllContractualConditions } from "@/app/actions/contractualConditions";
import ListadoCondicionesContractualesComponent from "@/components/sections/ListadoCondicionesContractualesComponent";

export default async function ListadoCondicionesContractualesPage() {
  const condicionesContractuales = await getAllContractualConditions();
  console.log("condicionesContractuales", condicionesContractuales);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoCondicionesContractualesComponent
          data={condicionesContractuales.items}
          totalItems={condicionesContractuales.total}
          currentPage={condicionesContractuales.page}
          itemsPerPage={15}
        />
      </div>
    </main>
  );
}
