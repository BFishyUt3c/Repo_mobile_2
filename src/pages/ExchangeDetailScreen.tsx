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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { exchangeService } from '../services/exchangeService';
import { ExchangeResponse, ExchangeStatus } from '../types/exchange';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  exchangeId: number;
}

const ExchangeDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exchangeId } = route.params as RouteParams;
  
  const [exchange, setExchange] = useState<ExchangeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequester, setIsRequester] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  const loadExchange = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exchangeService.getExchangeById(exchangeId);
      setExchange(data);
      // Determinar si el usuario actual es el solicitante o proveedor
      // Esto dependerá de cómo esté estructurado el backend
      setIsRequester(data.requesterId === 1); // Placeholder - usar ID real del usuario
      setIsProvider(data.providerId === 1); // Placeholder - usar ID real del usuario
    } catch (err: any) {
      setError(err.message || 'Error al cargar el intercambio');
      console.error('Error loading exchange:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptExchange = async () => {
    if (!exchange) return;

    try {
      const updatedExchange = await exchangeService.acceptExchange(exchange.exchangeId);
      setExchange(updatedExchange);
      Alert.alert('Éxito', 'Intercambio aceptado correctamente');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al aceptar el intercambio');
    }
  };

  const handleRejectExchange = async () => {
    if (!exchange) return;

    try {
      const updatedExchange = await exchangeService.rejectExchange(exchange.exchangeId);
      setExchange(updatedExchange);
      Alert.alert('Éxito', 'Intercambio rechazado');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al rechazar el intercambio');
    }
  };

  const handleCompleteExchange = async () => {
    if (!exchange) return;

    try {
      const updatedExchange = await exchangeService.completeExchange(exchange.exchangeId);
      setExchange(updatedExchange);
      Alert.alert('Éxito', 'Intercambio completado correctamente');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al completar el intercambio');
    }
  };

  const handleCancelExchange = async () => {
    if (!exchange) return;

    Alert.alert(
      'Cancelar Intercambio',
      '¿Estás seguro de que quieres cancelar este intercambio?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedExchange = await exchangeService.cancelExchange(exchange.exchangeId);
              setExchange(updatedExchange);
              Alert.alert('Éxito', 'Intercambio cancelado');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al cancelar el intercambio');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!exchange) return;

    try {
      const shareMessage = `¡Mira este intercambio en GreenLoop!\n\n${exchange.requestedProductName} ↔️ ${exchange.offeredProductName}\n\nEstado: ${getStatusText(exchange.status)}`;
      
      await Share.share({
        message: shareMessage,
        title: 'Intercambio GreenLoop',
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContactRequester = () => {
    if (!exchange) return;
    // Navegar al chat con el solicitante
    navigation.navigate('ChatDetail', { 
      userId: exchange.requesterId
    });
  };

  const handleContactProvider = () => {
    if (!exchange) return;
    // Navegar al chat con el proveedor
    navigation.navigate('ChatDetail', { 
      userId: exchange.providerId
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'ACCEPTED': return '#2196F3';
      case 'COMPLETED': return '#4CAF50';
      case 'REJECTED': return '#F44336';
      case 'CANCELLED': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'ACCEPTED': return 'Aceptado';
      case 'COMPLETED': return 'Completado';
      case 'REJECTED': return 'Rechazado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'ACCEPTED': return '✅';
      case 'COMPLETED': return '🎉';
      case 'REJECTED': return '❌';
      case 'CANCELLED': return '🚫';
      default: return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canAccept = () => {
    return exchange && 
           exchange.status === 'PENDING' && 
           isProvider;
  };

  const canReject = () => {
    return exchange && 
           exchange.status === 'PENDING' && 
           isProvider;
  };

  const canComplete = () => {
    return exchange && 
           exchange.status === 'ACCEPTED' && 
           (isRequester || isProvider);
  };

  const canCancel = () => {
    return exchange && 
           (exchange.status === 'PENDING' || exchange.status === 'ACCEPTED') && 
           (isRequester || isProvider);
  };

  const getAvailableActions = () => {
    if (!exchange) return [];

    const actions = [];

    if (canAccept()) {
      actions.push({
        title: 'Aceptar Intercambio',
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
        onPress: handleAcceptExchange
      });
    }

    if (canReject()) {
      actions.push({
        title: 'Rechazar Intercambio',
        icon: 'close-circle-outline',
        color: '#F44336',
        onPress: handleRejectExchange
      });
    }

    if (canComplete()) {
      actions.push({
        title: 'Completar Intercambio',
        icon: 'checkmark-done-circle-outline',
        color: '#4CAF50',
        onPress: handleCompleteExchange
      });
    }

    if (canCancel()) {
      actions.push({
        title: 'Cancelar Intercambio',
        icon: 'close-circle-outline',
        color: '#F44336',
        onPress: handleCancelExchange
      });
    }

    if (!isRequester) {
      actions.push({
        title: 'Contactar Solicitante',
        icon: 'chatbubble-outline',
        color: '#2196F3',
        onPress: handleContactRequester
      });
    }

    if (!isProvider) {
      actions.push({
        title: 'Contactar Proveedor',
        icon: 'chatbubble-outline',
        color: '#2196F3',
        onPress: handleContactProvider
      });
    }

    return actions;
  };

  useEffect(() => {
    loadExchange();
  }, [exchangeId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando intercambio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exchange) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Intercambio no encontrado'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExchange}>
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
        {/* Header con estado */}
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon(exchange.status)}</Text>
            <Text style={[styles.statusText, { color: getStatusColor(exchange.status) }]}>
              {getStatusText(exchange.status)}
            </Text>
          </View>
        </View>

        {/* Productos del intercambio */}
        <View style={styles.content}>
          <Text style={styles.title}>🔄 Intercambio de Productos</Text>
          
          {/* Producto solicitado */}
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>📥 Producto Solicitado</Text>
            <View style={styles.productCard}>
              <Image 
                source={{ uri: exchange.requestedProductImage }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{exchange.requestedProductName}</Text>
                <Text style={styles.productOwner}>de {exchange.requesterName}</Text>
              </View>
            </View>
          </View>

          {/* Flecha de intercambio */}
          <View style={styles.exchangeArrow}>
            <Ionicons name="swap-horizontal" size={32} color="#2196F3" />
          </View>

          {/* Producto ofrecido */}
          <View style={styles.productSection}>
            <Text style={styles.sectionTitle}>📤 Producto Ofrecido</Text>
            <View style={styles.productCard}>
              <Image 
                source={{ uri: exchange.offeredProductImage }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{exchange.offeredProductName}</Text>
                <Text style={styles.productOwner}>de {exchange.providerName}</Text>
              </View>
            </View>
          </View>

          {/* Detalles del intercambio */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>📋 Detalles del Intercambio</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Solicitante:</Text>
              <Text style={styles.detailValue}>{exchange.requesterName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Proveedor:</Text>
              <Text style={styles.detailValue}>{exchange.providerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de Solicitud:</Text>
              <Text style={styles.detailValue}>{formatDate(exchange.requestedAt)}</Text>
            </View>

            {exchange.completedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha de Completado:</Text>
                <Text style={styles.detailValue}>{formatDate(exchange.completedAt)}</Text>
              </View>
            )}
          </View>

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
            <Text style={styles.shareButtonText}>Compartir Intercambio</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  productSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productOwner: {
    fontSize: 14,
    color: '#666',
  },
  exchangeArrow: {
    alignItems: 'center',
    marginVertical: 16,
  },
  detailsContainer: {
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
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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

export default ExchangeDetailScreen; 