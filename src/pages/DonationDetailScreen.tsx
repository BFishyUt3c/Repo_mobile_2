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
import { donationService } from '../services/donationService';
import { DonationResponseDto, DonationStatus } from '../types/donation';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  donationId: number;
}

const DonationDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { donationId } = route.params as RouteParams;
  
  const [donation, setDonation] = useState<DonationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDonor, setIsDonor] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);

  const loadDonation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationService.getDonationById(donationId);
      setDonation(data);
      // Determinar si el usuario actual es el donante o receptor
      // Esto dependerá de cómo esté estructurado el backend
      setIsDonor(data.donorId === 1); // Placeholder - usar ID real del usuario
      setIsReceiver(data.receiverId === 1); // Placeholder - usar ID real del usuario
    } catch (err: any) {
      setError(err.message || 'Error al cargar la donación');
      console.error('Error loading donation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDonation = async () => {
    if (!donation) return;

    try {
      const updatedDonation = await donationService.requestDonation(donation.id);
      setDonation(updatedDonation);
      Alert.alert('Éxito', 'Solicitud de donación enviada correctamente');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al solicitar la donación');
    }
  };

  const handleUpdateStatus = async (newStatus: DonationStatus) => {
    if (!donation) return;

    try {
      const updatedDonation = await donationService.updateDonation(
        donation.id,
        { status: newStatus }
      );
      setDonation(updatedDonation);
      Alert.alert('Éxito', 'Estado de la donación actualizado correctamente');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar el estado');
    }
  };

  const handleShare = async () => {
    if (!donation) return;

    try {
      const shareMessage = `¡Mira esta donación en GreenLoop!\n\n${donation.title}\n${donation.description}\n\nProducto: ${donation.productName}`;
      
      await Share.share({
        message: shareMessage,
        title: donation.title,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContactDonor = () => {
    if (!donation) return;
    // Navegar al chat con el donante
    navigation.navigate({ name: 'ChatDetail', params: { 
      userId: donation.donorId
    } });
  };

  const handleContactReceiver = () => {
    if (!donation || !donation.receiverId) return;
    // Navegar al chat con el receptor
    navigation.navigate({ name: 'ChatDetail', params: { 
      userId: donation.receiverId
    } });
  };

  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.PENDING: return '#FF9800';
      case DonationStatus.CONFIRMED: return '#2196F3';
      case DonationStatus.COMPLETED: return '#4CAF50';
      case DonationStatus.CANCELLED: return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.PENDING: return 'Pendiente';
      case DonationStatus.CONFIRMED: return 'Confirmada';
      case DonationStatus.COMPLETED: return 'Completada';
      case DonationStatus.CANCELLED: return 'Cancelada';
      default: return status;
    }
  };

  const getStatusIcon = (status: DonationStatus) => {
    switch (status) {
      case DonationStatus.PENDING: return '⏳';
      case DonationStatus.CONFIRMED: return '✅';
      case DonationStatus.COMPLETED: return '🎉';
      case DonationStatus.CANCELLED: return '❌';
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

  const canRequestDonation = () => {
    return donation && 
           donation.status === DonationStatus.PENDING && 
           !isDonor && 
           !isReceiver;
  };

  const canUpdateStatus = () => {
    return donation && (isDonor || isReceiver);
  };

  const getAvailableActions = () => {
    if (!donation) return [];

    const actions = [];

    if (canRequestDonation()) {
      actions.push({
        title: 'Solicitar Donación',
        icon: 'hand-left-outline',
        color: '#4CAF50',
        onPress: handleRequestDonation
      });
    }

    if (isDonor && donation.status === DonationStatus.PENDING) {
      actions.push(
        {
          title: 'Confirmar Donación',
          icon: 'checkmark-circle-outline',
          color: '#4CAF50',
          onPress: () => handleUpdateStatus(DonationStatus.CONFIRMED)
        },
        {
          title: 'Cancelar Donación',
          icon: 'close-circle-outline',
          color: '#F44336',
          onPress: () => handleUpdateStatus(DonationStatus.CANCELLED)
        }
      );
    }

    if (isReceiver && donation.status === DonationStatus.CONFIRMED) {
      actions.push({
        title: 'Marcar como Completada',
        icon: 'checkmark-done-circle-outline',
        color: '#4CAF50',
        onPress: () => handleUpdateStatus(DonationStatus.COMPLETED)
      });
    }

    if (donation.receiverId && !isDonor) {
      actions.push({
        title: 'Contactar Receptor',
        icon: 'chatbubble-outline',
        color: '#2196F3',
        onPress: handleContactReceiver
      });
    }

    if (!isReceiver) {
      actions.push({
        title: 'Contactar Donante',
        icon: 'chatbubble-outline',
        color: '#2196F3',
        onPress: handleContactDonor
      });
    }

    return actions;
  };

  useEffect(() => {
    loadDonation();
  }, [donationId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando donación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !donation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Donación no encontrada'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDonation}>
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
        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          {donation.imageUrl ? (
            <Image 
              source={{ uri: donation.imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎁</Text>
            </View>
          )}
          
          {/* Badge de estado */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusIcon}>{getStatusIcon(donation.status)}</Text>
            <Text style={[styles.statusText, { color: getStatusColor(donation.status) }]}>
              {getStatusText(donation.status)}
            </Text>
          </View>
        </View>

        {/* Información de la donación */}
        <View style={styles.content}>
          <Text style={styles.title}>{donation.title}</Text>
          
          <View style={styles.productInfo}>
            <Text style={styles.productLabel}>Producto:</Text>
            <Text style={styles.productName}>{donation.productName}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Donante:</Text>
              <Text style={styles.detailValue}>{donation.donorName}</Text>
            </View>

            {donation.receiverName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receptor:</Text>
                <Text style={styles.detailValue}>{donation.receiverName}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de Donación:</Text>
              <Text style={styles.detailValue}>{formatDate(donation.donationDate)}</Text>
            </View>

            {donation.receivedDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha de Recepción:</Text>
                <Text style={styles.detailValue}>{formatDate(donation.receivedDate)}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ubicación:</Text>
              <Text style={styles.detailValue}>{donation.donationLocation}</Text>
            </View>

            {donation.pointsAwarded && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Puntos Ganados:</Text>
                <Text style={styles.pointsValue}>+{donation.pointsAwarded} pts</Text>
              </View>
            )}
          </View>

          {donation.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>📝 Descripción</Text>
              <Text style={styles.descriptionText}>{donation.description}</Text>
            </View>
          )}

          {donation.donorNote && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>💬 Nota del Donante</Text>
              <Text style={styles.noteText}>{donation.donorNote}</Text>
            </View>
          )}

          {donation.receiverNote && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>💬 Nota del Receptor</Text>
              <Text style={styles.noteText}>{donation.receiverNote}</Text>
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
            <Text style={styles.shareButtonText}>Compartir Donación</Text>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    color: '#ccc',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  noteContainer: {
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
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
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

export default DonationDetailScreen; 