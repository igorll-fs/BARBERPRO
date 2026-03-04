/* ============================
   BARBERPRO — Chat Service
   Firestore real-time messages + Image Upload
   ============================ */
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface ChatMessage {
  id: string;
  fromUid: string;
  text: string;
  imageURL?: string;
  createdAt: any;
  read?: boolean;
}

/** Escutar mensagens de um room em tempo real */
export function listenChat(shopId: string, roomId: string, cb: (msgs: ChatMessage[]) => void) {
  if (!db) {
    console.warn('⚠️ Chat indisponível: Firebase não inicializado');
    return () => {}; // retorna função vazia
  }
  const q = query(
    collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

/** Enviar mensagem */
export async function sendMessage(shopId: string, roomId: string, fromUid: string, text: string) {
  if (!text.trim()) return;
  if (!db) {
    throw new Error('Chat indisponível: Firebase não inicializado');
  }
  await addDoc(collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'), {
    fromUid,
    text: text.trim(),
    createdAt: serverTimestamp(),
    read: false,
  });
}

/** Enviar mensagem com imagem */
export async function sendImageMessage(shopId: string, roomId: string, fromUid: string, imageUri: string, caption?: string) {
  if (!storage) {
    throw new Error('Firebase Storage não configurado');
  }

  // Upload imagem para Storage
  const filename = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
  const storageRef = ref(storage, `chat/${shopId}/${roomId}/${filename}`);

  // Converter URI para blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Upload
  await uploadBytes(storageRef, blob);
  const imageURL = await getDownloadURL(storageRef);

  // Criar mensagem com URL da imagem
  await addDoc(collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'), {
    fromUid,
    text: caption || '',
    imageURL,
    createdAt: serverTimestamp(),
    read: false,
  });
}

/** Criar/garantir existência do room */
export async function ensureChatRoom(shopId: string, roomId: string, participants: string[]): Promise<void> {
  const roomRef = doc(db, 'barbershops', shopId, 'chats', roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    await setDoc(roomRef, {
      participants,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
    });
  }
}

/** Listar rooms do shop */
export function listenChatRooms(shopId: string, cb: (rooms: any[]) => void) {
  return onSnapshot(collection(db, 'barbershops', shopId, 'chats'), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}
