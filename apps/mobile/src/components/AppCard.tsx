import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass';
  onPress?: () => void;
}

export default function AppCard({ children, style, variant = 'default', onPress }: Props) {
  // Backgrounds e estilos por variante
  const bg = variant === 'elevated' ? colors.cardElevated
    : variant === 'glass' ? colors.cardGlass
    : colors.card;
    
  const shadow = variant === 'elevated' ? shadows.md
    : variant === 'glass' ? shadows.sm
    : shadows.sm;
  
  const borderWidth = variant === 'glass' ? 1 : 1;

  const cardStyle: ViewStyle = {
    backgroundColor: bg,
    borderRadius: radius.lg,  // 20px
    padding: spacing.xl,       // 24px
    marginBottom: spacing.lg,
    borderWidth,
    borderColor: colors.cardBorder,
    ...shadow,
  };

  // Se tiver onPress, retorna TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[cardStyle, style]} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}
