import React from 'react';
import { View, Text } from 'react-native';
import { colors, radius, spacing, fontSize, shadows } from '../theme';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatCard({ icon, label, value, trend, trendValue }: Props) {
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textMuted;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      flex: 1,
      marginHorizontal: spacing.xs,
      ...shadows.sm,
    }}>
      <Text style={{ fontSize: 24, marginBottom: spacing.sm }}>{icon}</Text>
      <Text style={{ color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' }}>
        {value}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>
        {label}
      </Text>
      {trendValue ? (
        <Text style={{ color: trendColor, fontSize: fontSize.xs, marginTop: spacing.xs, fontWeight: '600' }}>
          {trendIcon} {trendValue}
        </Text>
      ) : null}
    </View>
  );
}
