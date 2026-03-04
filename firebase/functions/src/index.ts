import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import dayjs from "dayjs";
import { Twilio } from "twilio";
import Stripe from "stripe";
import sharp from "sharp";
import * as crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });

export const startOtpWhatsApp = functions.https.onCall(async (data, context) => {
  const { phone } = data as { phone: string };
  if (!phone) throw new functions.https.HttpsError("invalid-argument", "Telefone é obrigatório");
  
  // SEGURANÇA: Sanitizar telefone - apenas dígitos e +
  const sanitizedPhone = phone.replace(/[^\d+]/g, '');
  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    throw new functions.https.HttpsError("invalid-argument", "Formato de telefone inválido");
  }

  // SEGURANÇA: Rate limiting - max 3 tentativas por telefone em 10 minutos
  const otpRef = db.collection("otp").doc(sanitizedPhone);
  const existing = await otpRef.get();
  if (existing.exists) {
    const data = existing.data() as any;
    const attempts = data.attempts || 0;
    const lastAttempt = data.lastAttempt?.toDate?.() || new Date(0);
    const diffMin = (Date.now() - lastAttempt.getTime()) / 60000;
    if (diffMin < 10 && attempts >= 3) {
      throw new functions.https.HttpsError("resource-exhausted", "Muitas tentativas. Aguarde 10 minutos.");
    }
  }

  // SEGURANÇA: Usar crypto para código OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = admin.firestore.Timestamp.fromDate(dayjs().add(10, "minute").toDate());

  await otpRef.set({ 
    code, 
    expiresAt, 
    attempts: admin.firestore.FieldValue.increment(1),
    lastAttempt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const body = `Seu código BarberPro é: ${code}`;
  await twilio.messages.create({ from, to: `whatsapp:${sanitizedPhone}`, body });

  return { ok: true };
});

export const verifyOtpWhatsApp = functions.https.onCall(async (data, context) => {
  const { phone, code, role } = data as { phone: string; code: string; role: "cliente"|"dono"|"funcionario" };
  if (!phone || !code) throw new functions.https.HttpsError("invalid-argument", "Dados inválidos");
  
  // SEGURANÇA: Validar role permitido
  if (!["cliente", "dono", "funcionario"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Role inválido");
  }

  const sanitizedPhone = phone.replace(/[^\d+]/g, '');
  const snap = await db.collection("otp").doc(sanitizedPhone).get();
  const otp = snap.data() as any;
  if (!otp || otp.code !== code) throw new functions.https.HttpsError("permission-denied", "Código inválido");
  if (otp.expiresAt?.toDate?.() && otp.expiresAt.toDate() < new Date()) throw new functions.https.HttpsError("deadline-exceeded", "Código expirado");

  // SEGURANÇA: Limpar OTP após uso (one-time use)
  await db.collection("otp").doc(sanitizedPhone).delete();

  // Cria/atualiza usuário
  const uid = `wa_${sanitizedPhone}`;
  await admin.auth().getUser(uid).catch(async () => {
    await admin.auth().createUser({ uid, phoneNumber: sanitizedPhone });
  });

  // Define custom claims conforme papel
  await admin.auth().setCustomUserClaims(uid, { role });

  const token = await admin.auth().createCustomToken(uid);
  return { customToken: token };
});

export const createPaymentIntent = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // SEGURANÇA: Exigir autenticação
  if (!context.auth?.uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const { amount, currency = "brl", metadata } = data as any;
  if (!amount || typeof amount !== "number" || amount <= 0) throw new functions.https.HttpsError("invalid-argument", "amount inválido");
  if (amount > 100000) throw new functions.https.HttpsError("invalid-argument", "Valor máximo excedido");
  const intent = await stripe.paymentIntents.create({ amount, currency, payment_method_types: ["card"], metadata: { ...metadata, uid: context.auth.uid } });
  return { clientSecret: intent.client_secret };
});

export const createPixPayment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // SEGURANÇA: Exigir autenticação
  if (!context.auth?.uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const { amount, currency = "brl", metadata } = data as any;
  if (!amount || typeof amount !== "number" || amount <= 0) throw new functions.https.HttpsError("invalid-argument", "amount inválido");
  if (amount > 100000) throw new functions.https.HttpsError("invalid-argument", "Valor máximo excedido");
  const intent = await stripe.paymentIntents.create({ amount, currency, payment_method_types: ["pix"], metadata: { ...metadata, uid: context.auth.uid }, 
    payment_method_options: { pix: { expires_after_seconds: 1800 } } as any
  });
  return { clientSecret: intent.client_secret, nextAction: intent.next_action };
});

