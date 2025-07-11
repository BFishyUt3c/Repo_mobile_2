import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { colors, fonts, fontSizes } from '../../styles/theme';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';

const Avatar = ({ name }: { name: string }) => (
  <View style={styles.avatarContainer}>
    <AvatarPlaceholder name={name} size={80} />
    <View style={styles.editAvatarButton}>
      <Ionicons name="camera" size={16} color={colors.white} />
    </View>
  </View>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Editar Perfil',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile' as never),
      color: colors.primary,
    },
    {
      title: 'Mis Donaciones',
      icon: 'gift-outline',
      onPress: () => navigation.navigate('Donations' as never),
      color: colors.success,
    },
    {
      title: 'Mis Intercambios',
      icon: 'swap-horizontal-outline',
      onPress: () => navigation.navigate('Exchanges' as never),
      color: colors.accent,
    },
    {
      title: 'Buscar Personas',
      icon: 'people-outline',
      onPress: () => navigation.navigate('SearchPeople' as never),
      color: colors.warning,
    },
    {
      title: 'Mis Contactos',
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate('Contacts' as never),
      color: colors.info,
    },
    {
      title: 'Lista de Deseos',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Wishlist' as never),
      color: colors.error,
    },
    {
      title: 'Estadísticas',
      icon: 'analytics-outline',
      onPress: () => navigation.navigate('Statistics' as never),
      color: colors.info,
    },
    {
      title: 'Configuración',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Settings' as never),
      color: colors.textSecondary,
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemContent}>
        <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={20} color={colors.white} />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.points || 0}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.level || 'Novato'}</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.itemsDonated || 0}</Text>
                <Text style={styles.statLabel}>Donaciones</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>GreenLoop v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primaryText,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statValue: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    color: colors.primaryText,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.primaryText,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
