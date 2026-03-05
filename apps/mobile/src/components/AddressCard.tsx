/**
 * AddressCard - Componente para exibir endereço com ação de navegação
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';
import { openMapsRoute, formatAddress } from '../utils/maps';

interface AddressCardProps {
  address: string;
  shopName?: string;
  onPress?: () => void;
}

export default function AddressCard({ address, shopName, onPress }: AddressCardProps) {
  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      await openMapsRoute(address, shopName);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📍</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Endereço</Text>
        <Text style={styles.address} numberOfLines={2}>
          {formatAddress(address)}
        </Text>
        <Text style={styles.hint}>Toque para ver no mapa 🗺️</Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowIcon}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg || colors.bg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight || colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryBg || 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted || colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  address: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 4,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  arrowIcon: {
    fontSize: 20,
    color: colors.textMuted || colors.textSecondary,
  },
});