export const createCheckoutSession = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  const { shopId, mode } = data as { shopId: string; mode: "monthly"|"semiannual"|"yearly" };
  if (!uid || !shopId) throw new functions.https.HttpsError("invalid-argument", "shopId é obrigatório");
  const priceMap: Record<string, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    semiannual: process.env.STRIPE_PRICE_SEMIANNUAL,
    yearly: process.env.STRIPE_PRICE_YEARLY,
  };
  const priceId = priceMap[mode];
  if (!priceId) throw new functions.https.HttpsError("failed-precondition", "Preço Stripe não configurado para o plano: " + mode);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FIREBASE_WEB_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FIREBASE_WEB_URL}/billing`,
    metadata: { shopId, uid }
  });
  return { url: session.url };
});

export const billingPortal = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // SEGURANÇA: Validar que o usuário é dono e o customerId pertence à sua barbearia
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (claims.role !== "dono") throw new functions.https.HttpsError("permission-denied", "Apenas dono pode acessar billing");
  const shopId = claims.shopId;
  if (!shopId) throw new functions.https.HttpsError("failed-precondition", "Nenhuma barbearia associada");
  // Buscar customerId da barbearia para validar
  const shopDoc = await db.collection("barbershops").doc(shopId).get();
  const shopData = shopDoc.data() as any;
  const validCustomerId = shopData?.subscription?.stripe?.customer;
  const { customerId } = data as any;
  if (!customerId || customerId !== validCustomerId) throw new functions.https.HttpsError("permission-denied", "Customer ID inválido");
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${process.env.FIREBASE_WEB_URL}/billing` });
  return { url: session.url };
});

