import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productService } from '../services/productService';
import { ProductResponseDto, Category, Condition } from '../types/product';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface RouteParams {
  product?: ProductResponseDto; // Si existe, es edición
}

const CreateEditProductScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: 'OTHER' as Category,
    condition: 'GOOD' as Condition,
    estimatedValue: '',
    imageUrl: '',
    availableForExchange: false,
    exchangePreferences: '',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      // Cargar datos del producto para edición
      setFormData({
        productName: product.productName,
        description: product.description,
        category: product.category,
        condition: product.condition,
        estimatedValue: product.estimatedValue.toString(),
        imageUrl: product.imageUrl,
        availableForExchange: product.availableForExchange,
        exchangePreferences: product.exchangePreferences || '',
      });
      setImageUri(product.imageUrl);
    }
  }, [product]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        // En una implementación real, aquí subirías la imagen al servidor
        // y obtendrías la URL
        setFormData(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'Error al seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de cámara para tomar una foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
      }
    } catch (err) {
      Alert.alert('Error', 'Error al tomar la foto');
    }
  };

  const validateForm = () => {
    if (!formData.productName.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    if (!formData.estimatedValue || parseFloat(formData.estimatedValue) <= 0) {
      Alert.alert('Error', 'El valor estimado debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const productData = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        category: formData.category,
        condition: formData.condition,
        estimatedValue: parseFloat(formData.estimatedValue),
        imageUrl: formData.imageUrl,
        availableForExchange: formData.availableForExchange,
        exchangePreferences: formData.exchangePreferences.trim(),
      };

      if (isEditing && product) {
        await productService.updateProduct(product.productId, productData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await productService.createProduct(productData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
      Alert.alert('Error', err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'ELECTRONICS': return '📱';
      case 'CLOTHING': return '👕';
      case 'BOOKS': return '📚';
      case 'HOME': return '🏠';
      case 'SPORTS': return '⚽';
      case 'TOYS': return '🧸';
      default: return '📦';
    }
  };

  const getConditionIcon = (condition: Condition) => {
    switch (condition) {
      case 'NEW': return '🆕';
      case 'LIKE_NEW': return '✨';
      case 'GOOD': return '👍';
      case 'FAIR': return '👌';
      case 'POOR': return '⚠️';
      default: return '📦';
    }
  };

  const categories = [
    { key: Category.ELECTRONICS, label: 'Electrónicos', icon: '📱' },
    { key: Category.CLOTHING, label: 'Ropa', icon: '👕' },
    { key: Category.BOOKS, label: 'Libros', icon: '📚' },
    { key: Category.HOME, label: 'Hogar', icon: '🏠' },
    { key: Category.SPORTS, label: 'Deportes', icon: '⚽' },
    { key: Category.TOYS, label: 'Juguetes', icon: '🧸' },
    { key: Category.OTHER, label: 'Otros', icon: '📦' },
  ];

  const conditions = [
    { key: Condition.NEW, label: 'Nuevo', icon: '🆕' },
    { key: Condition.LIKE_NEW, label: 'Como Nuevo', icon: '✨' },
    { key: Condition.GOOD, label: 'Bueno', icon: '👍' },
    { key: Condition.FAIR, label: 'Regular', icon: '👌' },
    { key: Condition.POOR, label: 'Malo', icon: '⚠️' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? '✏️ Editar Producto' : '➕ Crear Producto'}
          </Text>

          {/* Imagen del producto */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>📸 Imagen del Producto</Text>
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Toca para seleccionar imagen</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={pickImage}
              >
                <Ionicons name="images-outline" size={20} color="#2196F3" />
                <Text style={styles.imageActionText}>Galería</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={takePhoto}
              >
                <Ionicons name="camera-outline" size={20} color="#2196F3" />
                <Text style={styles.imageActionText}>Cámara</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.productName}
                onChangeText={(value) => handleInputChange('productName', value)}
                placeholder="Ej: iPhone 12, Libro de Cocina..."
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe tu producto..."
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor Estimado ($) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.estimatedValue}
                onChangeText={(value) => handleInputChange('estimatedValue', value)}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📂 Categoría</Text>
            <View style={styles.optionsContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.optionButton,
                    formData.category === category.key && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('category', category.key)}
                >
                  <Text style={styles.optionIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    formData.category === category.key && styles.optionTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condición */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Condición</Text>
            <View style={styles.optionsContainer}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.key}
                  style={[
                    styles.optionButton,
                    formData.condition === condition.key && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('condition', condition.key)}
                >
                  <Text style={styles.optionIcon}>{condition.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    formData.condition === condition.key && styles.optionTextSelected
                  ]}>
                    {condition.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intercambio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Disponible para Intercambio</Text>
            
            <TouchableOpacity
              style={styles.switchContainer}
              onPress={() => handleInputChange('availableForExchange', !formData.availableForExchange)}
            >
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Permitir intercambios</Text>
                <Text style={styles.switchDescription}>
                  Otros usuarios podrán proponer intercambios por este producto
                </Text>
              </View>
              <View style={[
                styles.switch,
                formData.availableForExchange && styles.switchActive
              ]}>
                <View style={[
                  styles.switchThumb,
                  formData.availableForExchange && styles.switchThumbActive
                ]} />
              </View>
            </TouchableOpacity>

            {formData.availableForExchange && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferencias de Intercambio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.exchangePreferences}
                  onChangeText={(value) => handleInputChange('exchangePreferences', value)}
                  placeholder="¿Qué tipo de productos te interesaría recibir a cambio?"
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name={isEditing ? "checkmark-outline" : "add-outline"} 
                  size={20} 
                  color="#fff" 
                />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  imageSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 8,
  },
  imageActionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 6,
  },
  optionButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionIcon: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#2196F3',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default CreateEditProductScreen; 