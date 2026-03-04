import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';
import type { ServiceItem } from '../types/models';

interface Props {
  service: ServiceItem;
  selected?: boolean;
  onPress?: () => void;
}

export default function ServiceCard({ service, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: selected ? colors.primaryBg : colors.card,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.borderLight,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
            {service.name}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
            {service.durationMin} min
          </Text>
        </View>
        <Text style={{ color: colors.primary, fontSize: fontSize.xl, fontWeight: '700' }}>
          R$ {(service.priceCents / 100).toFixed(2)}
        </Text>
      </View>
      {service.description ? (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm }}>
          {service.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
