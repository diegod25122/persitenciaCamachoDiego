// Reglas de validacion del formulario de gastos

export const DESCRIPTION_MAX_LENGTH = 400;

// Monto: solo digitos, un punto opcional y como maximo 2 decimales.
// Ej. validos mientras se escribe: "", "15", "15.", "15.5", "15.50"
const AMOUNT_PATTERN = /^\d{0,7}(\.\d{0,2})?$/;

// Descripcion: letras (incluye tildes, ü y ñ), numeros y espacios
const DESCRIPTION_ALLOWED = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]*$/;
// Misma lista pero al reves: sirve para borrar los caracteres que no se permiten
const DESCRIPTION_INVALID_CHARS = /[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g;

// Se llama en cada tecla. Devuelve el nuevo texto del monto,
// o null si lo escrito no es valido (y entonces se ignora la tecla).
export function sanitizeAmountInput(text: string): string | null {
  // Algunos teclados escriben coma en vez de punto
  const normalized = text.replace(',', '.');
  return AMOUNT_PATTERN.test(normalized) ? normalized : null;
}

// Devuelve el mensaje de error del monto, o null si esta bien
export function validateAmount(amount: string): string | null {
  if (amount.trim() === '') return 'El monto es obligatorio.';
  const value = parseFloat(amount);
  if (isNaN(value) || !AMOUNT_PATTERN.test(amount)) {
    return 'Ingresa un número válido con máximo 2 decimales.';
  }
  if (value <= 0) return 'El monto debe ser mayor que 0.';
  return null;
}

// Quita los caracteres especiales y corta al tamaño maximo.
// hadInvalidChars avisa si se quito algo, para mostrarle un mensaje al usuario.
export function sanitizeDescription(text: string): {
  value: string;
  hadInvalidChars: boolean;
} {
  const cleaned = text.replace(DESCRIPTION_INVALID_CHARS, '');
  return {
    value: cleaned.slice(0, DESCRIPTION_MAX_LENGTH),
    hadInvalidChars: cleaned.length !== text.length,
  };
}

// Devuelve el mensaje de error de la descripcion, o null si esta bien (es opcional)
export function validateDescription(description: string): string | null {
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }
  if (!DESCRIPTION_ALLOWED.test(description)) {
    return 'La descripción solo puede tener letras, números y espacios.';
  }
  return null;
}
