import * as SQLite from 'expo-sqlite';

const DB_NAME = 'presupuestos.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstance) {
    // On web, provider still resolves openDatabaseAsync with same name
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
};

export const initDatabase = async (dbParam?: SQLite.SQLiteDatabase) => {
  try {
    const db = dbParam ?? (await getDatabase());
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        fechaCreacion TEXT NOT NULL,
        activo INTEGER NOT NULL DEFAULT 1
      );
    `);
  } catch (e) {
    console.error('Error inicializando DB:', e);
  }
};