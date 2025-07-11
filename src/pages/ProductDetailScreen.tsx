import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productService } from '../services/productService';
import { exchangeService } from '../services/exchangeService';
import { chatService } from '../services/chatService';
import { ProductResponseDto } from '../types/product';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  productId: number;
}

const ProductDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params as RouteParams;
  
  const [product, setProduct] = useState<ProductResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(productId);
      setProduct(data);
      setIsOwner(data.belongsToCurrentUser || false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el producto');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      const shareMessage = `¡Mira este producto en GreenLoop!\n\n${product.productName}\n${product.description}\n\nPrecio estimado: $${product.estimatedValue}`;
      
      await Share.share({
        message: shareMessage,
        title: product.productName,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContactOwner = async () => {
    if (!product) return;

    try {
      // Iniciar chat con el propietario
      const chat = await chatService.startChat(product.userId, product.productId);
      navigation.navigate({ name: 'ChatDetail', params: { chatId: chat.id } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al iniciar chat');
    }
  };

  const handleExchangePress = () => {
    if (!product) return;
    navigation.navigate({ name: 'CreateExchange', params: { productId: product.productId } });
  };

  const handleEditProduct = () => {
    if (!product) return;
    navigation.navigate({ name: 'CreateEditProduct', params: { productId: product.productId } });
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${product.productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(product.productId);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const handleToggleExchangeStatus = async () => {
    if (!product) return;

    try {
      const updatedProduct = await productService.toggleExchangeAvailability(product.productId);
      setProduct(updatedProduct);
      Alert.alert(
        'Éxito', 
        updatedProduct.availableForExchange 
          ? 'Producto habilitado para intercambio' 
          : 'Producto deshabilitado para intercambio'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al actualizar el estado');
    }
  };

  const getCategoryIcon = (category: string) => {
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return '#4CAF50';
      case 'LIKE_NEW': return '#8BC34A';
      case 'GOOD': return '#FFC107';
      case 'FAIR': return '#FF9800';
      case 'POOR': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'Nuevo';
      case 'LIKE_NEW': return 'Como Nuevo';
      case 'GOOD': return 'Bueno';
      case 'FAIR': return 'Regular';
      case 'POOR': return 'Malo';
      default: return condition;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error || 'Producto no encontrado'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image 
              source={{ uri: product.imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{getCategoryIcon(product.category)}</Text>
            </View>
          )}
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(product.category)}</Text>
            </View>
            
            {product.availableForExchange && (
              <View style={styles.exchangeBadge}>
                <Text style={styles.exchangeText}>🔄 Intercambio</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información del producto */}
        <View style={styles.content}>
          <Text style={styles.title}>{product.productName}</Text>
          
          <View style={styles.ownerContainer}>
            <Text style={styles.ownerLabel}>Propietario:</Text>
            <Text style={styles.ownerName}>{product.ownerName}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condición:</Text>
              <View style={styles.conditionContainer}>
                <View 
                  style={[
                    styles.conditionDot, 
                    { backgroundColor: getConditionColor(product.condition) }
                  ]} 
                />
                <Text style={styles.conditionText}>
                  {getConditionText(product.condition)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valor Estimado:</Text>
              <Text style={styles.valueText}>${product.estimatedValue}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha de Publicación:</Text>
              <Text style={styles.dateText}>{formatDate(product.createdAt)}</Text>
            </View>
          </View>

          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>📝 Descripción</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}

          {product.exchangePreferences && (
            <View style={styles.preferencesContainer}>
              <Text style={styles.preferencesTitle}>🔄 Preferencias de Intercambio</Text>
              <Text style={styles.preferencesText}>{product.exchangePreferences}</Text>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actionsContainer}>
            {!isOwner ? (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleContactOwner}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Contactar Propietario</Text>
                </TouchableOpacity>

                {product.availableForExchange && (
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={handleExchangePress}
                  >
                    <Ionicons name="swap-horizontal-outline" size={20} color="#2196F3" />
                    <Text style={styles.secondaryButtonText}>Proponer Intercambio</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleEditProduct}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Editar Producto</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleToggleExchangeStatus}
                >
                  <Ionicons 
                    name={product.availableForExchange ? "close-circle-outline" : "checkmark-circle-outline"} 
                    size={20} 
                    color="#2196F3" 
                  />
                  <Text style={styles.secondaryButtonText}>
                    {product.availableForExchange ? 'Deshabilitar Intercambio' : 'Habilitar Intercambio'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dangerButton}
                  onPress={handleDeleteProduct}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.dangerButtonText}>Eliminar Producto</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="#666" />
              <Text style={styles.shareButtonText}>Compartir</Text>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
    color: '#ccc',
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  exchangeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exchangeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  detailsContainer: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  conditionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
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
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  preferencesContainer: {
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
  preferencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  preferencesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProductDetailScreen; 