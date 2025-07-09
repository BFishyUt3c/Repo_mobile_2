import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    const ok = await login(email, password);
    if (!ok) setError('Credenciales incorrectas');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register' as never)}>
        <Text style={styles.registerText}>¿No tienes cuenta? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Regístrate</Text></Text>
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