import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../styles/theme';

interface Props {
  name: string;
  size?: number;
}

const AvatarPlaceholder: React.FC<Props> = ({ name, size = 64 }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}> 
      <Text style={[styles.initial, { fontSize: size / 2 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
});

export default AvatarPlaceholder; 