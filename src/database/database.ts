import {SQLiteDatabase} from 'expo-sqlite';

//nombre de la base de datos que se crea dentro del celurlar

export const DATABASE_NAME = 'gastos_db';

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
}
