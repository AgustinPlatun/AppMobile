import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ProductosScreen } from './ProductosScreen';
import { Producto } from '../types';
import { ProductoDetalleScreen } from './ProductoDetalleScreen';
import { IngredientesScreen } from './IngredientesScreen';
import { styles } from '../styles/HomeScreenStyles';
import { ClientesScreen } from './ClientesScreen';

interface HomeScreenProps {
  navigation?: any; // Temporal, luego agregaremos navegación tipada
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [pantallaActual, setPantallaActual] = useState<'home' | 'productos' | 'ingredientes' | 'productoDetalle' | 'clientes' | 'ventas' | 'ventaDetalle'>('home');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setButtonStyleAsync('light');
        if (NavigationBar.setBehaviorAsync) {
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }
      } catch {}
    })();
  }, []);

  const navegarAProductos = () => {
    setPantallaActual('productos');
  };

  const navegarAIngredientes = () => {
    setPantallaActual('ingredientes');
  };

  const navegarAClientes = () => {
    setPantallaActual('clientes');
  };

  const navegarAVentas = () => {
    setPantallaActual('ventas');
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

  if (pantallaActual === 'clientes') {
    return <ClientesScreen navigation={{ goBack: volverAlInicio }} />;
  }

  if (pantallaActual === 'ventas') {
    const { VentasScreen } = require('./VentasScreen');
    return (
      <VentasScreen
        navigation={{ goBack: volverAlInicio }}
        onVerDetalleVenta={(venta: { id: number; cliente: string; fecha: string; total: number; lineas?: Array<{ nombre: string; cantidad: number; unit: number; total: number }> }) => {
          setVentaSeleccionada(venta);
          setPantallaActual('ventaDetalle');
        }}
      />
    );
  }

  if (pantallaActual === 'productoDetalle' && productoSeleccionado) {
    return (
      <ProductoDetalleScreen
        producto={productoSeleccionado}
        navigation={{ goBack: () => setPantallaActual('productos') }}
      />
    );
  }

  if (pantallaActual === 'ventaDetalle' && ventaSeleccionada) {
    const { VentaDetalleScreen } = require('./VentaDetalleScreen');
    return (
      <VentaDetalleScreen
        venta={ventaSeleccionada}
        navigation={{ goBack: () => setPantallaActual('ventas') }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rico y saludable</Text>
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

        <TouchableOpacity
          style={styles.actionButton}
          onPress={navegarAClientes}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionTitle}>Registrar cliente</Text>
          <Text style={styles.actionSubtitle}>Crear un nuevo cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={navegarAVentas}
        >
          <Text style={styles.actionIcon}>🧾</Text>
          <Text style={styles.actionTitle}>Registrar venta</Text>
          <Text style={styles.actionSubtitle}>Crear una nueva venta</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};


