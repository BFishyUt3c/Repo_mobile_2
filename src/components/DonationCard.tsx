import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { DonationSummaryDto, DonationStatus } from '../types/donation';

interface DonationCardProps {
  donation: DonationSummaryDto;
  onPress: (donation: DonationSummaryDto) => void;
  onRequestPress?: (donation: DonationSummaryDto) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ 
  donation, 
  onPress, 
  onRequestPress 
}) => {
  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case 'PENDING': return '#FFC107';
      case 'CONFIRMED': return '#2196F3';
      case 'COMPLETED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: DonationStatus) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmada';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(donation)}
      activeOpacity={0.7}
    >
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(donation.status) }]}>
          <Text style={styles.statusText}>{getStatusText(donation.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {donation.title}
        </Text>
        
        <Text style={styles.donor} numberOfLines={1}>
          Donado por: {donation.donorName}
        </Text>

        <Text style={styles.product} numberOfLines={1}>
          Producto: {donation.productName}
        </Text>

        <Text style={styles.location} numberOfLines={1}>
          📍 {donation.donationLocation}
        </Text>

        <Text style={styles.date}>
          {formatDate(donation.donationDate)}
        </Text>

        {onRequestPress && donation.status === 'PENDING' && (
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={() => onRequestPress(donation)}
          >
            <Text style={styles.requestButtonText}>Solicitar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderText: {
    fontSize: 48,
    color: '#ccc',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  donor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  product: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  requestButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DonationCard; 