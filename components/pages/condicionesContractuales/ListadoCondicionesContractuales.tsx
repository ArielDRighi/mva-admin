import { getAllContractualConditions } from "@/app/actions/contractualConditions";
import ListadoCondicionesContractualesComponent from "@/components/sections/ListadoCondicionesContractualesComponent";

// Definimos la interfaz para la condición contractual que espera el componente
interface CondicionContractual {
  condicionContractualId: number;
  condiciones_especificas: string;
  estado: string;
  fecha_fin: string;
  fecha_inicio: string;
  periodicidad: string;
  tarifa: string;
  clientId?: number;
  cliente?: {
    nombre?: string;
    telefono?: string;
    email?: string;
  };
}

// Definimos la interfaz para la respuesta de la API
interface ContractualConditionsResponse {
  items: CondicionContractual[];
  total: number;
  page: number;
  limit: number;
}

export default async function ListadoCondicionesContractualesPage() {
  const condicionesContractuales = await getAllContractualConditions() as ContractualConditionsResponse;
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
