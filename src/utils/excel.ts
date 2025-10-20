import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProductoExcel = {
  id?: number;
  nombre: string;
  cantidad: number;
  fechaCreacion?: string;
  activo?: boolean;
  gananciaPct?: number;
  totalConGanancia?: number;
  precioUnitarioConGanancia?: number;
};

export function productosToWorkbook(productos: ProductoExcel[]) {
  const rows = productos.map(p => ({
    id: p.id ?? '',
    nombre: p.nombre,
    cantidad: p.cantidad,
    fechaCreacion: p.fechaCreacion ?? new Date().toISOString(),
    activo: p.activo ?? true,
    gananciaPct: p.gananciaPct ?? '',
    totalConGanancia: p.totalConGanancia ?? '',
    precioUnitarioConGanancia: p.precioUnitarioConGanancia ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'productos');
  return wb;
}

export function downloadWorkbookWeb(wb: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseProductosFromFileWeb(file: File): Promise<ProductoExcel[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(ws);
  return rows.map(r => ({
    id: r.id ? Number(r.id) : undefined,
    nombre: String(r.nombre || '').trim(),
    cantidad: Number(r.cantidad || 0),
    fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
    activo: r.activo === undefined ? true : Boolean(r.activo),
  })).filter(r => r.nombre && r.cantidad > 0);
}

// --- Persistencia en Web via localStorage como Excel base64 ---
const STORAGE_KEY = 'productos_excel_v1';
// En nativo, guardamos como JSON en AsyncStorage y mantenemos un cache en memoria
let memProductos: ProductoExcel[] = [];

export function readProductosFromLocalExcel(): ProductoExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        nombre: String(r.nombre || '').trim(),
        cantidad: Number(r.cantidad || 0),
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
        activo: r.activo === undefined ? true : Boolean(r.activo),
        gananciaPct: r.gananciaPct !== undefined && r.gananciaPct !== '' ? Number(r.gananciaPct) : undefined,
        totalConGanancia: r.totalConGanancia !== undefined && r.totalConGanancia !== '' ? Number(r.totalConGanancia) : undefined,
        precioUnitarioConGanancia: r.precioUnitarioConGanancia !== undefined && r.precioUnitarioConGanancia !== '' ? Number(r.precioUnitarioConGanancia) : undefined,
      })).filter(r => r.nombre && r.cantidad > 0);
    } catch (e) {
      console.error('Error leyendo Excel desde storage', e);
      return [];
    }
  }
  // Nativo: usamos cache en memoria
  return memProductos;
}

export function writeProductosToLocalExcel(productos: ProductoExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const wb = productosToWorkbook(productos);
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(STORAGE_KEY, base64);
    return;
  }
  // Nativo: persistimos JSON
  memProductos = productos;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(productos)).catch((e: any) => console.error('Persist productos error', e));
}

export function appendProductoToLocalExcel(producto: Omit<ProductoExcel, 'id'>): number {
  const productos = readProductosFromLocalExcel();
  const maxId = productos.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo = { id, ...producto } as ProductoExcel;
  // Prepend para que se vea primero
  const updated = [nuevo, ...productos];
  writeProductosToLocalExcel(updated);
  return id;
}

export function updateProductoInLocalExcel(updated: { id: number } & Partial<ProductoExcel>): boolean {
  const productos = readProductosFromLocalExcel();
  const idx = productos.findIndex(p => (p.id ?? -1) === updated.id);
  if (idx === -1) return false;
  productos[idx] = { ...productos[idx], ...updated } as ProductoExcel;
  writeProductosToLocalExcel(productos);
  return true;
}

// ====== INGREDIENTES (Excel local) ======
export type IngredienteExcel = {
  id?: number;
  nombre: string;
  cantidad: number;
  unidad: 'gramos' | 'mililitros' | 'litros' | 'kilo' | 'unidades';
  precio: number;
  fechaCreacion?: string;
  activo?: boolean;
};

const ING_STORAGE_KEY = 'ingredientes_excel_v1';
let memIngredientes: IngredienteExcel[] = [];

