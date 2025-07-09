import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSizes, borderRadius, spacing, shadow, fonts } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    setError('');
    if (!firstName || !lastName || !email || !password) {
      setError('Completa todos los campos');
      return;
    }
    const ok = await register({ firstName, lastName, email, password });
    if (!ok) setError('No se pudo registrar');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Registrarse</Text>}
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
    backgroundColor: colors.primary,
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
});

export default RegisterScreen; 