import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUserById } from "@/app/actions/users";
import { User } from "@/components/sections/DashboardComponent";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface UserResponse {
  empleadoId: number;
  [key: string]: any;
}

export const useEmployeeData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [employeeId, setEmployeeId] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const userId = user?.id || 0;

  useEffect(() => {
    const userCookie = getCookie("user");

    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie as string);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error al parsear el usuario:", error);
        toast.error("Error de sesión", {
          description:
            "No se pudo cargar la información del usuario. Por favor, intente iniciar sesión nuevamente.",
        });
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (userId === 0) return;

        setLoading(true);

        const fetchEmployee = (await getUserById(userId)) as UserResponse;

        if (!fetchEmployee || !fetchEmployee.empleadoId) {
          throw new Error("No se encontró la información del empleado");
        }

        setEmployeeId(fetchEmployee.empleadoId);
      } catch (error) {
        console.error("Error al obtener información del empleado:", error);
        toast.error("Error de datos", {
          description:
            error instanceof Error
              ? error.message
              : "No se pudo cargar la información del empleado. Por favor, refresque la página.",
        });
        setEmployeeId(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [userId]);

  return {
    user,
    employeeId,
    loading,
    setUser,
    setEmployeeId,
    setLoading,
  };
};