export const stripeWebhook = functions.https.onRequest(async (req: functions.https.Request, res: functions.Response<any>) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig as string, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { shopId } = session.metadata || {};
    if (shopId) {
      await admin.firestore().collection("barbershops").doc(shopId).set({ subscription: { status: "active", mode: "subscription", updatedAt: admin.firestore.FieldValue.serverTimestamp(), stripe: { customer: session.customer } } }, { merge: true });
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    const shopId = sub.metadata?.shopId;
    if (shopId) {
      await admin.firestore().collection("barbershops").doc(shopId).set({ subscription: { status: "canceled", updatedAt: admin.firestore.FieldValue.serverTimestamp() } }, { merge: true });
    }
  }

  res.json({ received: true });
});
export const createAppointmentSecure = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  const { shopId, serviceId, staffUid, start, end, customerUid } = data as any;
  if (!shopId || !serviceId || !start || !customerUid) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios faltando");
  if (!["dono", "funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Sem permissão");
  const ref = db.collection("barbershops").doc(shopId).collection("appointments");
  const appt = await ref.add({ serviceId, staffUid: staffUid||null, start, end: end||null, customerUid, status: "pending", createdBy: uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { id: appt.id };
});

export const inviteStaff = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  const claims: any = context.auth?.token || {};
  const { shopId, email, name } = data as any;
  if (!uid || claims.role !== "dono" || claims.shopId !== shopId) throw new functions.https.HttpsError("permission-denied", "Apenas dono");
  // Cria um link de convite simples (token curto)
  // SEGURANÇA: Usar token criptograficamente seguro
  const token = crypto.randomBytes(16).toString('hex');
  await db.collection("barbershops").doc(shopId).collection("invites").doc(token).set({ email, name, shopId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { inviteUrl: `https://barberpro.app/invite/${token}` };
});

export const blockCustomer = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  const claims: any = context.auth?.token || {};
  const { customerUid, reason } = data as any;
  if (!uid || !["dono","funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Sem permissão");
  if (!customerUid) throw new functions.https.HttpsError("invalid-argument", "customerUid é obrigatório");
  // SEGURANÇA: Validar que o staff pertence à mesma barbearia
  const shopId = claims.shopId;
  if (!shopId) throw new functions.https.HttpsError("failed-precondition", "Nenhuma barbearia associada");
  // Verificar se o cliente tem agendamentos nesta barbearia (autorização por contexto)
  const appts = await db.collection("barbershops").doc(shopId).collection("appointments").where("customerUid", "==", customerUid).limit(1).get();
  if (appts.empty) throw new functions.https.HttpsError("permission-denied", "Cliente não pertence a esta barbearia");
  await db.collection("users").doc(customerUid).set({ blocked: true, blockedReason: reason || "bloqueado", blockedBy: uid, blockedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true };
});

export const watermarkOnUpload = functions.storage.object().onFinalize(async (object: functions.storage.ObjectMetadata) => {
  const filePath = object.name || "";
  if (!filePath.startsWith("barbershops/")) return;
  // SEGURANÇA: Validar tipo de arquivo
  if (!object.contentType?.startsWith("image/")) return;
  const bucket = admin.storage().bucket(object.bucket);
  const tempFile = `/tmp/${Date.now()}_${filePath.split("/").pop()}`;
  const outFile = `/tmp/out_${Date.now()}.jpg`;
  try {
    await bucket.file(filePath).download({ destination: tempFile });
    await sharp(tempFile).composite([{ input: Buffer.from("<svg width=\"800\" height=\"120\"><rect width=\"800\" height=\"120\" fill=\"black\" opacity=\"0.6\"/><text x=\"20\" y=\"75\" font-size=\"48\" fill=\"white\">Powered by BarberPro</text></svg>"), top: 0, left: 0 }]).toFile(outFile);
    await bucket.upload(outFile, { destination: filePath });
  } finally {
    // SEGURANÇA: Limpar arquivos temporários
    const fs = require("fs");
    try { fs.unlinkSync(tempFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}
  }
});

async function setUserClaims(uid: string, claims: Record<string, any>) {
  const existing = (await admin.auth().getUser(uid)).customClaims || {};
  await admin.auth().setCustomUserClaims(uid, { ...existing, ...claims });
}

export const ensureOwnerShop = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  const claims: any = context.auth?.token || {};
  const { name, slug } = data as { name: string; slug: string };
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  if (claims.role && claims.role !== "dono") throw new functions.https.HttpsError("permission-denied", "Apenas dono");
  if (!name || !slug) throw new functions.https.HttpsError("invalid-argument", "nome e slug são obrigatórios");
  const ref = db.collection("barbershops").doc(slug);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ name, slug, ownerUid: uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), subscription: { status: "inactive" } });
  }
  await db.collection("users").doc(uid).set({ role: "dono", shopId: slug }, { merge: true });
  await setUserClaims(uid, { role: "dono", shopId: slug });
  return { shopId: slug };
});

export const acceptInvite = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  const { shopId, token } = data as { shopId: string; token: string };
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  if (!shopId || !token) throw new functions.https.HttpsError("invalid-argument", "shopId e token são obrigatórios");
  const invRef = db.collection("barbershops").doc(shopId).collection("invites").doc(token);
  const inv = await invRef.get();
  if (!inv.exists) throw new functions.https.HttpsError("not-found", "Convite inválido");
  await db.collection("barbershops").doc(shopId).collection("staff").doc(uid).set({ active: true, joinedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await db.collection("users").doc(uid).set({ role: "funcionario", shopId }, { merge: true });
  await setUserClaims(uid, { role: "funcionario", shopId });
  await invRef.delete();
  return { ok: true };
});
export const onAppointmentCreated = functions.firestore
  .document("barbershops/{shopId}/appointments/{id}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, ctx: functions.EventContext) => {
    const appt = snap.data() as any;
    const start = appt.start?.toDate ? appt.start.toDate() : new Date(appt.start);
    const reminders = [60, 30, 15];
    await Promise.all(
      reminders.map(async (min) => {
        await db.collection("reminders").add({
          shopId: ctx.params.shopId,
          appointmentId: snap.id,
          offsetMin: min,
          dueAt: admin.firestore.Timestamp.fromDate(
            dayjs(start).subtract(min, "minute").toDate()
          )
        });
      })
    );
  });

