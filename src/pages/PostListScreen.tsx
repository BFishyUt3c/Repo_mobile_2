import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { PostResponseDto } from '../types/post';
// TODO: Crear el servicio postService.ts y el tipo PostResponseDto si no existen
import { postService } from '../services/postService';
import { useNavigation } from '@react-navigation/native';

const PostListScreen: React.FC = () => {
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar publicaciones');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handlePostPress = (post: PostResponseDto) => {
    // Por ahora navegar a Posts ya que PostDetailScreen no está definido
    navigation.navigate({ name: 'Posts', params: undefined });
  };

  const renderPost = ({ item }: { item: PostResponseDto }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePostPress(item)}>
      <Text style={styles.title}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.content}>{item.content}</Text>
      <Text style={styles.meta}>{item.username} • {new Date(item.publishedAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 32 }} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={loadPosts} style={styles.retryBtn}>
          <Text style={{ color: 'white' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.postId.toString()}
      renderItem={renderPost}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={posts.length === 0 ? styles.centered : undefined}
      ListEmptyComponent={<Text>No hay publicaciones.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default PostListScreen; 