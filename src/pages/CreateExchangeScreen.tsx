import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { exchangeService } from '../services/exchangeService';
import { productService } from '../services/productService';
import { ProductResponseDto, Category } from '../types/product';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  productId: number;
}

const categoryOptions = [
  { key: '', label: 'Todas las categorías' },
  { key: 'ELECTRONICS', label: 'Electrónicos' },
  { key: 'CLOTHING', label: 'Ropa' },
  { key: 'BOOKS', label: 'Libros' },
  { key: 'SPORTS', label: 'Deportes' },
  { key: 'HOME', label: 'Hogar' },
  { key: 'TOYS', label: 'Juguetes' },
  { key: 'OTHER', label: 'Otros' },
];

const CreateExchangeScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params as RouteParams;

  const [targetProduct, setTargetProduct] = useState<ProductResponseDto | null>(null);
  const [myProducts, setMyProducts] = useState<ProductResponseDto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponseDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [product, mine] = await Promise.all([
        productService.getProductById(productId),
        exchangeService.getMyProductsForExchange(),
      ]);
      setTargetProduct(product);
      setMyProducts(mine);
      setFilteredProducts(mine);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    filterProducts(text, categoryFilter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    filterProducts(searchTerm, category);
  };

  const filterProducts = (search: string, category: string) => {
    let filtered = myProducts;
    if (search.trim()) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    setFilteredProducts(filtered);
  };

  const handleSubmit = async () => {
    if (!targetProduct || !selectedProduct) {
      Alert.alert('Error', 'Debes seleccionar un producto para ofrecer a cambio.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await exchangeService.requestExchange({
        requestedProductId: targetProduct.productId,
        offeredProductId: selectedProduct.productId,
      });
      Alert.alert('Éxito', 'Solicitud de intercambio enviada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.message || 'Error al crear el intercambio');
      Alert.alert('Error', err.message || 'Error al crear el intercambio');
    } finally {
      setSaving(false);
    }
  };

  const renderProduct = ({ item }: { item: ProductResponseDto }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProduct?.productId === item.productId && styles.productCardSelected,
      ]}
      onPress={() => setSelectedProduct(item)}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="cube-outline" size={32} color="#b0b0b0" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16 }}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: '#f44336', marginBottom: 16 }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Producto que deseas</Text>
        {targetProduct ? (
          <View style={styles.targetProductCard}>
            {targetProduct.imageUrl ? (
              <Image source={{ uri: targetProduct.imageUrl }} style={styles.targetProductImage} />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="cube-outline" size={32} color="#b0b0b0" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{targetProduct.productName}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>{targetProduct.description}</Text>
              <Text style={styles.productCategory}>{targetProduct.category}</Text>
            </View>
          </View>
        ) : (
          <Text>No se encontró el producto.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecciona tu producto para ofrecer</Text>
        <View style={styles.filtersRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en tus productos..."
            value={searchTerm}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          <View style={styles.categoryPickerWrapper}>
            <Text style={styles.categoryPickerLabel}>Categoría:</Text>
            <FlatList
              data={categoryOptions}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    categoryFilter === item.key && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategoryFilter(item.key)}
                >
                  <Text style={categoryFilter === item.key ? styles.categoryButtonTextActive : styles.categoryButtonText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.productId.toString()}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No tienes productos disponibles para intercambio.</Text>}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, (!selectedProduct || saving) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedProduct || saving}
      >
        <Text style={styles.submitButtonText}>{saving ? 'Enviando...' : 'Solicitar Intercambio'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  targetProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 10,
  },
  targetProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  productsList: {
    paddingVertical: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  categoryPickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPickerLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 13,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default CreateExchangeScreen; 