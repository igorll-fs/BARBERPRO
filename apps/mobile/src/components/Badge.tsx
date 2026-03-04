import React from 'react';
import { View, Text } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme';

interface Props {
  text: string;
  variant?: 'primary' | 'danger' | 'warning' | 'info' | 'success';
  size?: 'sm' | 'md';
}

const bgMap = { primary: colors.primaryBg, danger: colors.dangerBg, warning: colors.warningBg, info: colors.infoBg, success: colors.successBg };
const colorMap = { primary: colors.primary, danger: colors.danger, warning: colors.warning, info: colors.info, success: colors.success };

export default function Badge({ text, variant = 'primary', size = 'sm' }: Props) {
  return (
    <View style={{
      backgroundColor: bgMap[variant],
      paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
      paddingVertical: size === 'sm' ? 2 : spacing.xs,
      borderRadius: radius.full,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: colorMap[variant], fontSize: size === 'sm' ? fontSize.xs : fontSize.sm, fontWeight: '600' }}>
        {text}
      </Text>
    </View>
  );
}