export function readIngredientesFromLocalExcel(): IngredienteExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(ING_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        nombre: String(r.nombre || '').trim(),
        cantidad: Number(r.cantidad || 0),
        unidad: (String(r.unidad || 'unidades') as any),
        precio: Number(r.precio || 0),
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
        activo: r.activo === undefined ? true : Boolean(r.activo),
      })).filter(r => r.nombre && r.cantidad > 0 && !Number.isNaN(r.precio));
    } catch (e) {
      console.error('Error leyendo Excel de ingredientes desde storage', e);
      return [];
    }
  }
  return memIngredientes;
}

export function writeIngredientesToLocalExcel(ingredientes: IngredienteExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = ingredientes.map(i => ({
      id: i.id ?? '',
      nombre: i.nombre,
      cantidad: i.cantidad,
      unidad: i.unidad,
      precio: i.precio,
      fechaCreacion: i.fechaCreacion ?? new Date().toISOString(),
      activo: i.activo ?? true,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ingredientes');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(ING_STORAGE_KEY, base64);
    return;
  }
  memIngredientes = ingredientes;
  AsyncStorage.setItem(ING_STORAGE_KEY, JSON.stringify(ingredientes)).catch((e: any) => console.error('Persist ingredientes error', e));
}

export function appendIngredienteToLocalExcel(ingrediente: Omit<IngredienteExcel, 'id'>): number {
  const ingredientes = readIngredientesFromLocalExcel();
  const maxId = ingredientes.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo = { id, ...ingrediente } as IngredienteExcel;
  const updated = [nuevo, ...ingredientes];
  writeIngredientesToLocalExcel(updated);
  return id;
}

export function updateIngredienteInLocalExcel(updatedIng: IngredienteExcel): boolean {
  const ingredientes = readIngredientesFromLocalExcel();
  const idx = ingredientes.findIndex(i => (i.id ?? -1) === (updatedIng.id ?? -2));
  if (idx === -1) return false;
  ingredientes[idx] = {
    ...ingredientes[idx],
    ...updatedIng,
  } as IngredienteExcel;
  writeIngredientesToLocalExcel(ingredientes);
  return true;
}

// ====== PRODUCTO ↔ INGREDIENTE (Relación) ======
export type ProductoIngredienteExcel = {
  id?: number;
  productoId: number;
  ingredienteId: number; // puede ser -1 cuando se agregó por nombre libre
  nombre: string; // redundante para lectura rápida
  unidad: string;
  cantidadUsada: number;
  fechaCreacion?: string;
};

const PROD_ING_STORAGE_KEY = 'producto_ingredientes_excel_v1';
let memProdIng: ProductoIngredienteExcel[] = [];

export function readProductoIngredientesAllFromLocalExcel(): ProductoIngredienteExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(PROD_ING_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        productoId: Number(r.productoId || 0),
        ingredienteId: r.ingredienteId !== undefined ? Number(r.ingredienteId) : -1,
        nombre: String(r.nombre || '').trim(),
        unidad: String(r.unidad || 'unidades'),
        cantidadUsada: Number(r.cantidadUsada || 0),
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
      })).filter(r => r.productoId > 0 && r.nombre && r.cantidadUsada > 0);
    } catch (e) {
      console.error('Error leyendo Excel de producto_ingredientes desde storage', e);
      return [];
    }
  }
  return memProdIng;
}

export function writeProductoIngredientesAllToLocalExcel(items: ProductoIngredienteExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = items.map(i => ({
      id: i.id ?? '',
      productoId: i.productoId,
      ingredienteId: i.ingredienteId,
      nombre: i.nombre,
      unidad: i.unidad,
      cantidadUsada: i.cantidadUsada,
      fechaCreacion: i.fechaCreacion ?? new Date().toISOString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'producto_ingredientes');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(PROD_ING_STORAGE_KEY, base64);
    return;
  }
  memProdIng = items;
  AsyncStorage.setItem(PROD_ING_STORAGE_KEY, JSON.stringify(items)).catch((e: any) => console.error('Persist prod_ing error', e));
}

// Inicializar caches en nativo (cargar desde AsyncStorage)
export async function initExcelStorage() {
  if (Platform.OS === 'web') return;
  try {
    const [p, i, r, c, v, vl, rec, rbl] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ING_STORAGE_KEY),
      AsyncStorage.getItem(PROD_ING_STORAGE_KEY),
      AsyncStorage.getItem(CLIENTES_STORAGE_KEY),
      AsyncStorage.getItem(VENTAS_STORAGE_KEY),
      AsyncStorage.getItem(VENTA_LINEAS_STORAGE_KEY),
      AsyncStorage.getItem(RECETAS_STORAGE_KEY),
      AsyncStorage.getItem(RECETA_BLOQUES_STORAGE_KEY),
    ]);
    memProductos = p ? JSON.parse(p) : [];
    memIngredientes = i ? JSON.parse(i) : [];
    memProdIng = r ? JSON.parse(r) : [];
    memClientes = c ? JSON.parse(c) : [];
    memVentas = v ? JSON.parse(v) : [];
    memVentaLineas = vl ? JSON.parse(vl) : [];
    memRecetas = rec ? JSON.parse(rec) : [];
  memRecetaBloques = rbl ? JSON.parse(rbl) : [];
  } catch (e) {
    console.error('initExcelStorage error', e);
    memProductos = [];
    memIngredientes = [];
    memProdIng = [];
    memClientes = [];
    memVentas = [];
    memVentaLineas = [];
    memRecetas = [];
    memRecetaBloques = [];
  }
}

