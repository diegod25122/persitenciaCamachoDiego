import { Directory, File, Paths } from 'expo-file-system';

// El image picker deja la foto en la carpeta de cache, que el sistema puede
// borrar en cualquier momento. Por eso se copia a una carpeta propia de la app
// (documentos) y en la base se guarda la uri de la copia.
const receiptsDir = new Directory(Paths.document, 'facturas');

// true si la uri ya apunta a una foto guardada por la app
export function isSavedReceipt(uri: string): boolean {
  return uri.startsWith(receiptsDir.uri);
}

// Copia la foto elegida a la carpeta de facturas y devuelve la nueva uri
export async function saveReceipt(tempUri: string): Promise<string> {
  if (isSavedReceipt(tempUri)) return tempUri;

  receiptsDir.create({ idempotent: true });

  const extension = tempUri.split('.').pop()?.split('?')[0] || 'jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const destination = new File(receiptsDir, name);

  await new File(tempUri).copy(destination);
  return destination.uri;
}

// Borra la foto de una factura. Si falla no pasa nada grave: solo queda un archivo suelto.
export function deleteReceipt(uri?: string): void {
  if (!uri || !isSavedReceipt(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('No se pudo borrar la foto de la factura', error);
  }
}
