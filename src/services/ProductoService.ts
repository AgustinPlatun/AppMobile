import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../database/database';
import { Producto } from '../types';

export class ProductoService {
  // Crear un nuevo producto
  static async crear(producto: any): Promise<number> {
    console.log('ProductoService.crear - Iniciando con:', producto);
    
    try {
      const db = await getDatabase();
      console.log('ProductoService.crear - Ejecutando query de inserción...');
      console.log('ProductoService.crear - Parámetros:', [
        producto.nombre,
        producto.cantidad,
        producto.fechaCreacion,
        producto.activo ? 1 : 0
      ]);
      
      const result = await db.runAsync(
        `INSERT INTO productos (nombre, cantidad, fechaCreacion, activo)
         VALUES (?, ?, ?, ?)`,
        [
          producto.nombre,
          producto.cantidad,
          producto.fechaCreacion,
          producto.activo ? 1 : 0
        ]
      );
      
      console.log('ProductoService.crear - Resultado:', result);
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('ProductoService.crear - Error:', error);
      throw error;
    }
  }

  // Obtener todos los productos
  static async obtenerTodos(): Promise<Producto[]> {
    const db = await getDatabase();
    
    try {
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC`
      );
      
      const productos: Producto[] = [];
      
      for (const row of rows) {
        productos.push({
          id: row.id,
          nombre: row.nombre,
          cantidad: row.cantidad,
          fechaCreacion: row.fechaCreacion,
          activo: row.activo === 1
        });
      }
      
      return productos;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }
}