// ====== CLIENTES ======
export type ClienteExcel = {
  id?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  fechaCreacion?: string;
  activo?: boolean;
};

const CLIENTES_STORAGE_KEY = 'clientes_excel_v1';
let memClientes: ClienteExcel[] = [];

export function readClientesFromLocalExcel(): ClienteExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(CLIENTES_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        nombre: String(r.nombre || '').trim(),
        apellido: String(r.apellido || '').trim(),
        telefono: r.telefono ? String(r.telefono) : undefined,
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
        activo: r.activo === undefined ? true : Boolean(r.activo),
      })).filter(r => r.nombre && r.apellido);
    } catch (e) {
      console.error('Error leyendo Excel de clientes desde storage', e);
      return [];
    }
  }
  return memClientes;
}

export function writeClientesToLocalExcel(clientes: ClienteExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = clientes.map(c => ({
      id: c.id ?? '',
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono ?? '',
      fechaCreacion: c.fechaCreacion ?? new Date().toISOString(),
      activo: c.activo ?? true,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'clientes');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(CLIENTES_STORAGE_KEY, base64);
    return;
  }
  memClientes = clientes;
  AsyncStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes)).catch((e: any) => console.error('Persist clientes error', e));
}

export function appendClienteToLocalExcel(cliente: Omit<ClienteExcel, 'id'>): number {
  const clientes = readClientesFromLocalExcel();
  const maxId = clientes.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo = { id, ...cliente } as ClienteExcel;
  const updated = [nuevo, ...clientes];
  writeClientesToLocalExcel(updated);
  return id;
}

export function deleteClienteFromLocalExcel(clienteId: number): boolean {
  const clientes = readClientesFromLocalExcel();
  const filtered = clientes.filter(c => (c.id ?? -1) !== clienteId);
  if (filtered.length === clientes.length) return false;
  writeClientesToLocalExcel(filtered);
  return true;
}

export function updateClienteInLocalExcel(updated: ClienteExcel): boolean {
  const clientes = readClientesFromLocalExcel();
  const idx = clientes.findIndex(c => (c.id ?? -1) === (updated.id ?? -2));
  if (idx === -1) return false;
  clientes[idx] = {
    ...clientes[idx],
    ...updated,
  } as ClienteExcel;
  writeClientesToLocalExcel(clientes);
  return true;
}

export function appendProductoIngredienteToLocalExcel(item: Omit<ProductoIngredienteExcel, 'id'>): number {
  const all = readProductoIngredientesAllFromLocalExcel();
  const maxId = all.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo: ProductoIngredienteExcel = { id, ...item };
  writeProductoIngredientesAllToLocalExcel([nuevo, ...all]);
  return id;
}

export function readProductoIngredientesByProductoId(productoId: number): ProductoIngredienteExcel[] {
  const all = readProductoIngredientesAllFromLocalExcel();
  return all.filter(i => i.productoId === productoId);
}

export function deleteProductoFromLocalExcel(productoId: number): boolean {
  const productos = readProductosFromLocalExcel();
  const filtered = productos.filter(p => (p.id ?? -1) !== productoId);
  if (filtered.length === productos.length) return false;
  writeProductosToLocalExcel(filtered);
  // Cascada: eliminar relaciones de ese producto
  const all = readProductoIngredientesAllFromLocalExcel();
  const remaining = all.filter(r => r.productoId !== productoId);
  writeProductoIngredientesAllToLocalExcel(remaining);
  return true;
}

