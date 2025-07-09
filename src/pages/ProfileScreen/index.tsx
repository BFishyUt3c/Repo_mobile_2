import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../../styles/theme';

const ProfileScreen: React.FC = () => {
  const { user, loading, error, refreshUser } = useUser();
  const { user: authUser, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (authUser?.id) {
      refreshUser(authUser.id);
    }
  }, [authUser]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Reintentar" onPress={() => authUser?.id && refreshUser(authUser.id)} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar y nombre */}
      <View style={styles.header}>
        <AvatarPlaceholder name={user?.firstName || user?.email || ''} size={80} />
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.level}>Nivel: {user.level} | Puntos: {user.points}</Text>
      </View>

      {/* Info adicional */}
      <View style={styles.infoBox}>
        <Text>Donados: {user.itemsDonated} | Intercambiados: {user.itemsExchanged}</Text>
        <Text>Productos: {user.totalProductsCount} | Posts: {user.totalPostsCount}</Text>
        <Text>Miembro desde: {user.joinedAt?.split('T')[0]}</Text>
        <Text style={styles.description}>{user.description}</Text>
      </View>

      {/* Navegación a deseos y donaciones */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('WishlistScreen' as never)}>
          <Text style={styles.actionText}>Mis deseos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DonationsScreen' as never)}>
          <Text style={styles.actionText}>Mis donaciones</Text>
        </TouchableOpacity>
      </View>

      {/* Opcionales: editar perfil, configuración, cerrar sesión */}
      <View style={styles.options}>
        <Button title="Editar perfil" onPress={() => navigation.navigate('EditProfileScreen' as never)} />
        <Button title="Configuración" onPress={() => navigation.navigate('SettingsScreen' as never)} />
        <Button title="Cerrar sesión" color={colors.error} onPress={logout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarLetter: {
    fontSize: fontSizes.title,
    color: colors.white,
    fontWeight: 'bold',
  },
  name: {
    fontSize: fontSizes.subtitle,
    color: colors.black,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
  },
  level: {
    fontSize: fontSizes.small,
    color: colors.success,
    marginTop: spacing.xs,
  },
  infoBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadow,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  description: {
    marginTop: spacing.xs,
    fontStyle: 'italic',
    color: colors.gray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.success,
    marginHorizontal: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadow,
  },
  actionText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
  },
  options: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadow,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.sm,
  },
});

export default ProfileScreen;
