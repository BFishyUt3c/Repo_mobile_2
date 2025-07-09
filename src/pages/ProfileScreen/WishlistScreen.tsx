import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../../styles/theme';
import { useUser } from '../../contexts/UserContext';

const WishlistScreen: React.FC = () => {
  const { user, loading, error } = useUser();

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 60 }} size="large" color={colors.primary} />;
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.error, fontWeight: 'bold' }}>{error}</Text>
      </View>
    );
  }
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No se encontró el usuario.</Text>
      </View>
    );
  }
  const wishlists = user.wishLists || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis listas de deseos</Text>
      <FlatList
        data={wishlists}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.product}>{item.name}</Text>
            <Text style={styles.status}>{item.productCount || 0} productos</Text>
            <Text style={styles.status}>{item.isPublic ? 'Pública' : 'Privada'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tienes listas de deseos.</Text>}
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
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fonts.bold,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadow,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  product: {
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.medium,
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  empty: {
    textAlign: 'center',
    color: colors.gray,
    marginTop: spacing.xl,
  },
});

export default WishlistScreen;