export function deleteIngredienteFromLocalExcel(ingredienteId: number): boolean {
  const ingredientes = readIngredientesFromLocalExcel();
  const filtered = ingredientes.filter(i => (i.id ?? -1) !== ingredienteId);
  if (filtered.length === ingredientes.length) return false;
  writeIngredientesToLocalExcel(filtered);
  // Opcional: remover relaciones que usan este ingrediente
  const all = readProductoIngredientesAllFromLocalExcel();
  const remaining = all.filter(r => r.ingredienteId !== ingredienteId);
  writeProductoIngredientesAllToLocalExcel(remaining);
  return true;
}

// ====== VENTAS ======
export type VentaExcel = {
  id?: number;
  cliente: string; // puede ser vacío
  fecha: string; // ISO
  total: number;
  estado?: 'pagado' | 'señado' | 'no pagado';
};

export type VentaLineaExcel = {
  id?: number;
  ventaId: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  unit: number;
  total: number;
};

const VENTAS_STORAGE_KEY = 'ventas_excel_v1';
const VENTA_LINEAS_STORAGE_KEY = 'venta_lineas_excel_v1';
let memVentas: VentaExcel[] = [];
let memVentaLineas: VentaLineaExcel[] = [];

export function readVentasFromLocalExcel(): VentaExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(VENTAS_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        cliente: String(r.cliente || ''),
        fecha: r.fecha ? String(r.fecha) : new Date().toISOString(),
        total: Number(r.total || 0),
        estado: ((): 'pagado' | 'señado' | 'no pagado' => {
          const e = String(r.estado || '').toLowerCase();
          if (e === 'señado') return 'señado';
          if (e === 'no pagado' || e === 'nopagado' || e === 'impago') return 'no pagado';
          return 'pagado';
        })(),
      })).filter(v => Number.isFinite(v.total));
    } catch (e) {
      console.error('Error leyendo Excel de ventas desde storage', e);
      return [];
    }
  }
  return memVentas;
}

export function writeVentasToLocalExcel(ventas: VentaExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = ventas.map(v => ({
      id: v.id ?? '',
      cliente: v.cliente ?? '',
      fecha: v.fecha ?? new Date().toISOString(),
      total: Number(v.total || 0),
      estado: v.estado ?? 'pagado',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ventas');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(VENTAS_STORAGE_KEY, base64);
    return;
  }
  memVentas = ventas;
  AsyncStorage.setItem(VENTAS_STORAGE_KEY, JSON.stringify(ventas)).catch((e: any) => console.error('Persist ventas error', e));
}

export function appendVentaToLocalExcel(venta: VentaExcel): number {
  const ventas = readVentasFromLocalExcel();
  let id = venta.id && venta.id > 0 ? venta.id : undefined;
  if (!id) {
    const maxId = ventas.reduce((m, v) => (v.id && v.id > m ? v.id : m), 0);
    id = maxId + 1;
  } else {
    // evitar duplicados por id existente
    if (ventas.some(v => (v.id ?? -1) === id)) {
      // si ya existe, no duplicar: actualizamos al inicio
      const updated = [{ ...venta, id }, ...ventas.filter(v => (v.id ?? -1) !== id)];
      writeVentasToLocalExcel(updated);
      return id;
    }
  }
  const nuevo = { ...venta, id, estado: venta.estado ?? 'pagado' } as VentaExcel;
  writeVentasToLocalExcel([nuevo, ...ventas]);
  return id;
}

export function readVentaLineasAllFromLocalExcel(): VentaLineaExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(VENTA_LINEAS_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        ventaId: Number(r.ventaId || 0),
        productoId: Number(r.productoId || 0),
        nombre: String(r.nombre || ''),
        cantidad: Number(r.cantidad || 0),
        unit: Number(r.unit || 0),
        total: Number(r.total || 0),
      })).filter(l => l.ventaId > 0 && l.nombre);
    } catch (e) {
      console.error('Error leyendo Excel de venta_lineas desde storage', e);
      return [];
    }
  }
  return memVentaLineas;
}

