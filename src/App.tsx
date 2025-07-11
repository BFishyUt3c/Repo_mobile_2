import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './navigation/MainTabs';
import AuthStack from './navigation/AuthStack';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './hooks/useAuth';

const Root = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? (
        <UserProvider>
          <MainTabs />
        </UserProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Root />
      </WebSocketProvider>
    </AuthProvider>
  );
} 