export const httpPublicBarbershop = functions.https.onRequest(async (req: functions.https.Request, res: functions.Response<any>) => {
  // SEGURANÇA: Apenas GET permitido
  if (req.method !== "GET") { res.status(405).send("Method Not Allowed"); return; }
  // SEGURANÇA: CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  // SEGURANÇA: Sanitizar slug (apenas alfanumérico e hífens)
  const rawSlug = (req.path.split("/").filter(Boolean)[0]) || "";
  const slug = rawSlug.replace(/[^a-zA-Z0-9-_]/g, '');
  if (!slug) { res.status(400).send("Slug inválido"); return; }
  const shopSnap = await db.collection("barbershops").doc(slug).get();
  if (!shopSnap.exists) {
    res.status(404).send("Barbearia não encontrada");
    return;
  }
  const shop = shopSnap.data();
  // SEGURANÇA: Filtrar dados sensíveis antes de retornar
  const publicData = {
    name: shop?.name,
    slug: shop?.slug,
    description: shop?.description || null,
    phone: shop?.phone || null,
    address: shop?.address || null,
    // Não expor ownerUid, subscription, etc.
  };
  // Buscar serviços ativos
  const svcSnap = await db.collection("barbershops").doc(slug).collection("services").get();
  const services = svcSnap.docs
    .map(d => ({ id: d.id, ...(d.data() as any) }))
    .filter((s: any) => s.active !== false)
    .map((s: any) => ({ id: s.id, name: s.name, priceCents: s.priceCents, durationMin: s.durationMin }));

  res.set("Content-Type", "application/json");
  res.set("Cache-Control", "public, max-age=300");
  res.send(JSON.stringify({ shop: { ...publicData, services } }));
});

export const processReminders = functions.pubsub.schedule("every 1 minutes").onRun(async (ctx: functions.EventContext) => {
  const now = admin.firestore.Timestamp.now();
  const q = await db.collection("reminders").where("dueAt", "<=", now).get();
  for (const reminderDoc of q.docs) {
    const r = reminderDoc.data() as any;
    const apptRef = db.collection("barbershops").doc(r.shopId).collection("appointments").doc(r.appointmentId);
    const appt = (await apptRef.get()).data() as any;
    if (!appt || appt.status === "canceled") { await reminderDoc.ref.delete(); continue; }

    // Notificar cliente
    if (appt.customerUid) {
      await notifyUser(appt.customerUid, "⏰ Lembrete", `Seu horário é em ${r.offsetMin} minutos!`);
    }
    // Notificar barbeiro
    if (appt.staffUid) {
      await notifyUser(appt.staffUid, "⏰ Lembrete", `Próximo cliente em ${r.offsetMin} minutos.`);
    }

    await reminderDoc.ref.delete();
  }
});

export const markNoShows = functions.pubsub.schedule("every 15 minutes").onRun(async () => {
  const now = new Date();
  const shops = await db.collection("barbershops").get();
  for (const shop of shops.docs) {
    const appts = await shop.ref.collection("appointments").where("status", "==", "pending").get();
    for (const a of appts.docs) {
      const data = a.data() as any;
      const end = data.end?.toDate ? data.end.toDate() : (data.start ? new Date(data.start) : null);
      if (end && end < now) {
        await a.ref.update({ status: "no-show" });
        // incrementar contador do cliente
        const customerRef = db.collection("users").doc(data.customerUid);
        await customerRef.set({ noShowCount: admin.firestore.FieldValue.increment(1) }, { merge: true });
      }
    }
  }
});

export const autoBlockCustomers = functions.pubsub.schedule("every 1 hours").onRun(async () => {
  const users = await db.collection("users").where("noShowCount", ">=", 2).get();
  for (const u of users.docs) {
    await u.ref.set({ blocked: true, blockedReason: "2 faltas" }, { merge: true });
  }
});

// ═══════════════════════════════════════════════
// CANCEL / RESCHEDULE / COMPLETE APPOINTMENT
// ═══════════════════════════════════════════════

