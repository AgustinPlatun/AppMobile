import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { ProductosScreen } from './ProductosScreen';
import { Producto } from '../types';
import { ProductoDetalleScreen } from './ProductoDetalleScreen';
import { IngredientesScreen } from './IngredientesScreen';
import { styles } from '../styles/HomeScreenStyles';

interface HomeScreenProps {
  navigation?: any; // Temporal, luego agregaremos navegación tipada
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [pantallaActual, setPantallaActual] = useState<'home' | 'productos' | 'ingredientes' | 'productoDetalle'>('home');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const navegarAProductos = () => {
    setPantallaActual('productos');
  };

  const navegarAIngredientes = () => {
    setPantallaActual('ingredientes');
  };

  const volverAlInicio = () => {
    setPantallaActual('home');
    // Funcionalidad de recarga deshabilitada
  };

  const verDetalleProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setPantallaActual('productoDetalle');
  };

  // Renderizar pantalla según el estado
  if (pantallaActual === 'productos') {
    return (
      <ProductosScreen
        navigation={{ goBack: volverAlInicio }}
        onVerDetalle={verDetalleProducto}
      />
    );
  }

  if (pantallaActual === 'ingredientes') {
    return <IngredientesScreen navigation={{ goBack: volverAlInicio }} />;
  }

  if (pantallaActual === 'productoDetalle' && productoSeleccionado) {
    return (
      <ProductoDetalleScreen
        producto={productoSeleccionado}
        navigation={{ goBack: () => setPantallaActual('productos') }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rico y salidable</Text>
        <Text style={styles.headerSubtitle}>Inicio</Text>
      </View>



      {/* Sección de alertas eliminada */}

      {/* Acciones principales */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={navegarAProductos}
        >
          <Text style={styles.actionIcon}>🛍️</Text>
          <Text style={styles.actionTitle}>Productos</Text>
          <Text style={styles.actionSubtitle}>Gestionar productos y precios</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={navegarAIngredientes}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>Ingredientes</Text>
          <Text style={styles.actionSubtitle}>Controlar stock y costos</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};


