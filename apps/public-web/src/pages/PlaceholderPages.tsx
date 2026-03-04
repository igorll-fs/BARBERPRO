/* ============================
   BARBERPRO PWA — Placeholder Pages
   Páginas temporárias para routing funcionar
   ============================ */
import React from 'react';

function Placeholder({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="fade-in text-center" style={{ padding: 40 }}>
      <p style={{ fontSize: 56 }}>{icon}</p>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 16 }}>{title}</h2>
      <p className="text-muted mt-sm">Em breve</p>
    </div>
  );
}

export function TeamPage() { return <Placeholder icon="👥" title="Equipe" />; }
