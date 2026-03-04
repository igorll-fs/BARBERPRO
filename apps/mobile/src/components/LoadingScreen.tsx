import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'Carregando...' }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.lg, marginTop: spacing.lg }}>
        {message}
      </Text>
    </View>
  );
}
