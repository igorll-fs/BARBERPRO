/* ============================
   BARBERPRO PWA — Serviço de Storage
   Upload de imagens (perfil, serviços, eventos)
   Só funciona com Firebase configurado
   ============================ */
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// ─── Upload de foto de perfil ───────────────────────────
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!storage) throw new Error('Firebase Storage não disponível. Faça login com uma conta real.');
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `users/${uid}/profile.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ─── Upload de imagem da barbearia (serviços, eventos) ──
export async function uploadShopImage(shopId: string, path: string, file: File): Promise<string> {
  if (!storage) throw new Error('Firebase Storage não disponível. Faça login com uma conta real.');
  const storageRef = ref(storage, `barbershops/${shopId}/public/${path}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ─── Deletar imagem da barbearia ────────────────────────
export async function deleteShopImage(shopId: string, path: string): Promise<void> {
  if (!storage) return;
  try {
    const storageRef = ref(storage, `barbershops/${shopId}/public/${path}`);
    await deleteObject(storageRef);
  } catch {
    // Imagem pode já ter sido deletada
  }
}
