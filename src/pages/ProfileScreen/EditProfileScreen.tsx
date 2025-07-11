import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, fonts } from '../../styles/theme';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../services/userService';
import * as ImagePicker from 'expo-image-picker';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';

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

  const handleSave = async () => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile({ firstName, lastName, address, description }, token);
      setSuccess(true);
      if (authUser?.id) await refreshUser(authUser.id);
      Alert.alert('Perfil actualizado', 'Tus cambios se han guardado correctamente.');
    } catch (e: any) {
      setError('No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Editar Perfil</Text>
        <View style={styles.avatarContainer}>
          <AvatarPlaceholder name={firstName || user?.email || ''} size={80} />
        </View>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Nombre" />
        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Apellido" />
        <Text style={styles.label}>Dirección</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Dirección" />
        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Descripción" multiline numberOfLines={3} />
        <Text style={styles.label}>Correo electrónico</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>¡Perfil actualizado!</Text> : null}
        <TouchableOpacity style={[styles.button, !hasChanges() && styles.buttonDisabled]} onPress={handleSave} disabled={!hasChanges() || loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: fontSizes.body,
    color: colors.gray,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    fontFamily: fonts.regular,
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  email: {
    width: '100%',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
  },
  success: {
    color: colors.success,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
    backgroundColor: colors.primaryLight,
  },
  avatarEditText: {
    color: colors.primary,
    fontSize: fontSizes.small,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

export default EditProfileScreen; 