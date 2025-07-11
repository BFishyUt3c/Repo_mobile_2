import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './src/navigation/MainTabs';
import AuthStack from './src/navigation/AuthStack';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './src/hooks/useAuth';

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
