// Utility function to format dates
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Utility function to format time
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // Consistent format that doesn't depend on locale
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Function to get the badge style for service type
export const getServiceTypeBadge = (type: string) => {
  switch (type) {
    case "INSTALACION":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "LIMPIEZA":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "RETIRO":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  }
};

// Function to get the badge style for leave status
export const getLeaveStatusBadge = (status: string) => {
  switch (status) {
    case "APROBADO":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "RECHAZADO":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  }
};
