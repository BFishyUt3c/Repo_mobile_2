import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { communityService } from '../services/communityService';
import { CommunityResponseDto, CommunityRequestDto, CommunityType } from '../types/community';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';

interface RouteParams {
  communityId?: number;
}

const CreateEditCommunityScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { communityId } = route.params as RouteParams || {};

  const [formData, setFormData] = useState<CommunityRequestDto>({
    name: '',
    description: '',
    type: CommunityType.PUBLIC,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!communityId;

  useEffect(() => {
    if (isEditing && communityId) {
      loadCommunity();
    }
  }, [communityId, isEditing]);

  const loadCommunity = async () => {
    try {
      setLoading(true);
      const community = await communityService.getCommunityById(communityId!);
      setFormData({
        name: community.name,
        description: community.description,
        type: community.type,
      });
    } catch (error) {
      console.error('Error loading community:', error);
      Alert.alert('Error', 'No se pudo cargar la comunidad');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (isEditing) {
        await communityService.updateCommunity(communityId!, {
          description: formData.description,
        });
        Alert.alert('Éxito', 'Comunidad actualizada correctamente');
      } else {
        await communityService.createCommunity(formData);
        Alert.alert('Éxito', 'Comunidad creada correctamente');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving community:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar la comunidad');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CommunityRequestDto, value: string) => {
    setFormData((prev: CommunityRequestDto) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev: { [key: string]: string }) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (type: CommunityType) => {
    setFormData((prev: CommunityRequestDto) => ({ ...prev, type }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando comunidad...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Editar Comunidad' : 'Crear Comunidad'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la comunidad *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ej: Amigos del Reciclaje"
              placeholderTextColor={colors.gray}
              maxLength={50}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe el propósito y objetivos de tu comunidad..."
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {formData.description.length}/500
            </Text>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Tipo de comunidad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de comunidad</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === CommunityType.PUBLIC && styles.typeButtonActive
                ]}
                onPress={() => handleTypeChange(CommunityType.PUBLIC)}
              >
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={formData.type === CommunityType.PUBLIC ? colors.white : colors.primary}
                />
                <Text style={[
                  styles.typeButtonText,
                  formData.type === CommunityType.PUBLIC && styles.typeButtonTextActive
                ]}>
                  Pública
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === CommunityType.PRIVATE && styles.typeButtonActive
                ]}
                onPress={() => handleTypeChange(CommunityType.PRIVATE)}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={formData.type === CommunityType.PRIVATE ? colors.white : colors.primary}
                />
                <Text style={[
                  styles.typeButtonText,
                  formData.type === CommunityType.PRIVATE && styles.typeButtonTextActive
                ]}>
                  Privada
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              {formData.type === CommunityType.PUBLIC 
                ? 'Cualquier usuario puede ver y unirse a la comunidad'
                : 'Los usuarios necesitan solicitar permiso para unirse'
              }
            </Text>
          </View>

          {/* Información adicional */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Consejos para crear una buena comunidad</Text>
              <Text style={styles.infoText}>
                • Elige un nombre descriptivo y memorable{'\n'}
                • Explica claramente el propósito de la comunidad{'\n'}
                • Considera si debe ser pública o privada{'\n'}
                • Piensa en las reglas y valores de la comunidad
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de guardar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="checkmark" size={20} color={colors.white} />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.body,
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.black,
    fontFamily: fonts.bold,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.xs,
    fontFamily: fonts.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.body,
    color: colors.black,
    backgroundColor: colors.white,
    fontFamily: fonts.regular,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.body,
    color: colors.black,
    backgroundColor: colors.white,
    fontFamily: fonts.regular,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.small,
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: fontSizes.small,
    color: colors.gray,
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  helpText: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
    fontFamily: fonts.medium,
  },
  infoText: {
    fontSize: fontSizes.small,
    color: colors.gray,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.regular,
  },
});

export default CreateEditCommunityScreen; 