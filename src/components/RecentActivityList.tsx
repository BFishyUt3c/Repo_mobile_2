import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RecentActivityDto } from '../types/RecentActivityDto';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, borderRadius, spacing, fonts } from '../styles/theme';

interface Props {
  data: RecentActivityDto[];
}

const iconMap: Record<string, string> = {
  donation: 'gift-outline',
  exchange: 'swap-horizontal-outline',
  community: 'people-outline',
  user_joined: 'person-add-outline',
};

const RecentActivityList: React.FC<Props> = ({ data }) => (
  <FlatList
    data={data}
    keyExtractor={(_, i) => i.toString()}
    renderItem={({ item }) => (
      <View style={styles.item}>
        <View style={styles.iconCircle}>
          <Ionicons name={(iconMap[item.type] as any) || 'alert-circle-outline'} size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.action}>{item.userName} {item.action} <Text style={styles.itemName}>{item.itemName}</Text></Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>
    )}
    ListEmptyComponent={<Text style={styles.empty}>No hay actividad reciente.</Text>}
  />
);

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    paddingHorizontal: spacing.xs,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  action: {
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.regular,
  },
  itemName: {
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  timeAgo: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: colors.gray,
    marginTop: spacing.xl,
  },
});

export default RecentActivityList;
