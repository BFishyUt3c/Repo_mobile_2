import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    console.log('🔐 Iniciando proceso de login...');
    const success = await login(email.trim(), password);
    
    if (!success) {
      console.log('❌ Login falló');
      setError('Credenciales incorrectas o error de conexión');
      Alert.alert(
        'Error de Login',
        'No se pudo iniciar sesión. Verifica:\n\n• Tu email y contraseña\n• Tu conexión a internet\n• Que el servidor esté funcionando',
        [{ text: 'OK' }]
      );
    } else {
      console.log('✅ Login exitoso');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError('');
        }}
        secureTextEntry
        autoCorrect={false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.registerLink} 
        onPress={() => navigation.navigate('Register' as never)}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          ¿No tienes cuenta? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: spacing.lg,
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: fontSizes.body,
    color: colors.black,
    fontFamily: fonts.regular,
    ...shadow,
  },
  button: {
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow,
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerLink: {
    marginTop: spacing.md,
  },
  registerText: {
    color: colors.gray,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
});

export default LoginScreen; 