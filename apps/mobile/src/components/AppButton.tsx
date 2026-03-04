import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight, shadows } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  disabled, 
  icon, 
  style, 
  textStyle 
}: Props) {
  const isDisabled = disabled || loading;
  
  // Background colors — modernos e vibrantes
  const bg = variant === 'primary' ? colors.primary
    : variant === 'danger' ? colors.danger
    : variant === 'secondary' ? colors.cardElevated
    : 'transparent';
    
  const borderColor = variant === 'outline' ? colors.primary 
    : variant === 'ghost' ? 'transparent' 
    : bg;
    
  const textColor = variant === 'outline' || variant === 'ghost' ? colors.primary
    : variant === 'secondary' ? colors.text
    : colors.white;

  // Sizing — mais generosos
  const padV = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md;
  const padH = size === 'sm' ? spacing.lg : size === 'lg' ? spacing.xxxl : spacing.xxl;
  const fs = size === 'sm' ? fontSize.sm : size === 'lg' ? fontSize.lg : fontSize.md;
  
  // Sombras coloridas para primary e danger
  const shadow = variant === 'primary' ? shadows.md 
    : variant === 'danger' ? { ...shadows.md, shadowColor: colors.danger }
    : variant === 'outline' || variant === 'ghost' ? {} 
    : shadows.sm;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor,
          borderRadius: radius.lg,  // 20px — mais arredondado
          paddingVertical: padV,
          paddingHorizontal: padH,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: isDisabled ? 0.5 : 1,
        },
        shadow,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Text style={{ fontSize: fs + 2, marginRight: spacing.sm }}>{icon}</Text> : null}
          <Text style={[{ 
            color: textColor, 
            fontSize: fs, 
            fontWeight: fontWeight.semibold 
          }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
