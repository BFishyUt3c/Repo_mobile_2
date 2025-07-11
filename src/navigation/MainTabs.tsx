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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para la pestaña de Productos
const ProductStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProductList" 
      component={ProductListScreen}
      options={{ title: 'Productos' }}
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
  </Stack.Navigator>
);

// Stack para la pestaña de Intercambios
const ExchangeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ExchangeList" 
      component={ExchangeScreen}
      options={{ title: 'Intercambios' }}
    />
    <Stack.Screen 
      name="ExchangeDetail" 
      component={ExchangeDetailScreen}
      options={{ title: 'Detalle del Intercambio' }}
    />
    <Stack.Screen 
      name="CreateExchange" 
      component={CreateExchangeScreen}
      options={{ title: 'Crear Intercambio' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Comunidades
const CommunityStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CommunityList" 
      component={CommunityScreen}
      options={{ title: 'Comunidades' }}
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
      options={{ title: 'Chats' }}
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
          } else if (route.name === 'Exchanges') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
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
        name="Exchanges" 
        component={ExchangeStack}
        options={{ title: 'Intercambios' }}
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
