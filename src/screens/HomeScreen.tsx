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
  const [pantallaActual, setPantallaActual] = useState<'home' | 'productos' | 'ingredientes' | 'productoDetalle' | 'clientes' | 'ventas' | 'ventaDetalle' | 'recetas' | 'recetaDetalle'>('home');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#121212');
        await NavigationBar.setButtonStyleAsync('light');
        if (NavigationBar.setBehaviorAsync) {
          await NavigationBar.setBehaviorAsync('inset-swipe');
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

  const navegarARecetas = () => {
    setPantallaActual('recetas');
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

  if (pantallaActual === 'recetas') {
    const { RecetasScreen } = require('./RecetasScreen');
    return (
      <RecetasScreen
        navigation={{ goBack: volverAlInicio }}
        onVerDetalle={(receta: { id: number; nombre: string }) => {
          setRecetaSeleccionada(receta);
          setPantallaActual('recetaDetalle');
        }}
      />
    );
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

  if (pantallaActual === 'recetaDetalle' && recetaSeleccionada) {
    const { RecetaDetalleScreen } = require('./RecetaDetalleScreen');
    return (
      <RecetaDetalleScreen
        receta={recetaSeleccionada}
        navigation={{ goBack: () => setPantallaActual('recetas') }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rico y saludable</Text>
        <View style={styles.headerTitleUnderline} />
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

        <TouchableOpacity
          style={[styles.actionButton, styles.recetasButton]}
          onPress={navegarARecetas}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <Text style={styles.actionTitle}>Recetas</Text>
          <Text style={styles.actionSubtitle}>Gestión de recetas</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};


