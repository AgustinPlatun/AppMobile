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
    const [p, i, r] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ING_STORAGE_KEY),
      AsyncStorage.getItem(PROD_ING_STORAGE_KEY),
    ]);
    memProductos = p ? JSON.parse(p) : [];
    memIngredientes = i ? JSON.parse(i) : [];
    memProdIng = r ? JSON.parse(r) : [];
  } catch (e) {
    console.error('initExcelStorage error', e);
    memProductos = [];
    memIngredientes = [];
    memProdIng = [];
  }
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