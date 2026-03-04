import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';
import StatusBadge from './StatusBadge';
import type { Appointment } from '../types/models';

interface Props {
  appointment: Appointment;
  onPress?: () => void;
  showDate?: boolean;
}

function formatTime(d: any): string {
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: any): string {
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function AppointmentCard({ appointment, onPress, showDate = true }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: appointment.status === 'confirmed' ? colors.primary
          : appointment.status === 'pending' ? colors.warning
          : appointment.status === 'cancelled' ? colors.danger
          : colors.textMuted,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
            {appointment.serviceName || 'Serviço'}
          </Text>
          {appointment.staffName ? (
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
              com {appointment.staffName}
            </Text>
          ) : null}
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>
            {showDate ? `${formatDate(appointment.start)} · ` : ''}{formatTime(appointment.start)} - {formatTime(appointment.end)}
          </Text>
        </View>
        <StatusBadge status={appointment.status} />
      </View>
      {appointment.priceCents ? (
        <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '600', marginTop: spacing.sm }}>
          R$ {(appointment.priceCents / 100).toFixed(2)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
