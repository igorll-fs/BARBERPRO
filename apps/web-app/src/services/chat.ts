/* ============================
   BARBERPRO PWA — Chat Service
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

export function listenChat(shopId: string, roomId: string, cb: (msgs: ChatMessage[]) => void) {
    if (!db) {
        console.warn('⚠️ Chat indisponível: Firebase não inicializado');
        return () => { };
    }
    const q = query(
        collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'),
        orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
}

export async function sendMessage(shopId: string, roomId: string, fromUid: string, text: string) {
    if (!text.trim()) return;
    if (!db) throw new Error('Chat indisponível');
    await addDoc(collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'), {
        fromUid,
        text: text.trim(),
        createdAt: serverTimestamp(),
        read: false,
    });
}

export async function sendImageMessage(shopId: string, roomId: string, fromUid: string, file: File, caption?: string) {
    if (!storage) throw new Error('Firebase Storage não configurado');

    const filename = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `chat/${shopId}/${roomId}/${filename}`);
    await uploadBytes(storageRef, file);
    const imageURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'barbershops', shopId, 'chats', roomId, 'messages'), {
        fromUid,
        text: caption || '',
        imageURL,
        createdAt: serverTimestamp(),
        read: false,
    });
}

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

export function listenChatRooms(shopId: string, cb: (rooms: any[]) => void) {
    return onSnapshot(collection(db, 'barbershops', shopId, 'chats'), (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
}
