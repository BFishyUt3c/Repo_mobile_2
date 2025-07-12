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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CommunitySummaryDto, CommunityType } from '../types/community';
import { communityService } from '../services/communityService';
import CommunityCard from '../components/CommunityCard';
import CommunitySearchBar from '../components/CommunitySearchBar';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

type TabType = 'all' | 'my' | 'popular' | 'recent';

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [communities, setCommunities] = useState<CommunitySummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberships, setMemberships] = useState<Set<number>>(new Set());

  const loadCommunities = useCallback(async (tab: TabType, search?: string) => {
    try {
      setLoading(true);
      let data: CommunitySummaryDto[] = [];

      switch (tab) {
        case 'all':
          data = await communityService.getAllCommunities();
          break;
        case 'my':
          data = await communityService.getUserCommunities();
          break;
        case 'popular':
          data = await communityService.getPopularCommunities(20);
          break;
        case 'recent':
          data = await communityService.getRecentCommunities(20);
          break;
      }

      // Filtrar por búsqueda si hay query
      if (search) {
        data = data.filter(community => 
          community.name.toLowerCase().includes(search.toLowerCase()) ||
          community.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      setCommunities(data);
      
      // Verificar membresías para todas las comunidades
      const membershipChecks = await Promise.all(
        data.map(async (community) => {
          try {
            const isMember = await communityService.checkMembership(community.id);
            return isMember ? community.id : null;
          } catch (error) {
            return null;
          }
        })
      );
      
      const memberIds = new Set(membershipChecks.filter(id => id !== null));
      setMemberships(memberIds);
      
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'No se pudieron cargar las comunidades');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCommunities(activeTab, searchQuery);
    setRefreshing(false);
  }, [activeTab, searchQuery, loadCommunities]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    loadCommunities(activeTab, query);
  }, [activeTab, loadCommunities]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    loadCommunities(tab);
  }, [loadCommunities]);

  const handleJoinCommunity = async (communityId: number) => {
    try {
      await communityService.joinCommunity(communityId);
      setMemberships(prev => new Set([...prev, communityId]));
      Alert.alert('Éxito', 'Te has unido a la comunidad');
      handleRefresh();
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'No se pudo unir a la comunidad');
    }
  };

  const handleLeaveCommunity = async (communityId: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres abandonar esta comunidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.leaveCommunity(communityId);
              setMemberships(prev => {
                const newSet = new Set(prev);
                newSet.delete(communityId);
                return newSet;
              });
              Alert.alert('Éxito', 'Has abandonado la comunidad');
              handleRefresh();
            } catch (error) {
              console.error('Error leaving community:', error);
              Alert.alert('Error', 'No se pudo abandonar la comunidad');
            }
          }
        }
      ]
    );
  };

  const handleCommunityPress = (community: CommunitySummaryDto) => {
    navigation.navigate('CommunityDetail', { communityId: community.id });
  };

  const handleCreateCommunity = () => {
    navigation.navigate('CreateEditCommunity' as never);
  };

  useEffect(() => {
    loadCommunities(activeTab);
  }, [loadCommunities, activeTab]);

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

  const renderCommunity = ({ item }: { item: CommunitySummaryDto }) => (
    <CommunityCard
      community={item}
      isMember={memberships.has(item.id)}
      onPress={() => handleCommunityPress(item)}
      onJoin={() => handleJoinCommunity(item.id)}
      onLeave={() => handleLeaveCommunity(item.id)}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando comunidades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comunidades</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateCommunity}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <CommunitySearchBar onSearch={handleSearch} />

      <View style={styles.tabs}>
        {renderTabButton('all', 'Todas', 'grid-outline')}
        {renderTabButton('my', 'Mis Comunidades', 'people-outline')}
        {renderTabButton('popular', 'Populares', 'trending-up-outline')}
        {renderTabButton('recent', 'Recientes', 'time-outline')}
      </View>

      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No se encontraron comunidades con esa búsqueda'
                : 'No hay comunidades disponibles'
              }
            </Text>
          </View>
        }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.black,
    fontFamily: fonts.bold,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
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
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CommunityScreen;
