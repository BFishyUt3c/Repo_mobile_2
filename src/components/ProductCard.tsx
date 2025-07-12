import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductResponseDto } from '../types/product';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  product: ProductResponseDto;
  onPress: (product: ProductResponseDto) => void;
  onExchangePress?: (product: ProductResponseDto) => void;
  onDelete?: (product: ProductResponseDto) => void; // Nuevo
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  onExchangePress,
  onDelete // Nuevo
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ELECTRONICS': return <Ionicons name="phone-portrait-outline" size={16} color="#1976D2" />;
      case 'CLOTHING': return <Ionicons name="shirt-outline" size={16} color="#1976D2" />;
      case 'BOOKS': return <Ionicons name="book-outline" size={16} color="#1976D2" />;
      case 'HOME': return <Ionicons name="home-outline" size={16} color="#1976D2" />;
      case 'SPORTS': return <Ionicons name="football-outline" size={16} color="#1976D2" />;
      case 'TOYS': return <Ionicons name="game-controller-outline" size={16} color="#1976D2" />;
      default: return <Ionicons name="cube-outline" size={16} color="#1976D2" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return '#4CAF50';
      case 'LIKE_NEW': return '#8BC34A';
      case 'GOOD': return '#FFC107';
      case 'FAIR': return '#FF9800';
      case 'POOR': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
          </View>
        )}
        <View style={styles.categoryBadge}>
          {getCategoryIcon(product.category)}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.productName}
        </Text>
        
        <Text style={styles.owner} numberOfLines={1}>
          Por: {product.ownerName}
        </Text>

        <View style={styles.details}>
          <View style={styles.conditionContainer}>
            <View 
              style={[
                styles.conditionDot, 
                { backgroundColor: getConditionColor(product.condition) }
              ]} 
            />
            <Text style={styles.condition}>{product.condition}</Text>
          </View>

          {product.estimatedValue && (
            <Text style={styles.value}>
              ${product.estimatedValue}
            </Text>
          )}
        </View>

        <Text style={styles.date}>
          {formatDate(product.createdAt)}
        </Text>

        {product.availableForExchange && (
          <View style={styles.exchangeBadge}>
            <Ionicons name="swap-horizontal-outline" size={14} color="#1976D2" />
            <Text style={styles.exchangeText}> Intercambio</Text>
          </View>
        )}

        {onExchangePress && product.availableForExchange && (
          <TouchableOpacity 
            style={styles.exchangeButton}
            onPress={() => onExchangePress(product)}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color="#fff" />
            <Text style={styles.exchangeButtonText}> Intercambiar</Text>
          </TouchableOpacity>
        )}
        {/* Botón eliminar si es del usuario */}
        {product.belongsToCurrentUser && onDelete && (
          <TouchableOpacity
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
            onPress={(e) => {
              e.stopPropagation && e.stopPropagation();
              onDelete(product);
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderText: {
    fontSize: 48,
    color: '#ccc',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  categoryIcon: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  owner: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  condition: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  exchangeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exchangeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
    marginLeft: 4,
  },
  exchangeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  exchangeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default ProductCard; 