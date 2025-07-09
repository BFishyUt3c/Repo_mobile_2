import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = colors.primary }) => (
  <View style={styles.card}>
    <Ionicons name={icon as any} size={32} color={color} style={styles.icon} />
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.sm,
    minWidth: 100,
    ...shadow,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.black,
    fontFamily: fonts.bold,
  },
  title: {
    fontSize: fontSizes.body,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default StatCard;