export const cancelAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const { shopId, appointmentId } = data as { shopId: string; appointmentId: string };
  if (!shopId || !appointmentId) throw new functions.https.HttpsError("invalid-argument", "shopId e appointmentId obrigatórios");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;
  const claims: any = context.auth?.token || {};

  // Apenas o cliente que criou, dono ou staff podem cancelar
  if (apptData.customerUid !== uid && claims.role !== "dono" && claims.role !== "funcionario") {
    throw new functions.https.HttpsError("permission-denied", "Sem permissão para cancelar");
  }

  // Verificar se está a mais de 2h do início (política de cancelamento)
  const start = apptData.start?.toDate ? apptData.start.toDate() : new Date(apptData.start);
  const hoursUntil = (start.getTime() - Date.now()) / 3600000;
  if (hoursUntil < 2 && claims.role === "cliente") {
    throw new functions.https.HttpsError("failed-precondition", "Cancelamento permitido até 2h antes do horário");
  }

  await apptRef.update({ status: "canceled", canceledBy: uid, canceledAt: admin.firestore.FieldValue.serverTimestamp() });

  // Notificar envolvidos
  await notifyUser(apptData.customerUid, "Agendamento cancelado", "Seu agendamento foi cancelado.");
  if (apptData.staffUid) {
    await notifyUser(apptData.staffUid, "Agendamento cancelado", "Um agendamento foi cancelado.");
  }

  return { ok: true };
});

export const rescheduleAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const { shopId, appointmentId, newStartISO, staffUid } = data as { shopId: string; appointmentId: string; newStartISO: string; staffUid?: string };
  if (!shopId || !appointmentId || !newStartISO) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios faltando");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;
  const claims: any = context.auth?.token || {};

  if (apptData.customerUid !== uid && claims.role !== "dono" && claims.role !== "funcionario") {
    throw new functions.https.HttpsError("permission-denied", "Sem permissão");
  }

  const newStart = new Date(newStartISO);
  const duration = apptData.durationMin || 30;
  const newEnd = new Date(newStart.getTime() + duration * 60000);

  // Verificar colisão
  const targetStaff = staffUid || apptData.staffUid;
  const day = new Date(newStart.getFullYear(), newStart.getMonth(), newStart.getDate());
  const appts = await listAppointmentsAt(shopId, targetStaff || null, day);
  const overlap = appts.some((a: any) => {
    if (a.id === appointmentId) return false; // Ignorar o próprio
    const aStart: Date = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    const aEnd: Date = a.end?.toDate ? a.end.toDate() : new Date(aStart.getTime() + ((a.durationMin || duration) * 60000));
    return (newStart < aEnd) && (newEnd > aStart);
  });
  if (overlap) throw new functions.https.HttpsError("already-exists", "Horário indisponível");

  await apptRef.update({
    start: admin.firestore.Timestamp.fromDate(newStart),
    end: admin.firestore.Timestamp.fromDate(newEnd),
    staffUid: targetStaff || null,
    rescheduledBy: uid,
    rescheduledAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await notifyUser(apptData.customerUid, "Agendamento remarcado", `Novo horário: ${newStart.toLocaleString("pt-BR")}`);

  return { ok: true };
});