export function writeVentaLineasAllToLocalExcel(items: VentaLineaExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = items.map(i => ({
      id: i.id ?? '',
      ventaId: i.ventaId,
      productoId: i.productoId,
      nombre: i.nombre,
      cantidad: i.cantidad,
      unit: i.unit,
      total: i.total,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'venta_lineas');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(VENTA_LINEAS_STORAGE_KEY, base64);
    return;
  }
  memVentaLineas = items;
  AsyncStorage.setItem(VENTA_LINEAS_STORAGE_KEY, JSON.stringify(items)).catch((e: any) => console.error('Persist venta_lineas error', e));
}

export function appendVentaLineaToLocalExcel(item: Omit<VentaLineaExcel, 'id'>): number {
  const all = readVentaLineasAllFromLocalExcel();
  const maxId = all.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo: VentaLineaExcel = { id, ...item };
  writeVentaLineasAllToLocalExcel([nuevo, ...all]);
  return id;
}

export function readVentaLineasByVentaId(ventaId: number): VentaLineaExcel[] {
  const all = readVentaLineasAllFromLocalExcel();
  return all.filter(i => i.ventaId === ventaId);
}

export function deleteVentaFromLocalExcel(ventaId: number): boolean {
  const ventas = readVentasFromLocalExcel();
  const filtered = ventas.filter(v => (v.id ?? -1) !== ventaId);
  if (filtered.length === ventas.length) return false;
  writeVentasToLocalExcel(filtered);
  // eliminar líneas asociadas
  const lineas = readVentaLineasAllFromLocalExcel();
  const remaining = lineas.filter(l => l.ventaId !== ventaId);
  writeVentaLineasAllToLocalExcel(remaining);
  return true;
}

export function updateVentaInLocalExcel(updated: VentaExcel): boolean {
  if (!updated.id && updated.id !== 0) return false;
  const ventas = readVentasFromLocalExcel();
  const idx = ventas.findIndex(v => (v.id ?? -1) === (updated.id as number));
  if (idx === -1) return false;
  ventas[idx] = { ...ventas[idx], ...updated } as VentaExcel;
  writeVentasToLocalExcel(ventas);
  return true;
}

export function replaceVentaLineas(ventaId: number, nuevas: Array<Omit<VentaLineaExcel, 'id'>>): void {
  const existentes = readVentaLineasAllFromLocalExcel();
  const sinVenta = existentes.filter(l => l.ventaId !== ventaId);
  let maxId = sinVenta.reduce((m, r) => (r.id && r.id > m ? r.id : m), 0);
  const conId = nuevas.map(n => ({ ...n, id: ++maxId } as VentaLineaExcel));
  writeVentaLineasAllToLocalExcel([ ...conId, ...sinVenta ]);
}

// ====== RECETAS ======
export type RecetaExcel = {
  id?: number;
  nombre: string;
  fechaCreacion?: string;
  activo?: boolean;
};

const RECETAS_STORAGE_KEY = 'recetas_excel_v1';
let memRecetas: RecetaExcel[] = [];

export function readRecetasFromLocalExcel(): RecetaExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(RECETAS_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        nombre: String(r.nombre || '').trim(),
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
        activo: r.activo === undefined ? true : Boolean(r.activo),
      })).filter(r => r.nombre);
    } catch (e) {
      console.error('Error leyendo Excel de recetas desde storage', e);
      return [];
    }
  }
  return memRecetas;
}

