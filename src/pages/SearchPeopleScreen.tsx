import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { communityService } from '../services/communityService';
import { chatService } from '../services/chatService';
import { productService } from '../services/productService';
import { CommunityResponseDto, UserDto } from '../types/community';
import { User } from '../types/User';
import AvatarPlaceholder from '../components/AvatarPlaceholder';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  addedAt: string;
}

const SearchPeopleScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<CommunityResponseDto[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allUsers, setAllUsers] = useState<UserDto[]>([]); // Nuevo: lista global mock

  useEffect(() => {
    loadContacts();
    loadCommunities();
    loadAllUsersMock(); // Nuevo: cargar usuarios globales mock
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('userContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.getAllCommunities();
      setCommunities(data);
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'No se pudieron cargar las comunidades');
    } finally {
      setLoading(false);
    }
  };

  const searchCommunities = async () => {
    if (!searchTerm.trim()) {
      loadCommunities();
      return;
    }

    try {
      setSearching(true);
      const data = await communityService.searchCommunities({ name: searchTerm });
      setCommunities(data);
    } catch (error) {
      console.error('Error searching communities:', error);
      Alert.alert('Error', 'Error al buscar comunidades');
    } finally {
      setSearching(false);
    }
  };

  const addToContacts = async (user: UserDto) => {
    try {
      const newContact: Contact = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        addedAt: new Date().toISOString(),
      };

      const updatedContacts = [...contacts, newContact];
      await AsyncStorage.setItem('userContacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      
      Alert.alert(
        'Contacto agregado',
        `${user.firstName} ${user.lastName} ha sido agregado a tus contactos`
      );
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'No se pudo agregar el contacto');
    }
  };

  const isContactAdded = (userId: number) => {
    return contacts.some(contact => contact.id === userId);
  };

  const startChat = async (user: UserDto) => {
    try {
      // Primero, obtener los productos del usuario actual para seleccionar uno
      const userProducts = await productService.getUserProducts();
      
      if (userProducts.length === 0) {
        Alert.alert(
          'Sin Productos',
          'Necesitas tener al menos un producto para iniciar un chat. Ve a Productos y crea uno.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Crear Producto',
              onPress: () => navigation.navigate('CreateEditProduct' as never),
            },
          ]
        );
        return;
      }

      // Si solo hay un producto, usarlo directamente
      if (userProducts.length === 1) {
        const product = userProducts[0];
        await initiateChat(user, product.productId, product.productName);
        return;
      }

      // Si hay múltiples productos, mostrar selector
      const productOptions = userProducts.map(product => ({
        text: product.productName,
        onPress: () => initiateChat(user, product.productId, product.productName)
      }));

      Alert.alert(
        'Seleccionar Producto',
        `¿Con qué producto quieres chatear con ${user.firstName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          ...productOptions
        ]
      );

    } catch (error: any) {
      console.error('Error in startChat:', error);
      Alert.alert('Error', 'No se pudo cargar los productos. Intenta más tarde.');
    }
  };

  const initiateChat = async (user: UserDto, productId: number, productName: string) => {
    try {
      Alert.alert(
        'Iniciar Chat',
        `¿Quieres iniciar una conversación con ${user.firstName} ${user.lastName} sobre "${productName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Chatear',
            onPress: async () => {
              try {
                // Iniciar el chat usando el servicio
                const chat = await chatService.startChat(user.id, productId);
                
                // Navegar al chat
                (navigation as any).navigate('ChatDetail', {
                  chatId: chat.id
                });
                
              } catch (error: any) {
                console.error('Error starting chat:', error);
                Alert.alert(
                  'Error',
                  error.message || 'No se pudo iniciar el chat. Intenta más tarde.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in initiateChat:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    }
  };

  // Nuevo: función mock para obtener todos los usuarios únicos de comunidades y contactos
  const loadAllUsersMock = async () => {
    try {
      setLoading(true);
      const comms = await communityService.getAllCommunities();
      let users: UserDto[] = [];
      comms.forEach(com => {
        if (com.members) {
          users = users.concat(com.members);
        }
      });
      // Agregar contactos guardados
      const savedContacts = await AsyncStorage.getItem('userContacts');
      if (savedContacts) {
        const contactUsers: UserDto[] = JSON.parse(savedContacts);
        users = users.concat(contactUsers);
      }
      // Eliminar duplicados por id
      const uniqueUsers = users.filter((u, i, arr) => arr.findIndex(x => x.id === u.id) === i);
      setAllUsers(uniqueUsers);
    } catch (error) {
      console.error('Error loading all users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nuevo: búsqueda global local sobre allUsers
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = allUsers.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
    setSearchResults(filtered);
  }, [searchTerm, allUsers]);

  const renderCommunity = ({ item }: { item: CommunityResponseDto }) => (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() => setSelectedCommunity(item)}
    >
      <View style={styles.communityHeader}>
        <View style={styles.communityInfo}>
          <Text style={styles.communityName}>{item.name}</Text>
          <Text style={styles.communityDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.memberCount}>
            {item.memberCount} miembros
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderMember = ({ item }: { item: UserDto }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberLevel}>Nivel: {item.level}</Text>
        </View>
      </View>
      <View style={styles.memberActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => startChat(item)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addButton,
            isContactAdded(item.id) && styles.addedButton
          ]}
          onPress={() => addToContacts(item)}
          disabled={isContactAdded(item.id)}
        >
          <Ionicons
            name={isContactAdded(item.id) ? "checkmark" : "person-add"}
            size={16}
            color={isContactAdded(item.id) ? "#fff" : "#2196F3"}
          />
          <Text style={[
            styles.addButtonText,
            isContactAdded(item.id) && styles.addedButtonText
          ]}>
            {isContactAdded(item.id) ? 'Agregado' : 'Agregar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResults = () => {
    if (selectedCommunity) {
      return (
        <View style={styles.membersContainer}>
          <View style={styles.communityHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCommunity(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
            <Text style={styles.communityTitle}>{selectedCommunity.name}</Text>
          </View>
          <Text style={styles.membersTitle}>Miembros ({selectedCommunity.members.length})</Text>
          <FlatList
            data={selectedCommunity.members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.membersList}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.communitiesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No se encontraron comunidades</Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay comunidades disponibles'}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Buscar personas</Text>
        <TouchableOpacity
          style={styles.contactsButton}
          onPress={() => navigation.navigate('Contacts' as never)}
        >
          <Ionicons name="people" size={24} color="#2196F3" />
          <Text style={styles.contactsButtonText}>Contactos ({contacts.length})</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searching && <ActivityIndicator size="small" color="#2196F3" style={{ marginLeft: 8 }} />}
      </View>
      {searchTerm.trim() ? (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userCard} onPress={() => startChat(item)}>
              <View style={styles.avatarContainer}>
                <AvatarPlaceholder name={`${item.firstName} ${item.lastName}`} size={40} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToContacts(item)}
                disabled={isContactAdded(item.id)}
              >
                <Ionicons name={isContactAdded(item.id) ? 'checkmark-circle' : 'person-add'} size={24} color={isContactAdded(item.id) ? 'green' : '#2196F3'} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron personas.</Text>
            </View>
          )}
        />
      ) : (
        // Si no hay búsqueda, mostrar comunidades y contactos como antes
        renderSearchResults()
      )}
      <TouchableOpacity
        style={{ backgroundColor: '#2196F3', padding: 12, borderRadius: 8, margin: 16 }}
        onPress={async () => {
          try {
            const chat = await chatService.startChat(2, 5); // IDs de prueba
            Alert.alert('Chat de prueba creado', `ID del chat: ${chat.id}`);
          } catch (error: any) {
            Alert.alert('Error al crear chat de prueba', error?.message || 'Error desconocido');
          }
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Crear chat de prueba</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  contactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  contactsButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2196F3',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  communitiesList: {
    paddingVertical: 8,
  },
  communityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  membersContainer: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2196F3',
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  membersList: {
    paddingVertical: 8,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberLevel: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginRight: 8,
  },
  chatButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 20,
  },
  addedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  addedButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default SearchPeopleScreen; 