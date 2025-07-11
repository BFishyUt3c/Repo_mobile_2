import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { postService } from '../services/postService';
import { useNavigation } from '@react-navigation/native';

const CreatePostScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [wanted, setWanted] = useState<'DONATION' | 'EXCHANGE'>('DONATION');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Campos requeridos', 'El título y contenido son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await postService.createPost({
        title,
        content,
        imageUrl: '', // Puedes agregar picker de imagen si lo deseas
        wanted,
        location,
      });
      setLoading(false);
      Alert.alert('¡Éxito!', 'Publicación creada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo crear la publicación');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Título de la publicación"
      />
      <Text style={styles.label}>Contenido</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={content}
        onChangeText={setContent}
        placeholder="¿Qué quieres compartir?"
        multiline
      />
      <Text style={styles.label}>Ubicación</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Ciudad, barrio, etc. (opcional)"
      />
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, wanted === 'DONATION' && styles.typeBtnActive]}
          onPress={() => setWanted('DONATION')}
        >
          <Text style={wanted === 'DONATION' ? styles.typeTextActive : styles.typeText}>Donación</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, wanted === 'EXCHANGE' && styles.typeBtnActive]}
          onPress={() => setWanted('EXCHANGE')}
        >
          <Text style={wanted === 'EXCHANGE' ? styles.typeTextActive : styles.typeText}>Intercambio</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Crear publicación</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    backgroundColor: '#2196f3',
  },
  typeText: {
    color: '#2196f3',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  createBtn: {
    marginTop: 32,
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default CreatePostScreen; 