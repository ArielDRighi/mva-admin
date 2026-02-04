import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Calendar,
  DollarSign,
  Key,
  LogOut,
  Truck,
  UserRound,
} from "lucide-react";
import { User } from "../sections/DashboardComponent";
import { usePathname } from "next/navigation";

type EmployeeHeaderProps = {
  user: User | null;
  handleChangePassword?: () => void;
  handleLogoutClick?: () => void;
};
export const EmployeeHeader = ({
  user,
  handleChangePassword,
  handleLogoutClick,
}: EmployeeHeaderProps) => {
  const path = usePathname();
  const isDashboard = path === "/empleado/dashboard";
  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-white">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Bienvenido, {user?.nombre.toUpperCase()}!
          </h1>
          <p className="mt-1 text-blue-100">
            {user?.roles} •{" "}
            <Badge className="bg-white/20 text-white hover:bg-white/30 ml-1">
              {user?.estado}
            </Badge>
          </p>{" "}
          {/* Quick links section moved to header */}
          {isDashboard && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/contactos_emergencia"
                  className="flex items-center"
                >
                  <Calendar className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-sm line-clamp-2">
                    Contactos de emergencia
                  </span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link href="/empleado/vestimenta" className="flex items-center">
                  <UserRound className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-sm">Mis talles de ropa</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/licencia_conducir"
                  className="flex items-center"
                >
                  <Truck className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-sm">Mi licencia de conducir</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/adelantos-salario"
                  className="flex items-center"
                >
                  <DollarSign className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-sm">Adelantos de salario</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
        {!isDashboard ? (
          <Button
            variant="outline"
            className="bg-white hover:bg-white/90 text-blue-700"
            onClick={() => (window.location.href = "/empleado/dashboard")}
          >
            Volver
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-0"
              onClick={handleChangePassword}
            >
              <Key className="h-4 w-4 mr-2" /> Cambiar contraseña
            </Button>
            <Button
              variant="outline"
              className="bg-red-500 text-white hover:bg-red-600 border-none"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
