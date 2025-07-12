import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { colors, fontSizes, fonts, spacing, borderRadius } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // Estados para las configuraciones
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Limpiar Caché',
      '¿Estás seguro de que quieres limpiar la caché? Esto puede mejorar el rendimiento de la aplicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            setLoading(true);
            try {
              // Limpiar caché de imágenes y datos temporales
              await AsyncStorage.multiRemove([
                'cached_products',
                'cached_communities',
                'cached_posts'
              ]);
              Alert.alert('Éxito', 'Caché limpiada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la caché');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Esta función te permitirá exportar tus datos personales. Próximamente disponible.',
      [{ text: 'Entendido' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Política de Privacidad',
      'Nuestra política de privacidad protege tus datos personales. Puedes consultarla en nuestra página web.',
      [{ text: 'Entendido' }]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Términos de Servicio',
      'Al usar GreenLoop aceptas nuestros términos de servicio. Puedes consultarlos en nuestra página web.',
      [{ text: 'Entendido' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de GreenLoop',
      'GreenLoop v1.0.0\n\nUna aplicación para promover la economía circular y el intercambio sostenible de productos.',
      [{ text: 'Entendido' }]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.gray} />)}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Procesando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Configuración</Text>
      {/* Configuraciones de la App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de la App</Text>
        {renderSettingItem(
          'notifications-outline',
          'Notificaciones',
          'Recibir notificaciones push',
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.gray}
          />
        )}
        {renderSettingItem(
          'location-outline',
          'Ubicación',
          'Permitir acceso a ubicación',
          undefined,
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={locationEnabled ? colors.primary : colors.gray}
          />
        )}
        {renderSettingItem(
          'sync-outline',
          'Sincronización Automática',
          'Sincronizar datos automáticamente',
          undefined,
          <Switch
            value={autoSyncEnabled}
            onValueChange={setAutoSyncEnabled}
            trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
            thumbColor={autoSyncEnabled ? colors.primary : colors.gray}
          />
        )}
      </View>
      {/* Datos y Privacidad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos y Privacidad</Text>
        {renderSettingItem(
          'document-text-outline',
          'Política de Privacidad',
          undefined,
          handlePrivacyPolicy
        )}
        {renderSettingItem(
          'shield-checkmark-outline',
          'Términos de Servicio',
          undefined,
          handleTermsOfService
        )}
      </View>
      {/* Acerca de */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>
        {renderSettingItem(
          'information-circle-outline',
          'Acerca de GreenLoop',
          undefined,
          handleAbout
        )}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
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
    color: colors.primary,
    fontFamily: fonts.bold,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.subtitle,
    color: colors.primary,
    fontFamily: fonts.semiBold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.medium,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: fontSizes.body,
    color: colors.error,
    fontFamily: fonts.medium,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
});

export default SettingsScreen; 