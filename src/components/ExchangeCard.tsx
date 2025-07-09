import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeResponse } from '../types/exchange';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

interface Props {
  exchange: ExchangeResponse;
}

function isValidImage(url?: string) {
  return !!url && url.startsWith('http') && url.length > 10;
}

const ExchangeCard: React.FC<Props> = ({ exchange }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      {isValidImage(exchange.requestedProductImage) ? (
        <Image source={{ uri: exchange.requestedProductImage }} style={styles.image} />
      ) : (
        <Ionicons name="cube-outline" size={28} color={colors.accent} style={styles.icon} />
      )}
      <Text style={styles.title}>{exchange.requestedProductName}</Text>
    </View>
    <Text style={styles.status}>{exchange.status}</Text>
    <Text style={styles.date}>{new Date(exchange.requestedAt).toLocaleDateString('es-ES')}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.lightGray,
  },
  title: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: colors.black,
    fontFamily: fonts.bold,
    flex: 1,
  },
  status: {
    fontSize: fontSizes.body,
    color: colors.accent,
    fontWeight: '600',
    fontFamily: fonts.regular,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSizes.small,
    color: colors.gray,
  },
});

export default ExchangeCard; 