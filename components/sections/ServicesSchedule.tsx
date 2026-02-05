import { Clock } from "lucide-react";
import { CardHeader, CardTitle } from "../ui/card";

const MOCK_SERVICES_SCHEDULE: Record<
  string,
  {
    cliente: string;
    servicio: string;
    origen: string;
    destino: string;
    chofer: string[];
    hora: string | null;
    vehiculo: string | string[] | null;
    estado: string;
  }[]
> = {
  "2026-01-26": [
    {
      cliente: "NUEVO BUS",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["DAVALOS", "REYMUNDO", "CHOCOBAR", "SERGIO", "GARNICA", "JOSE"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "COMPLETADO",
    },
    {
      cliente: "NUEVO BUS",
      servicio: "pasajero",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["CAHEZ", "CARLOS"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "COMPLETADO",
    },
    {
      cliente: "ULOG",
      servicio: "carga",
      origen: "SALTA",
      destino: "PUERTO ROSARIO SANTA FE",
      chofer: ["SORIANO", "DARIO", "GUITIAN", "DAVID", "VACASUR", "NELSON"],
      hora: null,
      vehiculo: null,
      estado: "COMPLETADO",
    },
  ],

  "2026-01-27": [
    {
      cliente: "NUEVO BUS",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["CHOCOBAR", "ZAPANA", "GARNICA"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "COMPLETADO",
    },
    {
      cliente: "TGL",
      servicio: "carga",
      origen: "SALTA",
      destino: "POSCO",
      chofer: ["SORIANO", "EZEQUIEL", "CALPANCHAY", "ISMAEL"],
      hora: "07:00",
      vehiculo: ["CM 8 - S8", "CM 6 - S3"],
      estado: "COMPLETADO",
    },
    {
      cliente: "NUEVO BUS",
      servicio: "pasajero",
      origen: "SALTA",
      destino: "GUEMES",
      chofer: ["LAMAS", "LAZARO"],
      hora: "12:00",
      vehiculo: "C 27",
      estado: "COMPLETADO",
    },
  ],

  "2026-01-28": [
    {
      cliente: "MASTER BUS",
      servicio: "escolta",
      origen: "SALTA",
      destino: "POSCO",
      chofer: ["DAVALOS", "REYMUNDO"],
      hora: "04:30",
      vehiculo: "C 18",
      estado: "COMPLETADO",
    },
    {
      cliente: "NUEVO BUS",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["CHOCOBAR", "GARNICA", "ZAMORA"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "SIN CUMPLIR",
    },
    {
      cliente: "DERCOM",
      servicio: "escolta",
      origen: "SALTA",
      destino: "ERAMINE",
      chofer: ["DAVALOS", "JAVIER"],
      hora: "05:30",
      vehiculo: "CM 24",
      estado: "COMPLETADO",
    },
  ],

  "2026-01-29": [
    {
      cliente: "RIO TINTO",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["GARNICA", "ZAMORA", "CHOCOBAR"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "COMPLETADO",
    },
    {
      cliente: "RIO TINTO",
      servicio: "carga",
      origen: "TORZALITO - GUEMES",
      destino: "RIO TINTO",
      chofer: ["PUCA", "MAXIMILIANO"],
      hora: "07:00",
      vehiculo: "CM 19 - CARRETON",
      estado: "COMPLETADO",
    },
  ],

  "2026-01-30": [
    {
      cliente: "NUEVO BUS",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["GARNICA", "CHOCOBAR", "ZAPANA"],
      hora: "04:30",
      vehiculo: "C 30",
      estado: "PROGRAMADO",
    },
    {
      cliente: "ULOG",
      servicio: "carga",
      origen: "POCITOS",
      destino: "ERAMINE",
      chofer: ["FERREYRA", "GUILLERMO", "PUCA", "JOSE LUIS"],
      hora: "06:00",
      vehiculo: ["CM 23 - S15", "CM 20 - S16"],
      estado: "PROGRAMADO",
    },
    {
      cliente: "CONSULTRAK",
      servicio: "carga",
      origen: "BASE GVH SALTA",
      destino: "VACASUR",
      chofer: ["VACASUR", "NELSON"],
      hora: "07:00",
      vehiculo: "CM 12",
      estado: "PROGRAMADO",
    },
  ],

  "2026-01-31": [
    {
      cliente: "NUEVO BUS",
      servicio: "rescate",
      origen: "SALTA",
      destino: "RIO TINTO",
      chofer: ["DAVALOS", "REYMUNDO", "ZAPANA", "ZAMORA"],
      hora: "04:30",
      vehiculo: "C 25",
      estado: "PROGRAMADO",
    },
    {
      cliente: "MANAOS - SAN SALVADOR JUJUY",
      servicio: "carga",
      origen: "SALTA",
      destino: "SAN SALVADOR DE JUJUY",
      chofer: ["VEGA", "PEDRO", "FERREYRA", "JOSE"],
      hora: "07:00",
      vehiculo: ["CM 21 - S19", "CM 24 - S17"],
      estado: "PROGRAMADO",
    },
  ],

  "2026-02-01": [],
};

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const STATUS_STYLES: Record<string, { bg: string; border: string }> = {
  COMPLETADO: {
    bg: "bg-green-100",
    border: "border-l-green-700",
  },
  "SIN CUMPLIR": {
    bg: "bg-red-100",
    border: "border-l-red-700",
  },
  PROGRAMADO: {
    bg: "bg-orange-100",
    border: "border-l-orange-600",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-gray-100",
  border: "border-l-gray-500",
};

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function getDayName(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[date.getDay()];
}

function formatVehiculo(vehiculo: string | string[] | null) {
  if (!vehiculo) return "—";
  return Array.isArray(vehiculo) ? vehiculo.join(", ") : vehiculo;
}

function formatChofer(chofer: string[]) {
  return chofer.join(", ");
}

export const ServicesSchedule = () => {
  const dates = Object.keys(MOCK_SERVICES_SCHEDULE).sort();

  return (
    <div className="lg:col-span-3 overflow-x-auto rounded-xl bg-white py-6">
      <CardHeader className="pt-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b mb-4">
        <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Cronograma de servicios programados
        </CardTitle>
      </CardHeader>
      <div className="grid grid-cols-7 gap-2 min-w-275 px-6">
        {dates.map((date) => {
          const services = MOCK_SERVICES_SCHEDULE[date];
          return (
            <div
              key={date}
              className="flex flex-col bg-slate-50 p-2 rounded-lg shadow shadow-stone-400"
            >
              {/* Header */}
              <div className="rounded-lg px-3 py-2 text-center text-white bg-[#0c3c60]">
                <p className="font-bold text-sm">{getDayName(date)}</p>
                <p className="text-xs opacity-90">{formatDate(date)}</p>
              </div>

              {/* Services */}
              <div className="flex flex-col gap-2 mt-2">
                {services.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sin servicios
                  </p>
                ) : (
                  services.map((service, idx) => {
                    const styles =
                      STATUS_STYLES[service.estado] || DEFAULT_STYLE;
                    return (
                      <div
                        key={idx}
                        className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-2 text-xs space-y-1`}
                      >
                        <p>
                          <span className="font-bold">Cliente: </span>
                          {service.cliente}
                        </p>
                        <p>
                          <span className="font-bold">Servicio: </span>
                          {service.servicio}
                        </p>
                        <p>
                          <span className="font-bold">Origen: </span>
                          {service.origen}
                        </p>
                        <p>
                          <span className="font-bold">Destino: </span>
                          {service.destino}
                        </p>
                        <p>
                          <span className="font-bold">Chofer: </span>
                          {formatChofer(service.chofer)}
                        </p>
                        <p>
                          <span className="font-bold">Hora: </span>
                          {service.hora ?? "—"}
                        </p>
                        <p>
                          <span className="font-bold">Vehículo: </span>
                          {formatVehiculo(service.vehiculo)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
