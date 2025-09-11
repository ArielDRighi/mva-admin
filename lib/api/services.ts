/**
 * API functions for services - Client-side only
 */

/**
 * Obtiene servicios de un cliente específico (client-side)
 */
export async function getClientServicesAPI(clienteId: number, limit: number = 10) {
  try {
    // Verificar que estamos en el lado del cliente
    if (typeof window === 'undefined') {
      throw new Error('Esta función solo puede ejecutarse en el lado del cliente');
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services?page=1&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filtrar servicios por cliente y que sean próximos (no completados)
    if (data?.data?.items && Array.isArray(data.data.items)) {
      const filteredServices = data.data.items.filter((service: any) => 
        service.cliente_id === clienteId && 
        service.estado !== 'COMPLETADO' && 
        service.estado !== 'CANCELADO'
      );
      
      return {
        ...data,
        data: {
          ...data.data,
          items: filteredServices,
          totalItems: filteredServices.length
        }
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error loading client services:', error);
    throw error;
  }
}