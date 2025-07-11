import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../pages/ProfileScreen';
import EditProfileScreen from '../pages/ProfileScreen/EditProfileScreen';
import DonationsScreen from '../pages/ProfileScreen/DonationsScreen';
import WishlistScreen from '../pages/ProfileScreen/WishlistScreen';
import SettingsScreen from '../pages/ProfileScreen/SettingsScreen';
import WishlistDetailScreen from '../pages/WishlistDetailScreen';
import CreateEditWishlistScreen from '../pages/CreateEditWishlistScreen';
import StatisticsScreen from '../pages/StatisticsScreen';
import SearchPeopleScreen from '../pages/SearchPeopleScreen';
import ContactsScreen from '../pages/ContactsScreen';
import ExchangeScreen from '../pages/ExchangeScreen';
import ExchangeDetailScreen from '../pages/ExchangeDetailScreen';
import CreateExchangeScreen from '../pages/CreateExchangeScreen';

const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Donations" component={DonationsScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="WishlistDetail" component={WishlistDetailScreen} />
    <Stack.Screen name="CreateEditWishlist" component={CreateEditWishlistScreen} />
    <Stack.Screen name="Exchanges" component={ExchangeScreen} />
    <Stack.Screen name="ExchangeDetail" component={ExchangeDetailScreen} />
    <Stack.Screen name="CreateExchange" component={CreateExchangeScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Statistics" component={StatisticsScreen} />
    <Stack.Screen name="SearchPeople" component={SearchPeopleScreen} />
    <Stack.Screen name="Contacts" component={ContactsScreen} />
  </Stack.Navigator>
);

export default ProfileStack; 