import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, fontSize, spacing, radius } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  badgeCount?: number;
}

export default function Header({ title, subtitle, leftIcon, rightIcon, onLeftPress, onRightPress, badgeCount }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.bg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} style={{ marginRight: spacing.md, padding: spacing.xs }}>
            <Text style={{ fontSize: 22 }}>{leftIcon}</Text>
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: colors.text }} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{ padding: spacing.xs, position: 'relative' }}>
          <Text style={{ fontSize: 22 }}>{rightIcon}</Text>
          {badgeCount && badgeCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: colors.danger,
              borderRadius: radius.full,
              minWidth: 18,
              height: 18,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}>
              <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '700' }}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
