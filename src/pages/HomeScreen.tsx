import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';
import StatCard from '../components/StatCard';
import RecentActivityList from '../components/RecentActivityList';
import { getDashboardStats, getRecentActivity } from '../services/homeService';

const HomeScreen: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const statsData = await getDashboardStats();
        const recentData = await getRecentActivity(10);
        setStats(statsData);
        setRecent(recentData);
      } catch (e: any) {
        setError('No se pudo cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 60 }} size="large" color={colors.primary} />;
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error, fontWeight: 'bold' }}>{error}</Text>
      </View>
    );
  }

  const statCards = stats
    ? [
        { title: 'Usuarios', value: stats.totalUsers, icon: 'person-outline', color: colors.primary },
        { title: 'Donaciones', value: stats.totalDonations, icon: 'gift-outline', color: colors.success },
        { title: 'Intercambios', value: stats.totalExchanges, icon: 'swap-horizontal-outline', color: colors.accent },
        { title: 'Comunidades', value: stats.totalCommunities, icon: 'people-outline', color: colors.primary },
      ]
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Greenloop</Text>
      <View style={styles.statsRow}>
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Actividad reciente</Text>
      <RecentActivityList data={recent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitle,
    color: colors.black,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
