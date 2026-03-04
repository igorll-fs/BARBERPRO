import React from 'react';
import { View, Text } from 'react-native';
import { colors, fontSize } from '../theme';

interface Props {
  name?: string;
  photoUrl?: string;
  size?: number;
  style?: any;
}

export default function Avatar({ name, photoUrl, size = 44, style }: Props) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (photoUrl) {
    const { Image } = require('react-native');
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: colors.primary,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryBg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.primary,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.primary, fontSize: size * 0.38, fontWeight: '700' }}>
        {initials}
      </Text>
    </View>
  );
}
