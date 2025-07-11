import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chatService, Message, ChatInfo } from '../services/chatService';
import { useWebSocket } from '../hooks/useWebSocket';
import AvatarPlaceholder from '../components/AvatarPlaceholder';

interface RouteParams {
  chatId: number;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { chatId } = route.params as RouteParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const { client, isConnected, sendMessage } = useWebSocket();

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar información del chat y mensajes en paralelo
      const [chatInfoData, messagesData] = await Promise.all([
        chatService.getChatInfo(chatId),
        chatService.getChatMessages(chatId)
      ]);
      
      setChatInfo(chatInfoData);
      setMessages(messagesData);
      
      // Marcar mensajes como leídos
      await chatService.markAsRead(chatId);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar el chat');
      console.error('Error loading chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Enviar mensaje a través de la API
      const sentMessage = await chatService.sendMessage(chatId, messageContent);
      
      // Agregar mensaje a la lista local
      setMessages(prev => [...prev, sentMessage]);
      
      // Enviar mensaje a través de WebSocket si está conectado
      if (isConnected && client) {
        sendMessage(`/app/chat/${chatId}/message`, {
          content: messageContent,
          chatId: chatId
        });
      }
      
      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al enviar el mensaje');
      setNewMessage(messageContent); // Restaurar el mensaje
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (message: Message) => {
    // Asumiendo que el usuario actual tiene ID 1
    return message.sender.id === 1;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const own = isOwnMessage(item);
    
    return (
      <View style={[styles.messageContainer, own ? styles.ownMessage : styles.otherMessage]}>
        {!own && (
          <View style={styles.avatarContainer}>
            <AvatarPlaceholder 
              name={`${item.sender.firstName} ${item.sender.lastName}`} 
              size={32} 
            />
          </View>
        )}
        
        <View style={[styles.messageBubble, own ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, own ? styles.ownMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, own ? styles.ownMessageTime : styles.otherMessageTime]}>
            {formatMessageTime(item.sentAt)}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadChatData();
    
    // Configurar WebSocket para recibir mensajes
    if (client && isConnected) {
      const subscription = client.subscribe(`/user/queue/chat/${chatId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
          
          // Scroll al final para nuevos mensajes
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [chatId, client, isConnected]);

  useEffect(() => {
    // Configurar título de la navegación
    if (chatInfo) {
      navigation.setOptions({
        title: `${chatInfo.otherUser.firstName} ${chatInfo.otherUser.lastName}`,
        headerRight: () => (
          <View style={styles.headerRight}>
            <Text style={styles.productInfo}>
              📦 {chatInfo.product.productName}
            </Text>
          </View>
        ),
      });
    }
  }, [chatInfo, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChatData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Inicia la conversación</Text>
              <Text style={styles.emptySubtitle}>
                Envía un mensaje para comenzar a chatear sobre {chatInfo?.product.productName}
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>📤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerRight: {
    marginRight: 16,
  },
  productInfo: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
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

export default ChatScreen;
