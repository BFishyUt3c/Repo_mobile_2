import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, fonts } from '../../styles/theme';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/userService';
import * as ImagePicker from 'expo-image-picker';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen: React.FC = () => {
  const { user, refreshUser } = useUser();
  const { user: authUser, token } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.description || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const hasChanges = () => {
    return (
      firstName !== (user?.firstName || '') ||
      lastName !== (user?.lastName || '') ||
      address !== (user?.address || '') ||
      description !== (user?.description || '')
    );
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!lastName.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        description: description.trim()
      };

      await updateProfile(profileData, token);
      setSuccess(true);
      
      // Actualizar el contexto de usuario
      if (authUser?.id) {
        await refreshUser(authUser.id);
      }
      
      Alert.alert(
        'Perfil Actualizado', 
        'Tus cambios se han guardado correctamente.',
        [{ text: 'OK' }]
      );
    } catch (e: any) {
      console.error('Error updating profile:', e);
      let errorMessage = 'No se pudo actualizar el perfil';
      
      if (e.response?.status === 400) {
        errorMessage = 'Los datos enviados no son válidos. Verifica la información.';
      } else if (e.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (e.response?.status === 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Descartar Cambios',
        '¿Estás seguro de que quieres descartar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              setFirstName(user?.firstName || '');
              setLastName(user?.lastName || '');
              setAddress(user?.address || '');
              setDescription(user?.description || '');
              setError('');
              setSuccess(false);
            }
          }
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <TouchableOpacity 
            style={[styles.saveButton, (!hasChanges() || loading) && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={!hasChanges() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <AvatarPlaceholder name={firstName || user?.email || ''} size={80} />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput 
              style={[styles.input, !firstName.trim() && styles.inputError]} 
              value={firstName} 
              onChangeText={(text) => {
                setFirstName(text);
                setError('');
              }} 
              placeholder="Tu nombre" 
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput 
              style={[styles.input, !lastName.trim() && styles.inputError]} 
              value={lastName} 
              onChangeText={(text) => {
                setLastName(text);
                setError('');
              }} 
              placeholder="Tu apellido" 
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput 
              style={styles.input} 
              value={address} 
              onChangeText={(text) => {
                setAddress(text);
                setError('');
              }} 
              placeholder="Tu dirección (opcional)" 
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput 
              style={[styles.input, styles.textarea]} 
              value={description} 
              onChangeText={(text) => {
                setDescription(text);
                setError('');
              }} 
              placeholder="Cuéntanos sobre ti (opcional)" 
              multiline 
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.emailContainer}>
              <Text style={styles.email}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={16} color={colors.gray} />
            </View>
            <Text style={styles.emailNote}>El correo electrónico no se puede modificar</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.success}>¡Perfil actualizado correctamente!</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: fontSizes.subtitle,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.body,
    color: colors.black,
    marginBottom: spacing.xs,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: fontSizes.small,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  email: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
  emailNote: {
    fontSize: fontSizes.small,
    color: colors.gray,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  error: {
    color: colors.error,
    marginLeft: spacing.sm,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  success: {
    color: colors.success,
    marginLeft: spacing.sm,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    flex: 1,
  },
});

export default EditProfileScreen; 