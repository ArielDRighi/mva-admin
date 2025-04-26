"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/types/types";
import { TableCell } from "../ui/table";
import { useEffect, useState } from "react";
import { getClients } from "@/app/actions/clientes";

export default function ListadoClientesComponent({
  data, // Prop recibida
  totalItems, // Prop recibida
  currentPage, // Prop recibida
  itemsPerPage, // Prop recibida
}: {
  data: Cliente[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializamos los estados con los valores iniciales de las props
  const [clients, setClients] = useState<Cliente[]>(data); // Inicializar con los datos pasados como prop
  const [total, setTotal] = useState<number>(totalItems); // Inicializar con totalItems
  const [page, setPage] = useState<number>(currentPage); // Inicializar con currentPage
  const [loading, setLoading] = useState<boolean>(false); // Para saber si estamos cargando los datos

  // handlePageChange y handleSearchChange corregidos
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page)); // Cambia la página
    router.replace(`?${params.toString()}`); // Reemplaza la URL sin recargar
  };

  const handleSearchChange = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", search); // Cambia el término de búsqueda
    params.set("page", "1"); // Resetea la página a la primera
    router.replace(`?${params.toString()}`); // Reemplaza la URL sin recargar
  };

  // Usar un effect para recargar los datos cuando cambia la página o la búsqueda
  useEffect(() => {
    const fetchData = async () => {
      const currentPage = Number(searchParams.get("page")) || 1;
      const search = searchParams.get("search") || "";

      setLoading(true); // Establecemos que estamos cargando los datos

      try {
        const fetchedClients = await getClients(
          currentPage,
          itemsPerPage,
          search
        );
        setClients(fetchedClients.items); // Asegúrate de acceder a los datos correctamente (ej: `clients`)
        setTotal(fetchedClients.total); // Total de elementos (según la API)
        setPage(fetchedClients.page); // Actualizar la página actual
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      } finally {
        setLoading(false); // Finalizamos la carga
      }
    };

    fetchData();
  }, [searchParams, itemsPerPage]); // Este useEffect se ejecutará cuando los parámetros de búsqueda o la página cambien

  if (loading) {
    // Mostrar algo mientras se cargan los datos
    return <div>Loading...</div>;
  }

  if (!clients || clients.length === 0) {
    // Si no tenemos datos (ni iniciales ni actualizados), mostrar un mensaje
    return <div>No hay clientes disponibles.</div>;
  }

  return (
    <ListadoTabla
      title="Listado de Clientes"
      data={clients} // Usar los datos obtenidos dinámicamente
      itemsPerPage={itemsPerPage}
      searchableKeys={["nombre", "cuit", "email"]}
      remotePagination
      totalItems={total} // Usar el total actualizado
      currentPage={page} // Usar la página actual
      onPageChange={handlePageChange}
      onSearchChange={handleSearchChange}
      columns={[
        { title: "Nombre", key: "nombre" },
        { title: "CUIT", key: "cuit" },
        { title: "Dirección", key: "direccion" },
        { title: "Teléfono", key: "telefono" },
        { title: "Email", key: "email" },
        { title: "Contacto", key: "contacto_principal" },
        { title: "Registro", key: "fecha_registro" },
        { title: "Estado", key: "estado" },
      ]}
      renderRow={(cliente) => (
        <>
          <TableCell className="font-medium">{cliente.nombre}</TableCell>
          <TableCell>{cliente.cuit}</TableCell>
          <TableCell>{cliente.direccion}</TableCell>
          <TableCell>{cliente.telefono}</TableCell>
          <TableCell>{cliente.email}</TableCell>
          <TableCell>{cliente.contacto_principal}</TableCell>
          <TableCell>
            {new Date(cliente.fecha_registro).toLocaleDateString("es-AR")}
          </TableCell>
          <TableCell>
            <Badge
              variant={cliente.estado === "ACTIVO" ? "default" : "outline"}
            >
              {cliente.estado}
            </Badge>
          </TableCell>
        </>
      )}
    />
  );
}