export function writeRecetasToLocalExcel(recetas: RecetaExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = recetas.map(r => ({
      id: r.id ?? '',
      nombre: r.nombre,
      fechaCreacion: r.fechaCreacion ?? new Date().toISOString(),
      activo: r.activo ?? true,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'recetas');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(RECETAS_STORAGE_KEY, base64);
    return;
  }
  memRecetas = recetas;
  AsyncStorage.setItem(RECETAS_STORAGE_KEY, JSON.stringify(recetas)).catch((e: any) => console.error('Persist recetas error', e));
}

export function appendRecetaToLocalExcel(receta: Omit<RecetaExcel, 'id'>): number {
  const recetas = readRecetasFromLocalExcel();
  const maxId = recetas.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo = { id, ...receta } as RecetaExcel;
  const updated = [nuevo, ...recetas];
  writeRecetasToLocalExcel(updated);
  return id;
}

export function deleteRecetaFromLocalExcel(recetaId: number): boolean {
  const recetas = readRecetasFromLocalExcel();
  const filtered = recetas.filter(r => (r.id ?? -1) !== recetaId);
  if (filtered.length === recetas.length) return false;
  writeRecetasToLocalExcel(filtered);
  // Cascada: eliminar bloques de esa receta
  const bloques = readRecetaBloquesAllFromLocalExcel();
  const remaining = bloques.filter(b => b.recetaId !== recetaId);
  writeRecetaBloquesAllToLocalExcel(remaining);
  return true;
}

// ====== RECETA BLOQUES (notas de receta) ======
export type RecetaBloqueExcel = {
  id?: number;
  recetaId: number;
  titulo: string;
  descripcion: string;
  orden?: number; // opcional para ordenar
  fechaCreacion?: string;
};

const RECETA_BLOQUES_STORAGE_KEY = 'receta_bloques_excel_v1';
let memRecetaBloques: RecetaBloqueExcel[] = [];

export function readRecetaBloquesAllFromLocalExcel(): RecetaBloqueExcel[] {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const base64 = window.localStorage.getItem(RECETA_BLOQUES_STORAGE_KEY);
    if (!base64) return [];
    try {
      const wb = XLSX.read(base64, { type: 'base64' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      if (!ws) return [];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      return rows.map(r => ({
        id: r.id ? Number(r.id) : undefined,
        recetaId: Number(r.recetaId || 0),
        titulo: String(r.titulo || '').trim(),
        descripcion: String(r.descripcion || '').trim(),
        orden: r.orden !== undefined && r.orden !== '' ? Number(r.orden) : undefined,
        fechaCreacion: r.fechaCreacion ? String(r.fechaCreacion) : new Date().toISOString(),
      })).filter(b => b.recetaId > 0 && b.titulo && b.descripcion);
    } catch (e) {
      console.error('Error leyendo Excel de receta_bloques', e);
      return [];
    }
  }
  return memRecetaBloques;
}

export function writeRecetaBloquesAllToLocalExcel(items: RecetaBloqueExcel[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const rows = items.map(i => ({
      id: i.id ?? '',
      recetaId: i.recetaId,
      titulo: i.titulo,
      descripcion: i.descripcion,
      orden: i.orden ?? '',
      fechaCreacion: i.fechaCreacion ?? new Date().toISOString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'receta_bloques');
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    window.localStorage.setItem(RECETA_BLOQUES_STORAGE_KEY, base64);
    return;
  }
  memRecetaBloques = items;
  AsyncStorage.setItem(RECETA_BLOQUES_STORAGE_KEY, JSON.stringify(items)).catch((e: any) => console.error('Persist receta_bloques error', e));
}

export function appendRecetaBloqueToLocalExcel(item: Omit<RecetaBloqueExcel, 'id'>): number {
  const all = readRecetaBloquesAllFromLocalExcel();
  const maxId = all.reduce((m, p) => (p.id && p.id > m ? p.id : m), 0);
  const id = maxId + 1;
  const nuevo: RecetaBloqueExcel = { id, ...item };
  writeRecetaBloquesAllToLocalExcel([...all, nuevo]);
  return id;
}

export function readRecetaBloquesByRecetaId(recetaId: number): RecetaBloqueExcel[] {
  const all = readRecetaBloquesAllFromLocalExcel();
  return all.filter(b => b.recetaId === recetaId).sort((a, b) => {
    const oa = a.orden ?? a.id ?? 0;
    const ob = b.orden ?? b.id ?? 0;
    return oa - ob; // más chico primero
  });
}

export function updateRecetaBloqueInLocalExcel(updated: RecetaBloqueExcel): boolean {
  const all = readRecetaBloquesAllFromLocalExcel();
  const idx = all.findIndex(b => (b.id ?? -1) === (updated.id ?? -2));
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...updated } as RecetaBloqueExcel;
  writeRecetaBloquesAllToLocalExcel(all);
  return true;
}

export function deleteRecetaBloqueFromLocalExcel(bloqueId: number): boolean {
  const all = readRecetaBloquesAllFromLocalExcel();
  const filtered = all.filter(b => (b.id ?? -1) !== bloqueId);
  if (filtered.length === all.length) return false;
  writeRecetaBloquesAllToLocalExcel(filtered);
  return true;
}
