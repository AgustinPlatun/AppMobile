// Tipos principales para la aplicación de gestión de comercio

export interface Ingrediente {
  id?: number;
  nombre: string;
  unidadMedida: string; // kg, litros, unidades, etc.
  precioUnitario: number;
  cantidadStock: number;
  fechaCompra: string;
  proveedor?: string;
  fechaVencimiento?: string;
  categoria?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  cantidad: number; // cantidad que se hace con la receta
  fechaCreacion: string;
  activo: boolean;
  gananciaPct?: number;
  totalConGanancia?: number;
  precioUnitarioConGanancia?: number;
}

export interface ProductoIngrediente {
  id?: number;
  productoId: number;
  ingredienteId: number;
  cantidadNecesaria: number;
  ingrediente?: Ingrediente;
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo: 'producto' | 'ingrediente';
}

export interface Venta {
  id?: number;
  fecha: string;
  productos: VentaProducto[];
  total: number;
  metodoPago?: string;
  notas?: string;
}

export interface VentaProducto {
  id?: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface ConfiguracionApp {
  id?: number;
  nombreComercio: string;
  moneda: string;
  margenGananciaPorDefecto: number;
}
