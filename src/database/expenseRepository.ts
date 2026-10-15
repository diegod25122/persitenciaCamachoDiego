import { SQLiteDatabase } from 'expo-sqlite';
import { Category, Expense } from '@/types/expense';

//forma en que una fila llega desde SQLite
//no es como expense la fecha llega como texto y descripcion como null

interface ExpenseRow {
  id: string;
  amount: number;
  category: string; // nombre de la categoria
  date: string; // fecha en formato ISO 8601
  description: string | null; // puede ser null
}

//convierte una fila de la tabla en un objeto Expense que la app puede entender

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Category, // casteo porque sabemos que es un valor valido
    date: new Date(row.date), // convierte de string a Date
    description: row.description ?? undefined, // si es null lo convertimos a undefined
  };
}
// devuelve todos los gastos del mas recinte al mas antiguio de la bdd

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
    //getAllAsync ejecuta un select y devuelve uun arreglo con todas las filas
    const rows = await db.getAllAsync<ExpenseRow>
    ('SELECT id, amount, category, date, description FROM expenses ORDER BY date DESC');
    return rows.map(rowToExpense);
}

//INSTERTA UN GASTO  a diferencia de asyncstorage no se reescribe toda la lista 

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    //los signos ?? son parametros Sqlite coloca los valores de manera segura
    //nunca se arma el SQL concatenando texto, asi se evita la inyeccion de SQL
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description) VALUES (?, ?, ?, ?, ?)',
        [
            expense.id,
            expense.amount, 
            expense.category, 
            expense.date.toISOString(), 
            expense.description ?? null]
    );
}