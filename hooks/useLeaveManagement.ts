import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createEmployeeLeave,
  getLicenciasByUserId,
} from "@/app/actions/LicenciasEmpleados";
import { CreateEmployeeLeaveDto, LeaveType } from "@/types/types";
import { Licencia, LeaveResponse } from "@/types/dashboardEmployeeTypes";

interface LicenciaResponse {
  id: number;
  employeeId: number;
  fechaInicio: string;
  fechaFin: string;
  tipoLicencia: string;
  notas: string;
  aprobado: boolean;
  [key: string]: any;
}

export const useLeaveManagement = (employeeId: number) => {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | "">(
    ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notesText, setNotesText] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLicencias = async () => {
    try {
      if (employeeId === 0) return;

      setLoading(true);
      const fetchLicencias = await getLicenciasByUserId(employeeId);
      setLicencias(fetchLicencias as LicenciaResponse[]);
    } catch (error) {
      console.error("Error al cargar licencias:", error);
      toast.error("Error al cargar licencias", {
        description: "Algunos datos pueden estar incompletos.",
      });
      setLicencias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicencias();
  }, [employeeId]);

  const handleLeaveRequest = async () => {
    if (!selectedLeaveType || !startDate || !endDate || !employeeId) {
      toast.error("Datos incompletos", {
        description: "Por favor complete todos los campos requeridos.",
      });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Fechas inválidas", {
        description:
          "La fecha de fin no puede ser anterior a la fecha de inicio.",
      });
      return;
    }

    setIsSubmittingLeave(true);

    try {
      const leaveData: CreateEmployeeLeaveDto = {
        employeeId: employeeId,
        fechaInicio: startDate,
        fechaFin: endDate,
        tipoLicencia: selectedLeaveType as LeaveType,
        notas: notesText.trim(),
      };

      const response = (await createEmployeeLeave(leaveData)) as LeaveResponse;

      if (!response || response.success === false) {
        throw new Error(
          response?.message || "Error al crear la solicitud de licencia"
        );
      }

      toast.success("Solicitud enviada", {
        description:
          "Su solicitud de licencia ha sido enviada correctamente y está pendiente de aprobación.",
      });

      // Clear form and refresh licencias
      clearForm();
      setIsLeaveModalOpen(false);
      await fetchLicencias();
    } catch (error) {
      console.error("Error al solicitar licencia:", error);
      toast.error("Error al solicitar licencia", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la solicitud. Por favor intente nuevamente.",
      });
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const clearForm = () => {
    setSelectedLeaveType("");
    setStartDate("");
    setEndDate("");
    setNotesText("");
  };

  const openLeaveModal = () => {
    clearForm();
    setIsLeaveModalOpen(true);
  };

  const closeLeaveModal = () => {
    clearForm();
    setIsLeaveModalOpen(false);
  };

  return {
    licencias,
    selectedLeaveType,
    startDate,
    endDate,
    notesText,
    isSubmittingLeave,
    isLeaveModalOpen,
    loading,
    setSelectedLeaveType,
    setStartDate,
    setEndDate,
    setNotesText,
    setIsLeaveModalOpen,
    handleLeaveRequest,
    openLeaveModal,
    closeLeaveModal,
    refreshLicencias: fetchLicencias,
  };
};
