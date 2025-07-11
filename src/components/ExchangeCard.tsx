import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExchangeResponse } from '../types/exchange';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

interface Props {
  exchange: ExchangeResponse;
  isRequester?: boolean;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

function isValidImage(url?: string) {
  return !!url && url.startsWith('http') && url.length > 10;
}

const ExchangeCard: React.FC<Props> = ({ 
  exchange, 
  isRequester = false,
  onPress,
  onAccept,
  onReject,
  onComplete,
  onCancel
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.warning;
      case 'ACCEPTED': return colors.primary;
      case 'COMPLETED': return colors.success;
      case 'REJECTED': return colors.danger;
      case 'CANCELLED': return colors.gray;
      default: return colors.gray;
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

  const canAccept = !isRequester && exchange.status === 'PENDING';
  const canReject = !isRequester && exchange.status === 'PENDING';
  const canComplete = exchange.status === 'ACCEPTED';
  const canCancel = isRequester && (exchange.status === 'PENDING' || exchange.status === 'ACCEPTED');

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <View style={styles.header}>
          {isValidImage(exchange.requestedProductImage) ? (
            <Image source={{ uri: exchange.requestedProductImage }} style={styles.image} />
          ) : (
            <Ionicons name="cube-outline" size={28} color={colors.accent} style={styles.icon} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{exchange.requestedProductName}</Text>
            <Text style={styles.subtitle}>por {exchange.offeredProductName}</Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exchange.status) + '20' }]}>
            <Text style={[styles.status, { color: getStatusColor(exchange.status) }]}>
              {getStatusText(exchange.status)}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(exchange.requestedAt).toLocaleDateString('es-ES')}
          </Text>
        </View>
        
        <Text style={styles.userInfo}>
          {isRequester ? `Para: ${exchange.providerName}` : `De: ${exchange.requesterName}`}
        </Text>
      </TouchableOpacity>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {canAccept && (
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}>
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Aceptar</Text>
          </TouchableOpacity>
        )}
        
        {canReject && (
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
            <Ionicons name="close" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        )}
        
        {canComplete && (
          <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={onComplete}>
            <Ionicons name="checkmark-circle" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Completar</Text>
          </TouchableOpacity>
        )}
        
        {canCancel && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
            <Ionicons name="close-circle" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadow,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    backgroundColor: colors.lightGray,
  },
  title: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: colors.black,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontFamily: fonts.regular,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  status: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  date: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  userInfo: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.danger,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
});

export default ExchangeCard; 