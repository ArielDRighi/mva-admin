'use client'

import { ListadoTabla } from "@/components/ui/local/ListadoTabla";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/types/types";
import { TableCell } from "../ui/table";

export default function ListadoClientesComponent({ data }: { data: Cliente[] }) {
  return (
    <ListadoTabla
      title="Listado de Clientes"
      data={data}
      itemsPerPage={10}
      searchableKeys={["nombre", "cuit", "email"]}
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
