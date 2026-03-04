# Modelagem de Dados (Firestore)

- users/{uid}: { role: 'cliente'|'dono'|'funcionario', shopId?, name, email?, phone, photoUrl? }
- barbershops/{shopId}: { name, slug, ownerUid, address, geo, photos[], subscription: { status, plan, renewAt } }
  - services/{serviceId}: { name, priceCents, durationMin, active }
  - staff/{uid}: { name, email, phone, active, roles, schedule }
  - appointments/{id}: { customerUid, staffUid, serviceId, start, end, status: 'pending'|'confirmed'|'cancelled'|'no-show', paid?: boolean }
  - promotions/{id}: { type: 'discount'|'bundle'|'loyalty', config, active }
  - loyalty/{customerUid}: { progress: { [serviceId]: number }, rewards: [{ type, value, expiresAt }] }
  - inventory/{id}: { name, sku, qty, minQty, priceCents, history: [{type:'in'|'out', qty, at, note}] }
  - stories/{id}: { mediaUrl, caption, createdAt, expiresAt }
- otp/{phone}: { code, expiresAt }
- reminders/{id}: { appointmentId, offsetMin, dueAt }

Índices recomendados: consultas por shopId+data, staffUid+data, customerUid+data.
