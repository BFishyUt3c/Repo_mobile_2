import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { WishListSummaryDto } from '../types/WishListSummaryDto';
import { ProductResponseDto } from '../types/product';
// TODO: Crear el servicio wishListService si no existe
import { wishListService } from '../services/wishListService';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

interface RouteParams {
  wishlistId: number;
}

const WishlistDetailScreen: React.FC = () => {
  const route = useRoute();
  const { wishlistId } = route.params as RouteParams;
  const [wishlist, setWishlist] = useState<WishListSummaryDto | null>(null);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistProductIds, setWishlistProductIds] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const wl = await wishListService.getWishList(wishlistId);
        setWishlist(wl);
        setProducts(wl.products || []);
        setWishlistProductIds((wl.products || []).map((p: any) => p.productId));
      } catch (e: any) {
        setError(e.message || 'Error al cargar la wishlist');
      }
      setLoading(false);
    };
    load();
  }, [wishlistId]);

  const handleToggleWishlist = async (productId: number) => {
    try {
      let updated;
      if (wishlistProductIds.includes(productId)) {
        await wishListService.removeFromWishList(wishlistId, productId);
        updated = wishlistProductIds.filter(id => id !== productId);
        Alert.alert('Wishlist', 'Producto eliminado de la lista');
      } else {
        await wishListService.addToWishList(wishlistId, productId);
        updated = [...wishlistProductIds, productId];
        Alert.alert('Wishlist', 'Producto agregado a la lista');
      }
      setWishlistProductIds(updated);
      setProducts(products.map(p => p.productId === productId ? { ...p, inWishList: !p.inWishList } : p));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la wishlist');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 32 }} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (!wishlist) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró la wishlist.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{wishlist.name}</Text>
      <Text style={styles.meta}>{wishlist.productCount} productos • {wishlist.isPublic ? 'Pública' : 'Privada'}</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productMeta}>{item.category} • {item.condition}</Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: 16, top: 16 }}
              onPress={() => handleToggleWishlist(item.productId)}
            >
              <Ionicons
                name={wishlistProductIds.includes(item.productId) ? 'heart' : 'heart-outline'}
                size={28}
                color={wishlistProductIds.includes(item.productId) ? 'red' : '#888'}
              />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No hay productos en esta wishlist.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
  },
  meta: {
    color: '#888',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  productMeta: {
    color: '#666',
    fontSize: 13,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});

export default WishlistDetailScreen; 