import {SQLiteDatabase} from 'expo-sqlite';

//nombre de la base de datos que se crea dentro del celurlar

export const DATABASE_NAME = 'gastos_db';

// Version actual del esquema. Se sube en 1 cada vez que cambia la tabla.
// SQLite guarda este numero en "PRAGMA user_version" (arranca en 0).
const DATABASE_VERSION = 1;

//se ejecuta una vez que se abre la bdd (llamada sqliteprovider)
//aqui se crean tablas si no existen aun
export async function initDatabase(db : SQLiteDatabase):Promise<void>{
    //execAsync permite la ejecucion de vvarias sentencias swl seguidas
    //wallo es un modo de escritura que sqlitre recomienda : lectura y escritura
    //pueden suceder al mismo tiempo, pero no se bloquean entre si
    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS expenses(
            id TEXT PRIMARY KEY NOT NULL,
            amount REAL NOT NULL,   --real numero con decimales
            category TEXT NOT NULL,
            date TEXT NOT NULL,   -- fecha formato iso 8601
            description TEXT      -- puede ser null por q es opcional
        )
        `

    )

    // Migraciones: si el telefono ya tenia la base vieja, se le agregan
    // las columnas nuevas sin perder los gastos guardados
    const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version ?? 0;

    if (currentVersion < 1) {
        // Version 1: ruta de la foto de la factura (opcional, por eso puede ser null)
        await db.execAsync('ALTER TABLE expenses ADD COLUMN factura_adjuntar TEXT');
    }

    if (currentVersion < DATABASE_VERSION) {
        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    }
}
