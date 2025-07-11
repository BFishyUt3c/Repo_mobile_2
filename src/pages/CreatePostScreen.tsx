import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fonts, spacing, borderRadius } from '../styles/theme';

interface CreatePostScreenProps {
  route?: {
    params?: {
      type?: 'DONATION' | 'EXCHANGE';
    };
  };
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const postType = route.params?.type || 'DONATION';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    if (!content.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }
    if (!location.trim()) {
      setError('La ubicación es obligatoria');
      return false;
    }
    return true;
  };

  const handleCreatePost = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular creación de post
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Post Creado',
        'Tu post se ha publicado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setError('No se pudo crear el post. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim() || location.trim()) {
      Alert.alert(
        'Descartar Post',
        '¿Estás seguro de que quieres descartar el post?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getTypeColor = () => {
    return postType === 'DONATION' ? colors.success : colors.accent;
  };

  const getTypeIcon = () => {
    return postType === 'DONATION' ? 'gift-outline' : 'swap-horizontal-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={colors.gray} />
          </TouchableOpacity>
          <Text style={styles.title}>Crear Post</Text>
          <TouchableOpacity 
            style={[styles.publishButton, (!title.trim() || !content.trim() || !location.trim() || loading) && styles.publishButtonDisabled]} 
            onPress={handleCreatePost}
            disabled={!title.trim() || !content.trim() || !location.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.publishButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.typeContainer, { backgroundColor: getTypeColor() + '20' }]}>
            <Ionicons name={getTypeIcon()} size={24} color={getTypeColor()} />
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {postType === 'DONATION' ? 'Donación' : 'Intercambio'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput 
                style={[styles.input, !title.trim() && styles.inputError]} 
                value={title} 
                onChangeText={(text) => {
                  setTitle(text);
                  setError('');
                }} 
                placeholder="Título de tu post" 
                maxLength={100}
              />
              <Text style={styles.characterCount}>{title.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput 
                style={[styles.input, styles.textarea, !content.trim() && styles.inputError]} 
                value={content} 
                onChangeText={(text) => {
                  setContent(text);
                  setError('');
                }} 
                placeholder="Describe qué ofreces o buscas..." 
                multiline 
                numberOfLines={6}
                maxLength={500}
              />
              <Text style={styles.characterCount}>{content.length}/500</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación *</Text>
              <TextInput 
                style={[styles.input, !location.trim() && styles.inputError]} 
                value={location} 
                onChangeText={(text) => {
                  setLocation(text);
                  setError('');
                }} 
                placeholder="Ciudad o zona" 
                maxLength={100}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  publishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: colors.gray,
  },
  publishButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  content: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
  },
  typeText: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    marginLeft: spacing.sm,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: fontSizes.small,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
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
});

export default CreatePostScreen; 