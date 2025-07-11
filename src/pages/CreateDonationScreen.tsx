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
import { donationService } from '../services/donationService';
import { productService } from '../services/productService';
import { ProductResponseDto } from '../types/product';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface RouteParams {
  product?: ProductResponseDto; // Producto existente para donar
}

const CreateDonationScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProducts, setUserProducts] = useState<ProductResponseDto[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    productId: 0,
    title: '',
    description: '',
    imageUrl: '',
    donationLocation: '',
    donorNote: '',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);

  const isFromExistingProduct = !!product;

  useEffect(() => {
    loadUserProducts();
    
    if (product) {
      // Si viene de un producto existente, pre-llenar datos
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        productId: product.productId,
        title: product.productName,
        description: product.description,
        imageUrl: product.imageUrl,
      }));
      setImageUri(product.imageUrl);
    }
  }, [product]);

  const loadUserProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getUserProducts();
      setUserProducts(products);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productId: product.productId,
      title: product.productName,
      description: product.description,
      imageUrl: product.imageUrl,
    }));
    setImageUri(product.imageUrl);
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
    if (!formData.productId) {
      Alert.alert('Error', 'Debes seleccionar un producto');
      return false;
    }
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título de la donación es obligatorio');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    if (!formData.donationLocation.trim()) {
      Alert.alert('Error', 'La ubicación de la donación es obligatoria');
      return false;
    }
    return true;
  };

  const handleCreateDonation = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const donationData = {
        productId: formData.productId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        donationLocation: formData.donationLocation.trim(),
        donorNote: formData.donorNote.trim(),
      };

      await donationService.createDonation(donationData);
      Alert.alert('Éxito', 'Donación creada correctamente');
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Error al crear la donación');
      Alert.alert('Error', err.message || 'Error al crear la donación');
    } finally {
      setSaving(false);
    }
  };

  const renderProductOption = (product: ProductResponseDto) => (
    <TouchableOpacity
      key={product.productId}
      style={[
        styles.productOption,
        selectedProduct?.productId === product.productId && styles.productOptionSelected
      ]}
      onPress={() => handleProductSelect(product)}
    >
      <Image 
        source={{ uri: product.imageUrl }} 
        style={styles.productOptionImage}
        resizeMode="cover"
      />
      <View style={styles.productOptionInfo}>
        <Text style={styles.productOptionName}>{product.productName}</Text>
        <Text style={styles.productOptionCategory}>{product.category}</Text>
        <Text style={styles.productOptionValue}>${product.estimatedValue}</Text>
      </View>
      {selectedProduct?.productId === product.productId && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🎁 Crear Donación</Text>

          {/* Selección de producto */}
          {!isFromExistingProduct && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 Seleccionar Producto</Text>
              {userProducts.length > 0 ? (
                <View style={styles.productsContainer}>
                  {userProducts.map(renderProductOption)}
                </View>
              ) : (
                <View style={styles.emptyProducts}>
                  <Ionicons name="cube-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyProductsText}>
                    No tienes productos disponibles para donar
                  </Text>
                  <TouchableOpacity 
                    style={styles.createProductButton}
                    onPress={() => navigation.navigate('CreateEditProduct' as never)}
                  >
                    <Text style={styles.createProductButtonText}>Crear Producto</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Producto seleccionado */}
          {selectedProduct && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Producto Seleccionado</Text>
              <View style={styles.selectedProductCard}>
                <Image 
                  source={{ uri: selectedProduct.imageUrl }} 
                  style={styles.selectedProductImage}
                  resizeMode="cover"
                />
                <View style={styles.selectedProductInfo}>
                  <Text style={styles.selectedProductName}>{selectedProduct.productName}</Text>
                  <Text style={styles.selectedProductCategory}>{selectedProduct.category}</Text>
                  <Text style={styles.selectedProductValue}>${selectedProduct.estimatedValue}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Información de la donación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Información de la Donación</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título de la Donación *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="Ej: Donando iPhone 12 en buen estado"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe por qué quieres donar este producto..."
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación de la Donación *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.donationLocation}
                onChangeText={(value) => handleInputChange('donationLocation', value)}
                placeholder="Ej: Centro de la ciudad, Plaza Mayor"
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nota para el Receptor (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.donorNote}
                onChangeText={(value) => handleInputChange('donorNote', value)}
                placeholder="Mensaje especial para quien reciba la donación..."
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Imagen adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Imagen Adicional (Opcional)</Text>
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={pickImage}
            >
              {imageUri && !selectedProduct ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>
                    {selectedProduct ? 'Imagen del producto seleccionado' : 'Toca para agregar imagen'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {!selectedProduct && (
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
            )}
          </View>

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>💡 Información Importante</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Tu donación será visible para todos los usuarios</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Ganarás puntos por cada donación completada</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Puedes cancelar la donación en cualquier momento</Text>
            </View>
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
              style={[styles.createButton, saving && styles.createButtonDisabled]}
              onPress={handleCreateDonation}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="gift-outline" size={20} color="#fff" />
              )}
              <Text style={styles.createButtonText}>
                {saving ? 'Creando...' : 'Crear Donación'}
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
  productsContainer: {
    gap: 12,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  productOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  productOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productOptionInfo: {
    flex: 1,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productOptionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productOptionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  createProductButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F1F8E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedProductCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectedProductValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
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
    textAlign: 'center',
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
  infoSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
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
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default CreateDonationScreen; 