import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fonts, spacing, borderRadius } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

// Tipos temporales para posts
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  type: 'DONATION' | 'EXCHANGE';
  location: string;
}

const PostsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'others'>('my');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [otherPosts, setOtherPosts] = useState<Post[]>([]);

  // Datos de ejemplo
  const mockMyPosts: Post[] = [
    {
      id: 1,
      title: 'Busco libros de programación',
      content: 'Estoy buscando libros sobre React Native y JavaScript. Puedo intercambiar por otros libros técnicos.',
      author: user?.firstName || 'Usuario',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 5,
      isLiked: false,
      type: 'EXCHANGE',
      location: 'Madrid'
    },
    {
      id: 2,
      title: 'Donando ropa en buen estado',
      content: 'Tengo varias prendas que ya no uso pero están en excelente estado. Tallas M y L.',
      author: user?.firstName || 'Usuario',
      createdAt: '2024-01-14T15:20:00Z',
      likes: 12,
      isLiked: true,
      type: 'DONATION',
      location: 'Barcelona'
    }
  ];

  const mockOtherPosts: Post[] = [
    {
      id: 3,
      title: 'Intercambio bicicleta por patineta',
      content: 'Tengo una bicicleta de montaña en buen estado. Busco una patineta profesional.',
      author: 'María García',
      createdAt: '2024-01-16T09:15:00Z',
      likes: 8,
      isLiked: false,
      type: 'EXCHANGE',
      location: 'Valencia'
    },
    {
      id: 4,
      title: 'Donando muebles de oficina',
      content: 'Escritorio y silla de oficina en perfecto estado. Ideal para trabajo remoto.',
      author: 'Carlos López',
      createdAt: '2024-01-15T14:45:00Z',
      likes: 15,
      isLiked: false,
      type: 'DONATION',
      location: 'Sevilla'
    },
    {
      id: 5,
      title: 'Busco instrumentos musicales',
      content: 'Interesado en intercambiar por una guitarra acústica. Tengo varios instrumentos disponibles.',
      author: 'Ana Martínez',
      createdAt: '2024-01-14T11:30:00Z',
      likes: 6,
      isLiked: true,
      type: 'EXCHANGE',
      location: 'Bilbao'
    }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMyPosts(mockMyPosts);
      setOtherPosts(mockOtherPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'No se pudieron cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    Alert.alert(
      'Crear Post',
      '¿Qué tipo de post quieres crear?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Donación', onPress: () => navigation.navigate('CreatePost' as never, { type: 'DONATION' } as never) },
        { text: 'Intercambio', onPress: () => navigation.navigate('CreatePost' as never, { type: 'EXCHANGE' } as never) }
      ]
    );
  };

  const handleLikePost = (postId: number) => {
    // Simular like/unlike
    if (activeTab === 'my') {
      setMyPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    } else {
      setOtherPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.author.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, item.type === 'DONATION' ? styles.donationBadge : styles.exchangeBadge]}>
          <Text style={styles.typeText}>
            {item.type === 'DONATION' ? 'Donación' : 'Intercambio'}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postFooter}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={colors.gray} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={() => handleLikePost(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? colors.error : colors.gray} 
          />
          <Text style={[styles.likeCount, item.isLiked && styles.likedCount]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentPosts = activeTab === 'my' ? myPosts : otherPosts;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Posts</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            Mis Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'others' && styles.activeTab]}
          onPress={() => setActiveTab('others')}
        >
          <Text style={[styles.tabText, activeTab === 'others' && styles.activeTabText]}>
            Posts de Otros
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'my' ? 'No tienes posts aún' : 'No hay posts disponibles'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'my' 
                ? 'Crea tu primer post para compartir con la comunidad'
                : 'Sé el primero en crear un post'
              }
            </Text>
            {activeTab === 'my' && (
              <TouchableOpacity style={styles.createFirstButton} onPress={handleCreatePost}>
                <Text style={styles.createFirstButtonText}>Crear mi primer post</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: fontSizes.body,
    color: colors.gray,
    fontFamily: fonts.medium,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  postsList: {
    padding: spacing.lg,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  postDate: {
    fontSize: fontSizes.small,
    color: colors.gray,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  donationBadge: {
    backgroundColor: colors.success + '20',
  },
  exchangeBadge: {
    backgroundColor: colors.accent + '20',
  },
  typeText: {
    fontSize: fontSizes.small,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: fontSizes.subtitle,
    color: colors.black,
    fontFamily: fonts.bold,
    marginBottom: spacing.sm,
  },
  postContent: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  likedCount: {
    color: colors.error,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSizes.subtitle,
    color: colors.black,
    fontFamily: fonts.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.body,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  createFirstButtonText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
});

export default PostsScreen; 