export const completeAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (!["dono", "funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Apenas staff/dono");

  const { shopId, appointmentId } = data as { shopId: string; appointmentId: string };
  if (!shopId || !appointmentId) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;

  await apptRef.update({
    status: "completed",
    completedBy: uid,
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Incrementar fidelidade do cliente
  const customerRef = db.collection("users").doc(apptData.customerUid);
  await customerRef.set({
    loyaltyVisits: admin.firestore.FieldValue.increment(1),
    loyaltyPoints: admin.firestore.FieldValue.increment(apptData.priceCents ? Math.floor(apptData.priceCents / 100) : 10),
    lastVisitAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // Notificar cliente
  await notifyUser(apptData.customerUid, "Serviço concluído! ✅", "Obrigado por nos visitar. Avalie seu atendimento!");

  return { ok: true };
});

// ═══════════════════════════════════════════════
// CONFIRMAR / RECUSAR APPOINTMENTS
// ═══════════════════════════════════════════════

export const confirmAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (!["dono", "funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Apenas staff/dono");

  const { shopId, appointmentId } = data as { shopId: string; appointmentId: string };
  if (!shopId || !appointmentId) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;

  await apptRef.update({
    status: "confirmed",
    confirmedBy: uid,
    confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notificar cliente
  const start = apptData.start?.toDate ? apptData.start.toDate() : new Date(apptData.start);
  await notifyUser(
    apptData.customerUid,
    "✅ Agendamento confirmado!",
    `Seu horário em ${start.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} foi confirmado!`
  );

  return { ok: true };
});

export const rejectAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (!["dono", "funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Apenas staff/dono");

  const { shopId, appointmentId, reason } = data as { shopId: string; appointmentId: string; reason?: string };
  if (!shopId || !appointmentId) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;

  await apptRef.update({
    status: "cancelled",
    canceledBy: uid,
    cancelReason: reason || "Recusado pela barbearia",
    canceledAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notificar cliente
  await notifyUser(
    apptData.customerUid,
    "❌ Agendamento recusado",
    reason || "Desculpe, não conseguimos atender neste horário. Tente reagendar."
  );

  return { ok: true };
});

export const markNoShow = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (!["dono", "funcionario"].includes(claims.role)) throw new functions.https.HttpsError("permission-denied", "Apenas staff/dono");

  const { shopId, appointmentId } = data as { shopId: string; appointmentId: string };
  if (!shopId || !appointmentId) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;

  await apptRef.update({
    status: "no-show",
    markedBy: uid,
    markedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Incrementar contador de no-show do cliente
  const customerRef = db.collection("users").doc(apptData.customerUid);
  await customerRef.set({ noShowCount: admin.firestore.FieldValue.increment(1) }, { merge: true });

  // Notificar cliente (aviso)
  await notifyUser(apptData.customerUid, "Você faltou? 😢", "Sentimos sua falta! 3 faltas resultam em bloqueio.");

  return { ok: true };
});

// ═══════════════════════════════════════════════
// SISTEMA DE AVALIAÇÕES
// ═══════════════════════════════════════════════

export const rateAppointment = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");

  const { shopId, appointmentId, rating, comment } = data as { shopId: string; appointmentId: string; rating: number; comment?: string };
  if (!shopId || !appointmentId || !rating) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");
  if (rating < 1 || rating > 5) throw new functions.https.HttpsError("invalid-argument", "Rating deve ser entre 1 e 5");

  const apptRef = db.collection("barbershops").doc(shopId).collection("appointments").doc(appointmentId);
  const appt = await apptRef.get();
  if (!appt.exists) throw new functions.https.HttpsError("not-found", "Agendamento não encontrado");

  const apptData = appt.data() as any;

  // Apenas o cliente que fez o agendamento pode avaliar
  if (apptData.customerUid !== uid) {
    throw new functions.https.HttpsError("permission-denied", "Você não pode avaliar este agendamento");
  }

  // Apenas agendamentos concluídos podem ser avaliados
  if (apptData.status !== "completed") {
    throw new functions.https.HttpsError("failed-precondition", "Apenas agendamentos concluídos podem ser avaliados");
  }

  // Verificar se já foi avaliado
  if (apptData.rated) {
    throw new functions.https.HttpsError("already-exists", "Este agendamento já foi avaliado");
  }

  // Buscar dados do cliente
  const customerDoc = await db.collection("users").doc(uid).get();
  const customerData = customerDoc.data() as any;

  // Criar avaliação
  const reviewData = {
    shopId,
    appointmentId,
    customerUid: uid,
    customerName: customerData?.name || null,
    customerPhoto: customerData?.photoUrl || null,
    staffUid: apptData.staffUid || null,
    staffName: apptData.staffName || null,
    rating,
    comment: comment || null,
    reply: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("barbershops").doc(shopId).collection("reviews").add(reviewData);

  // Marcar agendamento como avaliado
  await apptRef.update({ rated: true });

  // Atualizar rating médio da barbearia
  const reviewsSnap = await db.collection("barbershops").doc(shopId).collection("reviews").get();
  const avgRating = reviewsSnap.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0) / reviewsSnap.size;
  await db.collection("barbershops").doc(shopId).update({
    rating: avgRating,
    reviewCount: reviewsSnap.size,
  });

  // Se tem staff, atualizar rating do barbeiro
  if (apptData.staffUid) {
    const staffReviewsSnap = await db.collection("barbershops").doc(shopId).collection("reviews")
      .where("staffUid", "==", apptData.staffUid).get();
    const staffAvgRating = staffReviewsSnap.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0) / staffReviewsSnap.size;
    await db.collection("barbershops").doc(shopId).collection("staff").doc(apptData.staffUid).update({
      rating: staffAvgRating,
      reviewCount: staffReviewsSnap.size,
    });
  }

  // Notificar dono
  const shopDoc = await db.collection("barbershops").doc(shopId).get();
  const ownerUid = (shopDoc.data() as any)?.ownerUid;
  if (ownerUid) {
    await notifyUser(
      ownerUid,
      rating >= 4 ? "⭐ Nova avaliação positiva!" : "💬 Nova avaliação",
      `${customerData?.name || "Um cliente"} deu ${rating} estrela${rating !== 1 ? "s" : ""} para o atendimento.`
    );
  }

  return { ok: true };
});

// ═══════════════════════════════════════════════
// PUSH NOTIFICATIONS HELPER
// ═══════════════════════════════════════════════

async function notifyUser(targetUid: string, title: string, body: string) {
  try {
    const userDoc = await db.collection("users").doc(targetUid).get();
    const userData = userDoc.data() as any;
    if (!userData?.pushToken) return;

    // Salvar notificação no Firestore (aparece no app)
    await db.collection("users").doc(targetUid).collection("notifications").add({
      title, body, read: false, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Enviar push via Expo
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userData.pushToken,
        title,
        body,
        sound: "default",
      }),
    });
  } catch (e) {
    console.error("Erro ao notificar:", e);
  }
}

