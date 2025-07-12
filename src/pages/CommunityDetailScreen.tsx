import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Share,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { communityService } from '../services/communityService';
import { CommunityResponseDto, CommunityType } from '../types/community';
import { Ionicons } from '@expo/vector-icons';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RouteParams {
  communityId: number;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  points: number;
}

const CommunityDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { communityId } = route.params as RouteParams;
  
  const [community, setCommunity] = useState<CommunityResponseDto | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos de la comunidad
      const communityData = await communityService.getCommunityById(communityId);
      setCommunity(communityData);
      
      // Cargar miembros
      const membersData = await communityService.getCommunityMembers(communityId);
      setMembers(membersData);
      
      // Verificar membresía
      const membershipStatus = await communityService.checkMembership(communityId);
      setIsMember(membershipStatus);
      
      // Determinar si es el creador
      if (currentUserId && communityData.creator.id === currentUserId) {
        setIsCreator(true);
        setIsMember(true); // Forzar que el creador sea miembro
      } else {
        setIsCreator(false);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar la comunidad');
      console.error('Error loading community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;

    try {
      if (community.type === 'PRIVATE') {
        // Para comunidades privadas, solicitar membresía
        await communityService.requestMembership(communityId, 'Me gustaría unirme a esta comunidad');
        setHasPendingRequest(true);
        Alert.alert('Éxito', 'Solicitud de membresía enviada');
      } else {
        // Para comunidades públicas, unirse directamente
        await communityService.joinCommunity(communityId);
        setIsMember(true);
        Alert.alert('Éxito', 'Te has unido a la comunidad');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al unirse a la comunidad');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;

    Alert.alert(
      'Salir de la Comunidad',
      `¿Estás seguro de que quieres salir de "${community.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.leaveCommunity(communityId);
              setIsMember(false);
              Alert.alert('Éxito', 'Has salido de la comunidad');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al salir de la comunidad');
            }
          }
        }
      ]
    );
  };

  const handleEditCommunity = () => {
    if (!community) return;
    navigation.navigate('CreateEditCommunity', { community });
  };

  const handleDeleteCommunity = () => {
    if (!community) return;

    Alert.alert(
      'Eliminar Comunidad',
      `¿Estás seguro de que quieres eliminar "${community.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityService.deleteCommunity(communityId);
              Alert.alert('Éxito', 'Comunidad eliminada correctamente');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar la comunidad');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!community) return;

    try {
      const shareMessage = `¡Mira esta comunidad en GreenLoop!\n\n${community.name}\n${community.description}\n\n${community.memberCount} miembros`;
      
      await Share.share({
        message: shareMessage,
        title: community.name,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContactCreator = () => {
    if (!community) return;
    navigation.navigate('ChatDetail', { userId: community.creator.id });
  };

  const getTypeIcon = (type: CommunityType) => {
    return type === 'PUBLIC' ? '🌍' : '🔒';
  };

  const getTypeText = (type: CommunityType) => {
    return type === 'PUBLIC' ? 'Pública' : 'Privada';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAvailableActions = () => {
    if (!community) return [];

    const actions = [];

    if (!isMember && !hasPendingRequest) {
      actions.push({
        title: community.type === 'PUBLIC' ? 'Unirse' : 'Solicitar Membresía',
        icon: community.type === 'PUBLIC' ? 'person-add-outline' : 'mail-outline',
        color: '#4CAF50',
        onPress: handleJoinCommunity
      });
    }

    if (isMember && !isCreator) {
      actions.push({
        title: 'Salir de la Comunidad',
        icon: 'person-remove-outline',
        color: '#F44336',
        onPress: handleLeaveCommunity
      });
    }

    if (isCreator) {
      actions.push(
        {
          title: 'Editar Comunidad',
          icon: 'create-outline',
          color: '#2196F3',
          onPress: handleEditCommunity
        },
        {
          title: 'Eliminar Comunidad',
          icon: 'trash-outline',
          color: '#F44336',
          onPress: handleDeleteCommunity
        }
      );
    }

    if (!isCreator) {
      actions.push({
        title: 'Contactar Creador',
        icon: 'chatbubble-outline',
        color: '#2196F3',
        onPress: handleContactCreator
      });
    }

    return actions;
  };

  const renderMember = ({ item }: { item: Member }) => (
    <View style={styles.memberCard}>
      <AvatarPlaceholder 
        name={`${item.firstName} ${item.lastName}`} 
        size={40} 
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.memberDetails}>
          Nivel {item.level} • {item.points} pts
        </Text>
      </View>
      {item.id === community?.creator.id && (
        <View style={styles.creatorBadge}>
          <Text style={styles.creatorText}>👑 Creador</Text>
        </View>
      )}
    </View>
  );

  useEffect(() => {
    // Obtener el ID del usuario actual
    const fetchUserId = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id);
        }
      } catch {}
    };
    fetchUserId();
    loadCommunityData();
  }, [communityId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando comunidad...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !community) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Comunidad no encontrada'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCommunityData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const availableActions = getAvailableActions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header con información básica */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{community.name}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon(community.type)}</Text>
              <Text style={styles.typeText}>{getTypeText(community.type)}</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{community.memberCount}</Text>
              <Text style={styles.statLabel}>Miembros</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatDate(community.createdAt)}</Text>
              <Text style={styles.statLabel}>Creada</Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.content}>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>📝 Descripción</Text>
            <Text style={styles.descriptionText}>{community.description}</Text>
          </View>

          {/* Información del creador */}
          <View style={styles.creatorContainer}>
            <Text style={styles.creatorTitle}>👑 Creador de la Comunidad</Text>
            <View style={styles.creatorCard}>
              <AvatarPlaceholder 
                name={`${community.creator.firstName} ${community.creator.lastName}`} 
                size={50} 
              />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
                  {community.creator.firstName} {community.creator.lastName}
                </Text>
                <Text style={styles.creatorDetails}>
                  Nivel {community.creator.level} • {community.creator.points} pts
                </Text>
              </View>
            </View>
          </View>

          {/* Miembros */}
          <View style={styles.membersContainer}>
            <Text style={styles.membersTitle}>👥 Miembros ({members.length})</Text>
            <FlatList
              data={members.slice(0, 10)} // Mostrar solo los primeros 10
              renderItem={renderMember}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ListFooterComponent={
                members.length > 10 ? (
                  <TouchableOpacity style={styles.viewMoreButton}>
                    <Text style={styles.viewMoreText}>
                      Ver todos los {members.length} miembros
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>

          {/* Estado de membresía */}
          {hasPendingRequest && (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingTitle}>⏳ Solicitud Pendiente</Text>
              <Text style={styles.pendingText}>
                Tu solicitud de membresía está siendo revisada por el creador de la comunidad.
              </Text>
            </View>
          )}

          {/* Acciones disponibles */}
          {availableActions.length > 0 && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>🛠️ Acciones Disponibles</Text>
              {availableActions.map((action, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.actionButton, { borderColor: action.color }]}
                  onPress={action.onPress}
                >
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                  <Text style={[styles.actionButtonText, { color: action.color }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Botón de compartir */}
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text style={styles.shareButtonText}>Compartir Comunidad</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  creatorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  creatorDetails: {
    fontSize: 14,
    color: '#666',
  },
  membersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  memberDetails: {
    fontSize: 12,
    color: '#666',
  },
  creatorBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  pendingContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
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

export default CommunityDetailScreen; 