import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../pages/ProfileScreen';
import EditProfileScreen from '../pages/ProfileScreen/EditProfileScreen';
import DonationsScreen from '../pages/ProfileScreen/DonationsScreen';
import WishlistScreen from '../pages/ProfileScreen/WishlistScreen';
import SettingsScreen from '../pages/ProfileScreen/SettingsScreen';
import WishlistDetailScreen from '../pages/WishlistDetailScreen';
import CreateEditWishlistScreen from '../pages/CreateEditWishlistScreen';
import PostListScreen from '../pages/PostListScreen';
import CreatePostScreen from '../pages/CreatePostScreen';
import StatisticsScreen from '../pages/StatisticsScreen';

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
    <Stack.Screen name="Posts" component={PostListScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Statistics" component={StatisticsScreen} />
  </Stack.Navigator>
);

export default ProfileStack; 