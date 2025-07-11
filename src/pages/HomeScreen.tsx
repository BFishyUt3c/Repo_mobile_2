import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatCard from '../components/StatCard';
import RecentActivityList from '../components/RecentActivityList';
import { getDashboardStats, getRecentActivity } from '../services/homeService';
import { DashboardStatsDto } from '../types/DashboardStatsDto';
import { RecentActivityDto } from '../types/RecentActivityDto';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas y actividad en paralelo
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(5)
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStatPress = (statType: string) => {
    switch (statType) {
      case 'products':
        navigation.navigate({ name: 'Products', params: undefined });
        break;
      case 'exchanges':
        navigation.navigate({ name: 'Exchanges', params: undefined });
        break;
      case 'communities':
        navigation.navigate({ name: 'Communities', params: undefined });
        break;
      case 'donations':
        navigation.navigate({ name: 'Profile', params: undefined });
        break;
      default:
        break;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getWasteImpact = (wasteAvoided: number) => {
    const co2Saved = wasteAvoided * 2.5; // kg CO2 por kg de residuo evitado
    const treesEquivalent = Math.round(co2Saved / 22); // 22kg CO2 por árbol por año
    return { co2Saved, treesEquivalent };
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const wasteImpact = stats ? getWasteImpact(stats.wasteAvoided) : { co2Saved: 0, treesEquivalent: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Dashboard</Text>
          <Text style={styles.subtitle}>Bienvenido a GreenLoop</Text>
        </View>

        {/* Estadísticas Principales */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>
            <View style={styles.statsGrid}>
              <TouchableOpacity onPress={() => handleStatPress('products')}>
                <StatCard
                  title="Productos"
                  value={formatNumber(stats.totalProducts)}
                  icon="📦"
                  color="#2196F3"
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleStatPress('exchanges')}>
                <StatCard
                  title="Intercambios"
                  value={formatNumber(stats.totalExchanges)}
                  icon="🔄"
                  color="#4CAF50"
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleStatPress('donations')}>
                <StatCard
                  title="Donaciones"
                  value={formatNumber(stats.totalDonations)}
                  icon="🎁"
                  color="#FF9800"
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleStatPress('communities')}>
                <StatCard
                  title="Comunidades"
                  value={formatNumber(stats.totalCommunities)}
                  icon="👥"
                  color="#9C27B0"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Impacto Ambiental */}
        {stats && (
          <View style={styles.impactContainer}>
            <Text style={styles.sectionTitle}>🌱 Impacto Ambiental</Text>
            <View style={styles.impactCard}>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>Residuos Evitados:</Text>
                <Text style={styles.impactValue}>{formatNumber(stats.wasteAvoided)} kg</Text>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>CO₂ Ahorrado:</Text>
                <Text style={styles.impactValue}>{formatNumber(wasteImpact.co2Saved)} kg</Text>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>Equivalente a Árboles:</Text>
                <Text style={styles.impactValue}>{wasteImpact.treesEquivalent} árboles</Text>
              </View>
            </View>
          </View>
        )}

        {/* Crecimiento */}
        {stats && (
          <View style={styles.growthContainer}>
            <Text style={styles.sectionTitle}>📈 Crecimiento</Text>
            <View style={styles.growthCard}>
              <View style={styles.growthRow}>
                <Text style={styles.growthLabel}>Crecimiento General:</Text>
                <Text style={[styles.growthValue, { color: stats.growthPercentage >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {stats.growthPercentage >= 0 ? '+' : ''}{stats.growthPercentage}%
                </Text>
              </View>
              <View style={styles.growthRow}>
                <Text style={styles.growthLabel}>Usuarios Activos:</Text>
                <Text style={styles.growthValue}>{formatNumber(stats.activeUsers)}</Text>
              </View>
              <View style={styles.growthRow}>
                <Text style={styles.growthLabel}>Total Usuarios:</Text>
                <Text style={styles.growthValue}>{formatNumber(stats.totalUsers)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actividad Reciente */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>🕒 Actividad Reciente</Text>
          {recentActivity.length > 0 ? (
            <RecentActivityList data={recentActivity} />
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>📝 No hay actividad reciente</Text>
            </View>
          )}
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate({ name: 'Products', params: undefined })}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>Crear Producto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate({ name: 'Exchanges', params: undefined })}
            >
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>Crear Intercambio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate({ name: 'Communities', params: undefined })}
            >
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionText}>Crear Comunidad</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate({ name: 'Profile', params: undefined })}
            >
              <Text style={styles.quickActionIcon}>🎁</Text>
              <Text style={styles.quickActionText}>Crear Donación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  impactContainer: {
    padding: 16,
  },
  impactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  growthContainer: {
    padding: 16,
  },
  growthCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  growthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  growthLabel: {
    fontSize: 14,
    color: '#666',
  },
  growthValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  activityContainer: {
    padding: 16,
  },
  emptyActivity: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#999',
  },
  quickActionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
