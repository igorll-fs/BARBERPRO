import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function AppInput({ label, error, containerStyle, style, ...rest }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
      {label ? (
        <Text style={{ 
          color: isFocused ? colors.primary : colors.textSecondary, 
          fontSize: fontSize.xs, 
          marginBottom: spacing.sm, 
          fontWeight: fontWeight.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          {
            backgroundColor: colors.bgSecondary,
            borderWidth: isFocused ? 2 : 1.5,
            borderColor: error ? colors.danger : isFocused ? colors.primary : colors.border,
            borderRadius: radius.md,  // 16px
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            color: colors.text,
            fontSize: fontSize.md,
            minHeight: rest.multiline ? 80 : undefined,
            textAlignVertical: rest.multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={{ 
          color: colors.danger, 
          fontSize: fontSize.xs, 
          marginTop: spacing.xs,
          fontWeight: fontWeight.medium,
        }}>{error}</Text>
      ) : null}
    </View>
  );
}
