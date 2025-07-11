import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatService, Chat } from '../services/chatService';
import AvatarPlaceholder from '../components/AvatarPlaceholder';

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getMyChats();
      setChats(data);
      setFilteredChats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('ChatDetail', { chatId: chat.id });
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text.trim()) {
      const filtered = chats.filter(chat => {
        const otherUser = chat.user1.id === 1 ? chat.user2 : chat.user1; // Asumiendo que el usuario actual tiene ID 1
        const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
        const productName = chat.product.productName.toLowerCase();
        return fullName.includes(text.toLowerCase()) || productName.includes(text.toLowerCase());
      });
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  };

  const handleDeleteChat = (chat: Chat) => {
    Alert.alert(
      'Eliminar Chat',
      `¿Estás seguro de que quieres eliminar el chat con ${chat.user1.id === 1 ? chat.user2.firstName : chat.user1.firstName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteChat(chat.id);
              await loadChats();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al eliminar el chat');
            }
          }
        }
      ]
    );
  };

  const getOtherUser = (chat: Chat) => {
    // Asumiendo que el usuario actual tiene ID 1
    return chat.user1.id === 1 ? chat.user2 : chat.user1;
  };

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return 'Sin mensajes';
    
    const maxLength = 50;
    const content = chat.lastMessage.content;
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const otherUser = getOtherUser(item);
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`;

    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        onLongPress={() => handleDeleteChat(item)}
      >
        <View style={styles.avatarContainer}>
          <AvatarPlaceholder name={fullName} size={50} />
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={styles.date}>
              {item.lastMessage ? formatDate(item.lastMessage.sentAt) : formatDate(item.createdAt)}
            </Text>
          </View>
          
          <Text style={styles.productName} numberOfLines={1}>
            📦 {item.product.productName}
          </Text>
          
          <Text style={styles.lastMessage} numberOfLines={1}>
            {formatLastMessage(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    loadChats();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChats}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Chats</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar chats..."
          value={searchTerm}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No tienes chats</Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm 
                ? 'No se encontraron chats con esa búsqueda'
                : 'Inicia una conversación desde un producto o intercambio'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  chatList: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ChatListScreen; 