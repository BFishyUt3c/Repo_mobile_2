import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts, spacing } from '../../styles/theme';

const SettingsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Configuración</Text>
    <Text style={styles.text}>Aquí podrás configurar tu cuenta próximamente.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
  },
  text: {
    fontSize: fontSizes.body,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default SettingsScreen; 