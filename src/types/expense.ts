/**
 * Tipos para el sistema de gestion de gastos
 */

// Categorias que puede elegir el usuario
export type Category =
  | 'Transporte'
  | 'Alimentación'
  | 'Material académico'
  | 'Entretenimiento'
  | 'Salud'
  | 'Otros';

export interface Expense {
  id: string;
  amount: number; // en dolares
  category: Category;
  date: Date; // dia en que se hizo el gasto, lo elige el usuario (obligatorio)
  description?: string;
  facturaAdjunta?: string; // uri de la foto del comprobante/factura (opcional)
}

// Como se ordena la lista de gastos en la pantalla principal
export type SortOption = 'recientes' | 'mayorMonto';

// Mismo orden en que se muestran en el selector del modal
export const CATEGORIES: Category[] = [
  'Transporte',
  'Alimentación',
  'Material académico',
  'Entretenimiento',
  'Salud',
  'Otros',
];

/**
 * Iconos asociados a cada categoria
 */
export const CATEGORY_ICONS: Record<Category, string> = {
  'Transporte': '🚗',
  'Alimentación': '🍔',
  'Material académico': '📚',
  'Entretenimiento': '🎮',
  'Salud': '💊',
  'Otros': '📦',
};
