import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunitySummaryDto, CommunityType } from '../types/community';
import { colors, fontSizes, fonts, borderRadius, spacing, shadow } from '../styles/theme';

interface Props {
  community: CommunitySummaryDto;
  isMember?: boolean;
  onPress: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}

const CommunityCard: React.FC<Props> = ({ 
  community, 
  isMember = false, 
  onPress, 
  onJoin, 
  onLeave 
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        {/* Si en el futuro hay imagen: community.imageUrl ? <Image ... /> : ... */}
        <Ionicons name="people-circle-outline" size={36} color={colors.primary} style={styles.avatarIcon} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.name}>{community.name}</Text>
        <View style={[styles.typeBadge, { backgroundColor: community.type === CommunityType.PUBLIC ? colors.success : colors.accent }]}> 
          <Text style={styles.typeText}>
            {community.type === CommunityType.PUBLIC ? 'Pública' : 'Privada'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </View>
    
    <Text style={styles.description} numberOfLines={2}>
      {community.description}
    </Text>
    
    <View style={styles.footer}>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color={colors.gray} />
          <Text style={styles.statText}>{community.memberCount} miembros</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={16} color={colors.gray} />
          <Text style={styles.statText}>
            {new Date(community.createdAt).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>
      
      {onJoin && onLeave && (
        <TouchableOpacity 
          style={[styles.actionButton, isMember ? styles.leaveButton : styles.joinButton]}
          onPress={isMember ? onLeave : onJoin}
        >
          <Text style={[styles.actionText, isMember ? styles.leaveText : styles.joinText]}>
            {isMember ? 'Abandonar' : 'Unirse'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatarIcon: {
    // Tamaño y color ya definidos arriba
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSizes.subtitle,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    fontFamily: fonts.bold,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.gray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSizes.small,
    color: colors.gray,
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  joinButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderColor: colors.error,
  },
  actionText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  joinText: {
    color: colors.white,
  },
  leaveText: {
    color: colors.error,
  },
});

export default CommunityCard; 