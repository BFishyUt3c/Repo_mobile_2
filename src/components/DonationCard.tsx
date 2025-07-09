import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DonationSummaryDto } from '../types/DonationSummaryDto';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

interface Props {
  donation: DonationSummaryDto;
}

const DonationCard: React.FC<Props> = ({ donation }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      {donation.imageUrl ? (
        <Image source={{ uri: donation.imageUrl }} style={styles.image} />
      ) : (
        <Ionicons name="gift-outline" size={28} color={colors.success} style={styles.icon} />
      )}
      <Text style={styles.title}>{donation.title}</Text>
    </View>
    <Text style={styles.amount}>{donation.pointsAwarded ? `${donation.pointsAwarded} puntos` : ''}</Text>
    <Text style={styles.date}>{donation.donationDate ? new Date(donation.donationDate).toLocaleDateString('es-ES') : ''}</Text>
    <Text style={styles.status}>{donation.status}</Text>
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
  amount: {
    fontSize: fontSizes.title,
    color: colors.success,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: fontSizes.body,
    color: colors.info,
    fontWeight: '600',
    fontFamily: fonts.regular,
  },
});

export default DonationCard; 