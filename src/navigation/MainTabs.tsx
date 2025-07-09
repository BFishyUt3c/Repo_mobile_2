import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../pages/HomeScreen';
import CommunityScreen from '../pages/CommunityScreen';
import ChatScreen from '../pages/ChatScreen';
import ExchangeScreen from '../pages/ExchangeScreen';
import ProfileScreen from '../pages/ProfileScreen';
import WishlistScreen from '../pages/ProfileScreen/WishlistScreen';
import DonationsScreen from '../pages/ProfileScreen/DonationsScreen';
import EditProfileScreen from '../pages/ProfileScreen/EditProfileScreen';
import SettingsScreen from '../pages/ProfileScreen/SettingsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: true }}>
    <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Perfil' }} />
    <ProfileStack.Screen name="WishlistScreen" component={WishlistScreen} options={{ title: 'Mis deseos' }} />
    <ProfileStack.Screen name="DonationsScreen" component={DonationsScreen} options={{ title: 'Mis donaciones' }} />
    <ProfileStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
    <ProfileStack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Configuración' }} />
  </ProfileStack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Comunidades':
              iconName = 'people-outline';
              break;
            case 'Chat':
              iconName = 'chatbubble-ellipses-outline';
              break;
            case 'Intercambios':
              iconName = 'swap-horizontal-outline';
              break;
            case 'Perfil':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Comunidades" component={CommunityScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Intercambios" component={ExchangeScreen} />
      <Tab.Screen name="Perfil" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
