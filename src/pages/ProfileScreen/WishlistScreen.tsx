import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, fontSizes } from '../../styles/theme';
import { wishListService } from '../../services/wishListService';
import { WishListSummaryDto } from '../../types/WishListSummaryDto';

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const [wishlists, setWishlists] = useState<WishListSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const data = await wishListService.getUserWishLists();
      setWishlists(data);
    } catch (error) {
      console.error('Error loading wishlists:', error);
      Alert.alert('Error', 'No se pudieron cargar las listas de deseos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlists();
    setRefreshing(false);
  };

  const handleCreateWishlist = () => {
    navigation.navigate({ name: 'CreateEditWishlist', params: {} });
  };

  const handleWishlistPress = (wishlist: WishListSummaryDto) => {
    navigation.navigate('WishlistDetail', { wishlistId: wishlist.id });
  };

  const handleEditWishlist = (wishlist: WishListSummaryDto) => {
    navigation.navigate('CreateEditWishlist', { wishlist });
  };

  const handleDeleteWishlist = async (wishlist: WishListSummaryDto) => {
    Alert.alert(
      'Eliminar Lista',
      `¿Estás seguro de que quieres eliminar "${wishlist.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishListService.deleteWishList(wishlist.id);
              await loadWishlists();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la lista de deseos');
            }
          },
        },
      ]
    );
  };

  const renderWishlist = ({ item }: { item: WishListSummaryDto }) => (
    <TouchableOpacity
      style={styles.wishlistCard}
      onPress={() => handleWishlistPress(item)}
    >
      <View style={styles.wishlistHeader}>
        <View style={styles.wishlistInfo}>
          <Text style={styles.wishlistName}>{item.name}</Text>
          <View style={styles.wishlistMeta}>
            <Ionicons 
              name={item.isPublic ? "globe-outline" : "lock-closed-outline"} 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={styles.wishlistMetaText}>
              {item.isPublic ? 'Pública' : 'Privada'}
            </Text>
            <Text style={styles.wishlistMetaText}>
              • {item.productCount} productos
            </Text>
          </View>
        </View>
        <View style={styles.wishlistActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditWishlist(item)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteWishlist(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No tienes listas de deseos</Text>
      <Text style={styles.emptyStateSubtitle}>
        Crea tu primera lista para guardar productos que te interesen
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateWishlist}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.createButtonText}>Crear Lista de Deseos</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Deseos</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateWishlist}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando listas de deseos...</Text>
        </View>
      ) : (
        <FlatList
          data={wishlists}
          renderItem={renderWishlist}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primaryText,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  wishlistCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    color: colors.primaryText,
    marginBottom: 4,
  },
  wishlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wishlistMetaText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: fontSizes.subtitle,
    fontFamily: fonts.bold,
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.medium,
    color: colors.white,
  },
});

export default WishlistScreen;
