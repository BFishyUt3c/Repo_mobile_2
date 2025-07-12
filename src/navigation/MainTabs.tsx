import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Importar pantallas
import HomeScreen from '../pages/HomeScreen';
import ProductListScreen from '../pages/ProductListScreen';
import ProductDetailScreen from '../pages/ProductDetailScreen';
import CreateEditProductScreen from '../pages/CreateEditProductScreen';
import ExchangeScreen from '../pages/ExchangeScreen';
import ExchangeDetailScreen from '../pages/ExchangeDetailScreen';
import CreateExchangeScreen from '../pages/CreateExchangeScreen';
import CommunityScreen from '../pages/CommunityScreen';
import CommunityDetailScreen from '../pages/CommunityDetailScreen';
import CreateEditCommunityScreen from '../pages/CreateEditCommunityScreen';
import ChatListScreen from '../pages/ChatListScreen';
import ChatScreen from '../pages/ChatScreen';
import NotificationsScreen from '../pages/NotificationsScreen';
import ProfileStack from './ProfileStack';
import SearchPeopleScreen from '../pages/SearchPeopleScreen';
import ContactsScreen from '../pages/ContactsScreen';
import PostsScreen from '../pages/PostsScreen';
import CreatePostScreen from '../pages/CreatePostScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para la pestaña de Productos
const ProductStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProductList" 
      component={ProductListScreen}
      options={{ title: 'Productos', headerShown: false }} // Ocultar header
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: 'Detalle del Producto' }}
    />
    <Stack.Screen 
      name="CreateEditProduct" 
      component={CreateEditProductScreen}
      options={{ title: 'Crear/Editar Producto' }}
    />
    <Stack.Screen 
      name="CreateExchange" 
      component={CreateExchangeScreen}
      options={{ title: 'Crear Intercambio' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Posts
const PostsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PostsList" 
      component={PostsScreen}
      options={{ title: 'Posts', headerShown: false }} // Ocultar header
    />
    <Stack.Screen 
      name="CreatePost" 
      component={CreatePostScreen}
      options={{ title: 'Crear Post' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Comunidades
const CommunityStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CommunityList" 
      component={CommunityScreen}
      options={{ title: 'Comunidades', headerShown: false }} // Ocultar header
    />
    <Stack.Screen 
      name="CommunityDetail" 
      component={CommunityDetailScreen}
      options={{ title: 'Detalle de la Comunidad' }}
    />
    <Stack.Screen 
      name="CreateEditCommunity" 
      component={CreateEditCommunityScreen}
      options={{ title: 'Crear/Editar Comunidad' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Chat
const ChatStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ChatList" 
      component={ChatListScreen}
      options={{ title: 'Chats', headerShown: false }} // Ocultar header
    />
    <Stack.Screen 
      name="ChatDetail" 
      component={ChatScreen}
      options={{ title: 'Chat' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Posts') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={26} color={color} style={{ marginBottom: -2 }} />;
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#B0BEC5',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 62,
          marginBottom: 12, // Separación visual del borde inferior
          paddingBottom: 10, // Espacio interno, no agranda la barra
          paddingTop: 4,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductStack}
        options={{ title: 'Productos' }}
      />
      <Tab.Screen 
        name="Posts" 
        component={PostsStack}
        options={{ title: 'Posts' }}
      />
      <Tab.Screen 
        name="Communities" 
        component={CommunityStack}
        options={{ title: 'Comunidades' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