export const sendPushNotification = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const claims: any = context.auth?.token || {};
  if (claims.role !== "dono") throw new functions.https.HttpsError("permission-denied", "Apenas dono");

  const { targetUid, title, body } = data as { targetUid: string; title: string; body: string };
  if (!targetUid || !title || !body) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");

  await notifyUser(targetUid, title, body);
  return { ok: true };
});

// ═══════════════════════════════════════════════
// LGPD COMPLIANCE
// ═══════════════════════════════════════════════

/** Exportar dados do usuário (LGPD Art. 18) */
export const exportUserData = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");

  // Coletar todos os dados do usuário
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data() || {};

  // Notificações
  const notifsSnap = await db.collection("users").doc(uid).collection("notifications").get();
  const notifications = notifsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Agendamentos em todas as barbearias
  const shopsSnap = await db.collection("barbershops").get();
  const appointments: any[] = [];
  for (const shop of shopsSnap.docs) {
    const apptSnap = await shop.ref.collection("appointments").where("customerUid", "==", uid).get();
    apptSnap.docs.forEach(d => appointments.push({ shopId: shop.id, id: d.id, ...d.data() }));
  }

  return {
    profile: { uid, ...userData },
    notifications,
    appointments,
    exportedAt: new Date().toISOString(),
  };
});

/** Deletar conta e dados (LGPD Art. 18) */
export const deleteUserData = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");

  const { confirmDelete } = data as { confirmDelete: boolean };
  if (!confirmDelete) throw new functions.https.HttpsError("invalid-argument", "Confirmação necessária");

  // Deletar notificações
  const notifsSnap = await db.collection("users").doc(uid).collection("notifications").get();
  const batch1 = db.batch();
  notifsSnap.docs.forEach(d => batch1.delete(d.ref));
  await batch1.commit();

  // Anonimizar agendamentos (manter para relatórios mas sem dados pessoais)
  const shopsSnap = await db.collection("barbershops").get();
  for (const shop of shopsSnap.docs) {
    const apptSnap = await shop.ref.collection("appointments").where("customerUid", "==", uid).get();
    const batch2 = db.batch();
    apptSnap.docs.forEach(d => {
      batch2.update(d.ref, { customerUid: "deleted_user", customerName: "Usuário removido" });
    });
    await batch2.commit();
  }

  // Deletar perfil
  await db.collection("users").doc(uid).delete();

  // Deletar conta no Auth
  await admin.auth().deleteUser(uid);

  return { ok: true, message: "Conta e dados deletados com sucesso" };
});

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

