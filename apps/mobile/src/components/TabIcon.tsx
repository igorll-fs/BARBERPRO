import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

interface Props {
  icon: string;
  label: string;
  focused: boolean;
}

export default function TabIcon({ icon, label, focused }: Props) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4, minWidth: 60 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
      <Text 
        numberOfLines={1}
        style={{
          fontSize: 10,
          color: focused ? colors.primary : colors.textMuted,
          fontWeight: focused ? '600' : '400',
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
