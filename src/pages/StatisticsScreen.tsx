import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes } from '../styles/theme';
import StatCard from '../components/StatCard';
import { donationService } from '../services/donationService';
import { exchangeService } from '../services/exchangeService';
import { communityService } from '../services/communityService';
import { productService } from '../services/productService';
import { DonationStatisticsDto } from '../types/donation';
import { ExchangeStatistics } from '../types/exchange';

interface UserStatistics {
  donations: DonationStatisticsDto;
  exchanges: ExchangeStatistics;
  totalProducts: number;
  totalCommunities: number;
  totalPosts: number;
  totalWishlists: number;
  pointsEarned: number;
  level: string;
}

const StatisticsScreen: React.FC = () => {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas de donaciones
      const donationStats = await donationService.getUserDonationStatistics();
      
      // Cargar estadísticas de intercambios
      const exchangeStats = await exchangeService.getExchangeStatistics();
      
      // Cargar otros datos del usuario
      const userProducts = await productService.getUserProducts();
      const userCommunities = await communityService.getUserCommunities();
      
      // Simular datos de posts y wishlists (ajustar según backend)
      const mockStats: UserStatistics = {
        donations: donationStats,
        exchanges: exchangeStats,
        totalProducts: userProducts.length,
        totalCommunities: userCommunities.length,
        totalPosts: Math.floor(Math.random() * 20) + 5, // Mock data
        totalWishlists: Math.floor(Math.random() * 5) + 1, // Mock data
        pointsEarned: donationStats.totalPointsEarned + (exchangeStats.completedExchanges * 50),
        level: calculateLevel(donationStats.totalPointsEarned + (exchangeStats.completedExchanges * 50)),
      };
      
      setStatistics(mockStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points: number): string => {
    if (points >= 1000) return 'Experto';
    if (points >= 500) return 'Avanzado';
    if (points >= 200) return 'Intermedio';
    if (points >= 50) return 'Principiante';
    return 'Novato';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  };

  const getPeriodLabel = (period: 'week' | 'month' | 'year') => {
    switch (period) {
      case 'week': return 'Esta semana';
      case 'month': return 'Este mes';
      case 'year': return 'Este año';
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => handlePeriodChange(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {getPeriodLabel(period)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDonationStats = () => {
    if (!statistics) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donaciones</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Donaciones"
            value={statistics.donations.totalDonations}
            icon="gift-outline"
            color={colors.primary}
          />
          <StatCard
            title="Completadas"
            value={statistics.donations.completedDonations}
            icon="checkmark-circle-outline"
            color={colors.success}
          />
          <StatCard
            title="Pendientes"
            value={statistics.donations.pendingDonations}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Puntos Ganados"
            value={statistics.donations.totalPointsEarned}
            icon="star-outline"
            color={colors.accent}
          />
        </View>
      </View>
    );
  };

  const renderExchangeStats = () => {
    if (!statistics) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intercambios</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Intercambios"
            value={statistics.exchanges.totalExchanges}
            icon="swap-horizontal-outline"
            color={colors.primary}
          />
          <StatCard
            title="Completados"
            value={statistics.exchanges.completedExchanges}
            icon="checkmark-circle-outline"
            color={colors.success}
          />
          <StatCard
            title="Pendientes"
            value={statistics.exchanges.pendingExchanges}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Rechazados"
            value={statistics.exchanges.rejectedExchanges}
            icon="close-circle-outline"
            color={colors.error}
          />
        </View>
      </View>
    );
  };

  const renderGeneralStats = () => {
    if (!statistics) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad General</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Productos"
            value={statistics.totalProducts}
            icon="cube-outline"
            color={colors.primary}
          />
          <StatCard
            title="Comunidades"
            value={statistics.totalCommunities}
            icon="people-outline"
            color={colors.info}
          />
          <StatCard
            title="Publicaciones"
            value={statistics.totalPosts}
            icon="document-text-outline"
            color={colors.accent}
          />
          <StatCard
            title="Listas de Deseos"
            value={statistics.totalWishlists}
            icon="heart-outline"
            color={colors.error}
          />
        </View>
      </View>
    );
  };

  const renderAchievements = () => {
    if (!statistics) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logros</Text>
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Ionicons name="trophy-outline" size={24} color={colors.accent} />
            <Text style={styles.achievementTitle}>Nivel Actual</Text>
          </View>
          <Text style={styles.achievementValue}>{statistics.level}</Text>
          <Text style={styles.achievementSubtitle}>
            {statistics.pointsEarned} puntos totales
          </Text>
        </View>
        
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Ionicons name="leaf-outline" size={24} color={colors.success} />
            <Text style={styles.achievementTitle}>Impacto Ambiental</Text>
          </View>
          <Text style={styles.achievementValue}>
            {statistics.donations.completedDonations + statistics.exchanges.completedExchanges}
          </Text>
          <Text style={styles.achievementSubtitle}>
            Objetos reutilizados
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estadísticas</Text>
        <Ionicons name="analytics-outline" size={24} color={colors.primary} />
      </View>

      {renderPeriodSelector()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderDonationStats()}
        {renderExchangeStats()}
        {renderGeneralStats()}
        {renderAchievements()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Las estadísticas se actualizan automáticamente
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    color: colors.primaryText,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  achievementTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.primaryText,
  },
  achievementValue: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 5,
  },
  achievementSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});

export default StatisticsScreen; 