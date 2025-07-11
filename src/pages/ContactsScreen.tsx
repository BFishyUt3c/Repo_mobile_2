import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../services/chatService';
import { productService } from '../services/productService';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  addedAt: string;
}

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadContacts();
    }, [])
  );

  const loadContacts = async () => {
    try {
      setLoading(true);
      const savedContacts = await AsyncStorage.getItem('userContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'No se pudieron cargar los contactos');
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (contactId: number) => {
    Alert.alert(
      'Eliminar Contacto',
      '¿Estás seguro de que quieres eliminar este contacto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedContacts = contacts.filter(contact => contact.id !== contactId);
              await AsyncStorage.setItem('userContacts', JSON.stringify(updatedContacts));
              setContacts(updatedContacts);
              Alert.alert('Éxito', 'Contacto eliminado');
            } catch (error) {
              console.error('Error removing contact:', error);
              Alert.alert('Error', 'No se pudo eliminar el contacto');
            }
          },
        },
      ]
    );
  };

  const startChat = async (contact: Contact) => {
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
        await initiateChat(contact, product.productId, product.productName);
        return;
      }

      // Si hay múltiples productos, mostrar selector
      const productOptions = userProducts.map(product => ({
        text: product.productName,
        onPress: () => initiateChat(contact, product.productId, product.productName)
      }));

      Alert.alert(
        'Seleccionar Producto',
        `¿Con qué producto quieres chatear con ${contact.firstName}?`,
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

  const initiateChat = async (contact: Contact, productId: number, productName: string) => {
    try {
      Alert.alert(
        'Iniciar Chat',
        `¿Quieres iniciar una conversación con ${contact.firstName} ${contact.lastName} sobre "${productName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Chatear',
            onPress: async () => {
              try {
                // Iniciar el chat usando el servicio
                const chat = await chatService.startChat(contact.id, productId);
                
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.contactEmail}>{item.email}</Text>
          <Text style={styles.contactDate}>
            Agregado el {formatDate(item.addedAt)}
          </Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => startChat(item)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeContact(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Cargando contactos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Contactos</Text>
        <View style={styles.placeholder} />
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No tienes contactos</Text>
          <Text style={styles.emptySubtitle}>
            Agrega personas desde la búsqueda de comunidades para poder chatear con ellas
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('SearchPeople' as never)}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>Buscar Personas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.contactsList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
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
  contactsList: {
    paddingVertical: 8,
  },
  contactCard: {
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
  contactInfo: {
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
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactDate: {
    fontSize: 12,
    color: '#999',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 20,
    marginRight: 8,
  },
  chatButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ContactsScreen; 