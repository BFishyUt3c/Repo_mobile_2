import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { donationService } from '../services/donationService';
import { exchangeService } from '../services/exchangeService';
import { productService } from '../services/productService';
import { communityService } from '../services/communityService';
import * as homeService from '../services/homeService';
import { postService } from '../services/postService';
import { wishListService } from '../services/wishListService';
import { DonationStatisticsDto } from '../types/donation';
import { ExchangeStatistics } from '../types/exchange';
import { colors, fonts, fontSizes } from '../styles/theme';
import StatCard from '../components/StatCard';

interface UserStatistics {
  donations: DonationStatisticsDto;
  exchanges: ExchangeStatistics;
  totalProducts: number;
  totalCommunities: number;
  totalPosts: number;
  totalWishlists: number;
  pointsEarned: number;
  level: string;
  dashboardStats?: any; // Estadísticas globales del dashboard
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
      let donationStats;
      try {
        donationStats = await donationService.getUserDonationStatistics();
      } catch (error) {
        console.log('Donation stats not available, using default values');
        donationStats = {
          totalDonations: 0,
          completedDonations: 0,
          pendingDonations: 0,
          cancelledDonations: 0,
          totalPointsEarned: 0
        };
      }
      
      // Cargar estadísticas de intercambios
      let exchangeStats;
      try {
        exchangeStats = await exchangeService.getExchangeStatistics();
      } catch (error) {
        console.log('Exchange stats not available, using default values');
        exchangeStats = {
          totalExchanges: 0,
          pendingExchanges: 0,
          completedExchanges: 0,
          rejectedExchanges: 0
        };
      }
      
      // Cargar productos del usuario
      let userProducts = [];
      try {
        userProducts = await productService.getUserProducts();
      } catch (error) {
        console.log('User products not available, using empty array');
      }
      
      // Cargar comunidades del usuario
      let userCommunities = [];
      try {
        userCommunities = await communityService.getUserCommunities();
      } catch (error) {
        console.log('User communities not available, using empty array');
      }
      
      // Cargar posts del usuario
      let userPosts = [];
      try {
        userPosts = await postService.getAllPosts();
      } catch (error) {
        console.log('Posts endpoint not available, using empty array');
      }
      
      // Cargar wishlists del usuario
      let userWishlists = [];
      try {
        userWishlists = await wishListService.getUserWishLists();
      } catch (error) {
        console.log('Wishlists endpoint not available, using empty array');
      }
      
      // Cargar estadísticas globales del dashboard
      let dashboardStats = null;
      try {
        dashboardStats = await homeService.getDashboardStats();
      } catch (error) {
        console.log('Dashboard stats not available');
      }
      
      const userStats: UserStatistics = {
        donations: donationStats,
        exchanges: exchangeStats,
        totalProducts: userProducts.length,
        totalCommunities: userCommunities.length,
        totalPosts: userPosts.length,
        totalWishlists: userWishlists.length,
        pointsEarned: donationStats.totalPointsEarned + (exchangeStats.completedExchanges * 50),
        level: calculateLevel(donationStats.totalPointsEarned + (exchangeStats.completedExchanges * 50)),
        dashboardStats,
      };
      
      setStatistics(userStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas. Verifica que el backend esté corriendo.');
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
    const donations = statistics.donations || {};
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donaciones</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Donaciones"
            value={donations.totalDonations ?? 0}
            icon="gift-outline"
            color={colors.primary}
          />
          <StatCard
            title="Completadas"
            value={donations.completedDonations ?? 0}
            icon="checkmark-circle-outline"
            color={colors.success}
          />
          <StatCard
            title="Pendientes"
            value={donations.pendingDonations ?? 0}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Puntos Ganados"
            value={donations.totalPointsEarned ?? 0}
            icon="star-outline"
            color={colors.accent}
          />
        </View>
      </View>
    );
  };

  const renderExchangeStats = () => {
    if (!statistics) return null;
    const exchanges = statistics.exchanges || {};
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intercambios</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Intercambios"
            value={exchanges.totalExchanges ?? 0}
            icon="swap-horizontal-outline"
            color={colors.primary}
          />
          <StatCard
            title="Completados"
            value={exchanges.completedExchanges ?? 0}
            icon="checkmark-circle-outline"
            color={colors.success}
          />
          <StatCard
            title="Pendientes"
            value={exchanges.pendingExchanges ?? 0}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Rechazados"
            value={exchanges.rejectedExchanges ?? 0}
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
            value={statistics.totalProducts ?? 0}
            icon="cube-outline"
            color={colors.primary}
          />
          <StatCard
            title="Comunidades"
            value={statistics.totalCommunities ?? 0}
            icon="people-outline"
            color={colors.info}
          />
          <StatCard
            title="Publicaciones"
            value={statistics.totalPosts ?? 0}
            icon="document-text-outline"
            color={colors.accent}
          />
          <StatCard
            title="Listas de Deseos"
            value={statistics.totalWishlists ?? 0}
            icon="heart-outline"
            color={colors.error}
          />
        </View>
      </View>
    );
  };

  const renderDashboardStats = () => {
    if (!statistics?.dashboardStats) return null;
    const ds = statistics.dashboardStats;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas Globales</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Usuarios Totales"
            value={ds.totalUsers ?? 0}
            icon="people-outline"
            color={colors.primary}
          />
          <StatCard
            title="Productos Totales"
            value={ds.totalProducts ?? 0}
            icon="cube-outline"
            color={colors.info}
          />
          <StatCard
            title="Intercambios Totales"
            value={ds.totalExchanges ?? 0}
            icon="swap-horizontal-outline"
            color={colors.accent}
          />
          <StatCard
            title="Donaciones Totales"
            value={ds.totalDonations ?? 0}
            icon="gift-outline"
            color={colors.success}
          />
        </View>
        {ds.wasteAvoided !== undefined && ds.wasteAvoided !== null && (
          <View style={styles.wasteImpactCard}>
            <View style={styles.wasteImpactHeader}>
              <Ionicons name="leaf-outline" size={24} color={colors.success} />
              <Text style={styles.wasteImpactTitle}>Impacto Ambiental</Text>
            </View>
            <Text style={styles.wasteImpactValue}>
              {ds.wasteAvoided ?? 0} kg
            </Text>
            <Text style={styles.wasteImpactSubtitle}>
              Residuos evitados por la comunidad
            </Text>
          </View>
        )}
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
          <Text style={styles.achievementValue}>{statistics.level ?? 'N/A'}</Text>
          <Text style={styles.achievementSubtitle}>
            {(statistics.pointsEarned ?? 0)} puntos totales
          </Text>
        </View>
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <Ionicons name="leaf-outline" size={24} color={colors.success} />
            <Text style={styles.achievementTitle}>Impacto Ambiental</Text>
          </View>
          <Text style={styles.achievementValue}>
            {(statistics.donations?.completedDonations ?? 0) + (statistics.exchanges?.completedExchanges ?? 0)}
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
        {renderDashboardStats()}
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
  wasteImpactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wasteImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  wasteImpactTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.primaryText,
  },
  wasteImpactValue: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.success,
    marginBottom: 5,
  },
  wasteImpactSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});

export default StatisticsScreen; 