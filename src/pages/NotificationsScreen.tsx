import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  notificationService, 
  NotificationResponseDto, 
  NotificationType,
  NotificationFilters 
} from '../services/notificationService';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAllNotifications(0, 50);
      setNotifications(data.content);
      setFilteredNotifications(data.content);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notificaciones');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationResponseDto) => {
    // Marcar como leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navegar según el tipo de notificación
    switch (notification.type) {
      case NotificationType.COMMUNITY_REQUEST:
        // Navegar a solicitudes de membresía
        navigation.navigate({ name: 'Profile', params: undefined });
        break;
      case NotificationType.MESSAGE:
        // Navegar a chats si hay chatId en referenceId
        if (notification.referenceId) {
          navigation.navigate({ name: 'ChatDetail', params: { chatId: notification.referenceId } });
        }
        break;
      case NotificationType.PRODUCT:
        // Navegar a productos si hay productId en referenceId
        if (notification.referenceId) {
          navigation.navigate({ name: 'ProductDetail', params: { productId: notification.referenceId } });
        }
        break;
      case NotificationType.EXCHANGE:
        // Navegar a intercambios
        navigation.navigate({ name: 'Exchanges', params: undefined });
        break;
      case NotificationType.DONATION:
        // Navegar a donaciones
        navigation.navigate({ name: 'Profile', params: undefined });
        break;
      default:
        // Para otros tipos, solo marcar como leída
        break;
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setFilteredNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = (notification: NotificationResponseDto) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notification.id);
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
              setFilteredNotifications(prev => prev.filter(n => n.id !== notification.id));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar la notificación');
            }
          }
        }
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setFilteredNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al marcar todas como leídas');
    }
  };

  const handleFilterChange = (newFilters: NotificationFilters) => {
    setFilters(newFilters);
    
    let filtered = notifications;
    
    if (newFilters.onlyUnread) {
      filtered = filtered.filter(notif => !notif.isRead);
    }
    
    if (newFilters.type) {
      filtered = filtered.filter(notif => notif.type === newFilters.type);
    }
    
    if (newFilters.days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - newFilters.days);
      filtered = filtered.filter(notif => new Date(notif.createdAt) >= cutoffDate);
    }
    
    setFilteredNotifications(filtered);
  };

  const renderNotification = ({ item }: { item: NotificationResponseDto }) => {
    const icon = notificationService.getNotificationIcon(item.type);
    const color = notificationService.getNotificationColor(item.type);
    const formattedDate = notificationService.formatDate(item.createdAt);

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDeleteNotification(item)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{formattedDate}</Text>
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (type: NotificationType | undefined, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filters.type === type && styles.activeFilterButton]}
      onPress={() => handleFilterChange({ ...filters, type: filters.type === type ? undefined : type })}
    >
      <Text style={[styles.filterButtonText, filters.type === type && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notificaciones</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllButtonText}>Marcar todas</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton(undefined, 'Todas')}
          {renderFilterButton(NotificationType.MESSAGE, 'Mensajes')}
          {renderFilterButton(NotificationType.COMMUNITY_REQUEST, 'Solicitudes')}
          {renderFilterButton(NotificationType.EXCHANGE, 'Intercambios')}
          {renderFilterButton(NotificationType.DONATION, 'Donaciones')}
          {renderFilterButton(NotificationType.PRODUCT, 'Productos')}
        </ScrollView>
        
        <TouchableOpacity
          style={[styles.filterButton, filters.onlyUnread && styles.activeFilterButton]}
          onPress={() => handleFilterChange({ ...filters, onlyUnread: !filters.onlyUnread })}
        >
          <Text style={[styles.filterButtonText, filters.onlyUnread && styles.activeFilterButtonText]}>
            No leídas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No hay notificaciones</Text>
            <Text style={styles.emptySubtitle}>
              {filters.onlyUnread 
                ? 'No tienes notificaciones sin leer'
                : 'No tienes notificaciones aún'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    position: 'absolute',
    top: 4,
    right: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen; 