import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, borderRadius, spacing, shadow } from '../styles/theme';

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const CommunitySearchBar: React.FC<Props> = ({ 
  onSearch, 
  placeholder = "Buscar comunidades..." 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.black,
  },
  clearButton: {
    marginLeft: spacing.sm,
  },
  searchButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    ...shadow,
  },
});

export default CommunitySearchBar; 