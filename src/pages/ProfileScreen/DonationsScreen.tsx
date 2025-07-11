import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../../styles/theme';
import { useUser } from '../../hooks/useUser';
import { donationService } from '../../services/donationService';

const TABS = ['Activas', 'Completadas', 'Canceladas'];

type DonationSummary = {
  id: number;
  title: string;
  imageUrl?: string;
  donorName?: string;
  receiverName?: string;
  donationDate?: string;
  status: string;
  pointsAwarded?: number;
};

const DonationsScreen: React.FC = () => {
  const { user, loading: userLoading, error: userError } = useUser();
  const [donations, setDonations] = useState<DonationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await donationService.getUserDonations();
        setDonations(data);
      } catch (e: any) {
        setError('No se pudieron cargar las donaciones');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (userLoading || loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 60 }} size="large" color={colors.primary} />;
  }
  if (userError || error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error, fontWeight: 'bold' }}>{userError || error}</Text>
      </View>
    );
  }

  const filtered = donations.filter(d => {
    if (activeTab === 'Activas') return d.status === 'PENDING' || d.status === 'CONFIRMED';
    if (activeTab === 'Completadas') return d.status === 'COMPLETED';
    if (activeTab === 'Canceladas') return d.status === 'CANCELLED';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name="gift-outline" size={28} color={colors.success} style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.amount}>{item.pointsAwarded ? `${item.pointsAwarded} puntos` : ''}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay donaciones en esta categoría.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  activeTab: {
    backgroundColor: colors.success,
  },
  tabText: {
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadow,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.subtitle,
    color: colors.black,
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: fontSizes.body,
    color: colors.success,
    fontFamily: fonts.regular,
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  empty: {
    textAlign: 'center',
    color: colors.gray,
    marginTop: spacing.xl,
  },
});

export default DonationsScreen;
