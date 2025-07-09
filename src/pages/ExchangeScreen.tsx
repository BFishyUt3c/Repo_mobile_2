import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeResponse, ExchangeStatistics } from '../types/exchange';
import { exchangeService } from '../services/exchangeService';
import ExchangeCard from '../components/ExchangeCard';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

type TabType = 'requested' | 'provided' | 'statistics';

const ExchangeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('requested');
  const [exchanges, setExchanges] = useState<ExchangeResponse[]>([]);
  const [statistics, setStatistics] = useState<ExchangeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExchanges = useCallback(async (tab: TabType) => {
    try {
      setLoading(true);
      let data: ExchangeResponse[] = [];

      switch (tab) {
        case 'requested':
          data = await exchangeService.getRequestedExchanges();
          break;
        case 'provided':
          data = await exchangeService.getProvidedExchanges();
          break;
        case 'statistics':
          const stats = await exchangeService.getExchangeStatistics();
          setStatistics(stats);
          return;
      }

      setExchanges(data);
    } catch (error) {
      console.error('Error loading exchanges:', error);
      Alert.alert('Error', 'No se pudieron cargar los intercambios');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExchanges(activeTab);
    setRefreshing(false);
  }, [activeTab, loadExchanges]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    loadExchanges(tab);
  }, [loadExchanges]);

  const handleAcceptExchange = async (exchangeId: number) => {
    try {
      await exchangeService.acceptExchange(exchangeId);
      Alert.alert('Éxito', 'Intercambio aceptado');
      handleRefresh();
    } catch (error) {
      console.error('Error accepting exchange:', error);
      Alert.alert('Error', 'No se pudo aceptar el intercambio');
    }
  };

  const handleRejectExchange = async (exchangeId: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres rechazar este intercambio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await exchangeService.rejectExchange(exchangeId);
              Alert.alert('Éxito', 'Intercambio rechazado');
              handleRefresh();
            } catch (error) {
              console.error('Error rejecting exchange:', error);
              Alert.alert('Error', 'No se pudo rechazar el intercambio');
            }
          }
        }
      ]
    );
  };

  const handleCompleteExchange = async (exchangeId: number) => {
    try {
      await exchangeService.completeExchange(exchangeId);
      Alert.alert('Éxito', 'Intercambio completado');
      handleRefresh();
    } catch (error) {
      console.error('Error completing exchange:', error);
      Alert.alert('Error', 'No se pudo completar el intercambio');
    }
  };

  const handleCancelExchange = async (exchangeId: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres cancelar este intercambio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await exchangeService.cancelExchange(exchangeId);
              Alert.alert('Éxito', 'Intercambio cancelado');
              handleRefresh();
            } catch (error) {
              console.error('Error cancelling exchange:', error);
              Alert.alert('Error', 'No se pudo cancelar el intercambio');
            }
          }
        }
      ]
    );
  };

  const handleExchangePress = (exchange: ExchangeResponse) => {
    // TODO: Navegar a detalles del intercambio
    Alert.alert('Intercambio', `Detalles del intercambio #${exchange.exchangeId}`);
  };

  useEffect(() => {
    loadExchanges(activeTab);
  }, [loadExchanges, activeTab]);

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity 
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => handleTabChange(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? colors.primary : colors.textSecondary} 
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderExchange = ({ item }: { item: ExchangeResponse }) => (
    <ExchangeCard
      exchange={item}
      isRequester={activeTab === 'requested'}
      onPress={() => handleExchangePress(item)}
      onAccept={() => handleAcceptExchange(item.exchangeId)}
      onReject={() => handleRejectExchange(item.exchangeId)}
      onComplete={() => handleCompleteExchange(item.exchangeId)}
      onCancel={() => handleCancelExchange(item.exchangeId)}
    />
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="swap-horizontal" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{statistics.totalExchanges}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>{statistics.completedExchanges}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color={colors.warning} />
          <Text style={styles.statNumber}>{statistics.pendingExchanges}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={32} color={colors.danger} />
          <Text style={styles.statNumber}>{statistics.rejectedExchanges}</Text>
          <Text style={styles.statLabel}>Rechazados</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando intercambios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Intercambios</Text>
      </View>

      <View style={styles.tabs}>
        {renderTabButton('requested', 'Solicitados', 'arrow-up-outline')}
        {renderTabButton('provided', 'Recibidos', 'arrow-down-outline')}
        {renderTabButton('statistics', 'Estadísticas', 'stats-chart-outline')}
      </View>

      {activeTab === 'statistics' ? (
        renderStatistics()
      ) : (
        <FlatList
          data={exchanges}
          renderItem={renderExchange}
          keyExtractor={(item) => item.exchangeId.toString()}
          contentContainerStyle={[styles.list, { flexGrow: 1 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="swap-horizontal-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {activeTab === 'requested' 
                  ? 'No tienes intercambios solicitados'
                  : 'No tienes intercambios recibidos'
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    padding: spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  activeTabButton: {
    backgroundColor: colors.lightGreen,
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: spacing.md,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ExchangeScreen;
