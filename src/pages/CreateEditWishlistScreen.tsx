import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import { wishListService } from '../services/wishListService';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/react-navigation';

const CreateEditWishlistScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CreateEditWishlist'>>();
  const navigation = useNavigation();
  const editing = !!route.params?.wishlist;
  const [name, setName] = useState(route.params?.wishlist?.name || '');
  const [isPublic, setIsPublic] = useState(route.params?.wishlist?.isPublic ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      if (editing && route.params?.wishlist) {
        await wishListService.updateWishList(route.params.wishlist.id, { name, isPublic });
      } else {
        await wishListService.createWishList({ name, isPublic });
      }
      setLoading(false);
      Alert.alert('¡Éxito!', editing ? 'Wishlist actualizada.' : 'Wishlist creada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo guardar la wishlist');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre de la lista de deseos"
      />
      <View style={styles.row}>
        <Text style={styles.label}>Pública</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'Actualizar' : 'Crear'} wishlist</Text>}
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
    alignItems: 'center',
    marginVertical: 16,
  },
  saveBtn: {
    marginTop: 32,
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default CreateEditWishlistScreen; 