/* ============================
   BARBERPRO PWA — Avaliar Agendamento
   Estrelas + comentário
   ============================ */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../store/user';
import { submitReview } from '../../services/scheduling';

export default function ReviewPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { shopId, isDemo } = useUser();
  const navigate = useNavigate();
  const sid = shopId || 'demo';

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      if (!isDemo && appointmentId) {
        await submitReview(sid, appointmentId, rating, comment);
      }
      setSubmitted(true);
      setTimeout(() => navigate('/app/appointments'), 1500);
    } catch {
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fade-in flex-center" style={{ padding: 40, minHeight: '60dvh', flexDirection: 'column' }}>
        <p style={{ fontSize: 64 }}>🎉</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Obrigado!</h2>
        <p className="text-muted mt-sm">Sua avaliação foi enviada com sucesso</p>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="fade-in" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, marginTop: 8 }}>
        <button onClick={() => navigate(-1)} style={{
          padding: '8px 12px', fontSize: 18, borderRadius: 8, border: 'none',
          background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text)',
        }}>
          ←
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Avaliar Serviço</h2>
      </div>

      {/* Card principal */}
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: 40 }}>
          {displayRating >= 4 ? '😄' : displayRating >= 3 ? '🙂' : displayRating >= 1 ? '😐' : '⭐'}
        </p>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Como foi sua experiência?</h3>
        <p className="text-muted text-sm mt-sm">Toque nas estrelas para avaliar</p>

        {/* Estrelas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                fontSize: 36, background: 'none', border: 'none', cursor: 'pointer',
                transform: displayRating >= star ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease',
                filter: displayRating >= star ? 'none' : 'grayscale(1) opacity(0.3)',
              }}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Label da nota */}
        {rating > 0 && (
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 8 }}>
            {['', 'Ruim', 'Regular', 'Bom', 'Muito Bom', 'Excelente'][rating]}
          </p>
        )}
      </div>

      {/* Comentário */}
      <div className="card" style={{ marginTop: 16 }}>
        <label className="label">Comentário (opcional)</label>
        <textarea
          className="input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte como foi sua experiência..."
          rows={4}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {/* Botão enviar */}
      <button
        className="btn btn-primary mt-xl"
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
      >
        {submitting ? 'Enviando...' : '📤 Enviar Avaliação'}
      </button>
    </div>
  );
}
