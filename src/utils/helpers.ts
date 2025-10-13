// Utilidades para formatear y validar datos

// Formatear moneda
export const formatearMoneda = (valor: number, moneda: string = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2
  }).format(valor);
};

// Formatear fecha
export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formatear fecha corta
export const formatearFechaCorta = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-AR');
};

// Generar fecha ISO string
export const generarFechaISO = (): string => {
  return new Date().toISOString();
};

// Validar email
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar teléfono argentino
export const validarTelefono = (telefono: string): boolean => {
  const regex = /^[\+]?[0-9]{10,15}$/;
  return regex.test(telefono.replace(/[\s\-\(\)]/g, ''));
};

// Calcular subtotal de item
export const calcularSubtotalItem = (cantidad: number, precioUnitario: number): number => {
  return cantidad * precioUnitario;
};

// Calcular total del presupuesto
export const calcularTotalPresupuesto = (
  subtotal: number, 
  porcentajeImpuesto: number, 
  descuento: number = 0
): { impuestos: number; total: number } => {
  const impuestos = (subtotal * porcentajeImpuesto) / 100;
  const total = subtotal + impuestos - descuento;
  
  return {
    impuestos: Math.round(impuestos * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

// Obtener color por estado del presupuesto
export const obtenerColorEstado = (estado: string): string => {
  switch (estado) {
    case 'borrador':
      return '#6B7280'; // gris
    case 'enviado':
      return '#3B82F6'; // azul
    case 'aceptado':
      return '#10B981'; // verde
    case 'rechazado':
      return '#EF4444'; // rojo
    case 'vencido':
      return '#F59E0B'; // naranja
    default:
      return '#6B7280';
  }
};

// Obtener texto del estado
export const obtenerTextoEstado = (estado: string): string => {
  switch (estado) {
    case 'borrador':
      return 'Borrador';
    case 'enviado':
      return 'Enviado';
    case 'aceptado':
      return 'Aceptado';
    case 'rechazado':
      return 'Rechazado';
    case 'vencido':
      return 'Vencido';
    default:
      return 'Desconocido';
  }
};
