/* ============================
   BARBERPRO PWA — Chat em Tempo Real
   Adaptado do mobile para web
   ============================ */
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useUser } from '../../store/user';

interface ChatMsg {
  id: string;
  fromUid: string;
  fromName?: string;
  text: string;
  imageURL?: string;
  createdAt: any;
}

// ─── Dados Demo ─────────────────────────────────────────
function demoMessages(): ChatMsg[] {
  const now = Date.now();
  return [
    { id: '1', fromUid: 'staff1', fromName: 'Carlos', text: 'Bom dia galera! 🔥', createdAt: new Date(now - 3600000) },
    { id: '2', fromUid: 'staff2', fromName: 'Lucas', text: 'Fala Carlos! Quantos clientes hoje?', createdAt: new Date(now - 3500000) },
    { id: '3', fromUid: 'staff1', fromName: 'Carlos', text: 'Tenho 6 agendados, tá lotado 💈', createdAt: new Date(now - 3400000) },
    { id: '4', fromUid: 'owner', fromName: 'Dono', text: 'Promoção de terça vai bombar! Divulguem no WhatsApp 📢', createdAt: new Date(now - 3000000) },
    { id: '5', fromUid: 'staff3', fromName: 'Rafael', text: 'Já divulguei pra todos os meus clientes 👊', createdAt: new Date(now - 2000000) },
  ];
}

export default function ChatPage() {
  const { uid, name, shopId, isDemo } = useUser();
  const sid = shopId || 'demo';
  const roomId = 'general';
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ─── Escutar mensagens ────────────────────────────────
  useEffect(() => {
    if (isDemo || !db) {
      setMessages(demoMessages());
      return;
    }
    const q = query(
      collection(db, 'barbershops', sid, 'chats', roomId, 'messages'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, [sid, isDemo]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Enviar texto ─────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !uid) return;

    if (isDemo) {
      const newMsg: ChatMsg = {
        id: 'demo-' + Date.now(), fromUid: uid, fromName: name || 'Você',
        text: trimmed, createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setText('');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db!, 'barbershops', sid, 'chats', roomId, 'messages'), {
        fromUid: uid, fromName: name || 'Anônimo', text: trimmed,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error('Erro ao enviar:', err);
    } finally {
      setSending(false);
    }
  };

  // ─── Enviar imagem ────────────────────────────────────
  const handleImage = async (file: File) => {
    if (!uid) return;
    if (file.size > 5 * 1024 * 1024) { alert('Imagem muito grande (máx 5MB)'); return; }

    if (isDemo) {
      const url = URL.createObjectURL(file);
      const newMsg: ChatMsg = {
        id: 'demo-' + Date.now(), fromUid: uid, fromName: name || 'Você',
        text: '', imageURL: url, createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
      return;
    }

    if (!storage) { alert('Storage não configurado'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `chat_${Date.now()}.${ext}`;
      const storageRef = ref(storage, `chat/${sid}/${roomId}/${filename}`);
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);

      await addDoc(collection(db!, 'barbershops', sid, 'chats', roomId, 'messages'), {
        fromUid: uid, fromName: name || 'Anônimo', text: '',
        imageURL, createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      alert('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  // ─── Formatters ───────────────────────────────────────
  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isMe = (fromUid: string) => fromUid === uid;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 140px)' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--border-light)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>💬 Chat da Equipe</h1>
        <p className="text-muted" style={{ fontSize: 12 }}>#{roomId}</p>
      </div>

      {/* Mensagens */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {messages.map((msg) => {
          const mine = isMe(msg.fromUid);
          return (
            <div key={msg.id} style={{
              alignSelf: mine ? 'flex-end' : 'flex-start',
              maxWidth: '78%',
            }}>
              {/* Nome (só de outros) */}
              {!mine && (
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 2, marginLeft: 4 }}>
                  {msg.fromName || msg.fromUid.substring(0, 8)}
                </p>
              )}
              <div style={{
                background: mine ? 'var(--primary)' : 'var(--card)',
                color: mine ? '#fff' : 'var(--text)',
                borderRadius: 16,
                borderBottomRightRadius: mine ? 4 : 16,
                borderBottomLeftRadius: mine ? 16 : 4,
                padding: msg.imageURL ? 4 : '8px 14px',
                border: mine ? 'none' : '1px solid var(--border-light)',
              }}>
                {msg.imageURL && (
                  <img
                    src={msg.imageURL} alt=""
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, display: 'block' }}
                  />
                )}
                {msg.text && (
                  <p style={{ fontSize: 14, lineHeight: 1.4, margin: msg.imageURL ? '6px 10px 4px' : 0 }}>
                    {msg.text}
                  </p>
                )}
                <p style={{
                  fontSize: 10, textAlign: 'right', marginTop: 2,
                  opacity: 0.6, color: mine ? '#fff' : 'var(--text-muted)',
                }}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 12px', borderTop: '1px solid var(--border-light)',
        display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)',
      }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {uploading ? '⏳' : '📷'}
        </button>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mensagem..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          style={{ flex: 1, margin: 0 }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{
            background: text.trim() ? 'var(--primary)' : 'var(--bg-secondary)',
            border: 'none', borderRadius: '50%',
            width: 40, height: 40, cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: text.trim() ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          ➤
        </button>
      </div>

      {/* Input file oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImage(file);
          if (fileRef.current) fileRef.current.value = '';
        }}
      />
    </div>
  );
}
