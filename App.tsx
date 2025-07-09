import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './src/navigation/MainTabs';
import AuthStack from './src/navigation/AuthStack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { ActivityIndicator, View } from 'react-native';

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
      <Root />
    </AuthProvider>
  );
}