async function listAppointmentsAt(shopId: string, staffUid: string | null, day: Date) {
  const start = admin.firestore.Timestamp.fromDate(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
  const end = admin.firestore.Timestamp.fromDate(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1));
  let q = db.collection("barbershops").doc(shopId).collection("appointments")
    .where("start", ">=", start).where("start", "<", end);
  if (staffUid) q = q.where("staffUid", "==", staffUid);
  const snap = await q.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
}

export const getAvailableSlots = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const { shopId, staffUid, serviceId, date } = data as { shopId: string; staffUid?: string; serviceId: string; date: string };
  if (!shopId || !serviceId || !date) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");
  const serviceRef = db.collection("barbershops").doc(shopId).collection("services").doc(serviceId);
  const service = (await serviceRef.get()).data() as any;
  if (!service) throw new functions.https.HttpsError("not-found", "Serviço não encontrado");
  const duration = service.durationMin || 30;
  const day = new Date(date);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 18, 0, 0);

  const appts = await listAppointmentsAt(shopId, staffUid || null, day);
  const slots: string[] = [];
  for (let t = new Date(dayStart); t < dayEnd; t = new Date(t.getTime() + 15 * 60000)) {
    const end = new Date(t.getTime() + duration * 60000);
    if (end > dayEnd) break;
    const overlap = appts.some((a: any) => {
      const aStart: Date = a.start?.toDate ? a.start.toDate() : new Date(a.start);
      const aEnd: Date = a.end?.toDate ? a.end.toDate() : new Date(aStart.getTime() + ((a.durationMin || duration) * 60000));
      return (t < aEnd) && (end > aStart);
    });
    if (!overlap) slots.push(t.toISOString());
  }
  return { slots };
});

export const createAppointmentClient = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Requer login");
  const { shopId, serviceId, staffUid, startISO } = data as { shopId: string; serviceId: string; staffUid?: string; startISO: string };
  if (!shopId || !serviceId || !startISO) throw new functions.https.HttpsError("invalid-argument", "Dados obrigatórios");
  const userDoc = await db.collection("users").doc(uid).get();
  const user = userDoc.data() as any;
  if (user?.blocked) throw new functions.https.HttpsError("permission-denied", `Usuário bloqueado: ${user.blockedReason||""}`);
  const shopDoc = await db.collection("barbershops").doc(shopId).get();
  if (!shopDoc.exists) throw new functions.https.HttpsError("not-found", "Barbearia não encontrada");
  const dailyLimit = (shopDoc.data() as any)?.dailyLimitPerCustomer || 2;
  const startDate = new Date(startISO);
  const day = toDateOnly(startDate);
  const apptsSameDay = await listAppointmentsAt(shopId, null, day);
  const countByUser = apptsSameDay.filter((a: any) => a.customerUid === uid).length;
  if (countByUser >= dailyLimit) throw new functions.https.HttpsError("resource-exhausted", "Limite diário atingido");
  // Verifica colisão
  const service = (await db.collection("barbershops").doc(shopId).collection("services").doc(serviceId).get()).data() as any;
  const duration = service?.durationMin || 30;
  const endDate = new Date(startDate.getTime() + duration * 60000);
  const apptsStaff = await listAppointmentsAt(shopId, staffUid || null, day);
  const overlap = apptsStaff.some((a: any) => {
    const aStart: Date = a.start?.toDate ? a.start.toDate() : new Date(a.start);
    const aEnd: Date = a.end?.toDate ? a.end.toDate() : new Date(aStart.getTime() + ((a.durationMin || duration) * 60000));
    return (startDate < aEnd) && (endDate > aStart) && (!staffUid || a.staffUid === staffUid);
  });
  if (overlap) throw new functions.https.HttpsError("already-exists", "Horário indisponível");

  // Cria o agendamento
  const apptRef = await db.collection("barbershops").doc(shopId).collection("appointments").add({
    serviceId, staffUid: staffUid||null, start: admin.firestore.Timestamp.fromDate(startDate), end: admin.firestore.Timestamp.fromDate(endDate), durationMin: duration,
    customerUid: uid, status: "pending", createdAt: admin.firestore.FieldValue.serverTimestamp(), shopId
  });
  return { id: apptRef.id };
});
