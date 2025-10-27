import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import HomeActionButton from '../components/HomeActionButton';

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

  const navegarAProductos = useCallback(() => setPantallaActual('productos'), []);
  const navegarAIngredientes = useCallback(() => setPantallaActual('ingredientes'), []);
  const navegarAClientes = useCallback(() => setPantallaActual('clientes'), []);
  const navegarAVentas = useCallback(() => setPantallaActual('ventas'), []);
  const navegarARecetas = useCallback(() => setPantallaActual('recetas'), []);
  const volverAlInicio = useCallback(() => setPantallaActual('home'), []);
  const verDetalleProducto = useCallback((producto: Producto) => {
    setProductoSeleccionado(producto);
    setPantallaActual('productoDetalle');
  }, []);

  // Renderizar pantalla según el estado
  const content = useMemo(() => {
    switch (pantallaActual) {
      case 'productos':
        return (
          <ProductosScreen
            navigation={{ goBack: volverAlInicio }}
            onVerDetalle={verDetalleProducto}
          />
        );
      case 'ingredientes':
        return <IngredientesScreen navigation={{ goBack: volverAlInicio }} />;
      case 'clientes':
        return <ClientesScreen navigation={{ goBack: volverAlInicio }} />;
      case 'recetas': {
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
      case 'ventas': {
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
      case 'productoDetalle':
        return productoSeleccionado ? (
          <ProductoDetalleScreen
            producto={productoSeleccionado}
            navigation={{ goBack: () => setPantallaActual('productos') }}
          />
        ) : null;
      case 'ventaDetalle': {
        if (!ventaSeleccionada) return null;
        const { VentaDetalleScreen } = require('./VentaDetalleScreen');
        return (
          <VentaDetalleScreen
            venta={ventaSeleccionada}
            navigation={{ goBack: () => setPantallaActual('ventas') }}
          />
        );
      }
      case 'recetaDetalle': {
        if (!recetaSeleccionada) return null;
        const { RecetaDetalleScreen } = require('./RecetaDetalleScreen');
        return (
          <RecetaDetalleScreen
            receta={recetaSeleccionada}
            navigation={{ goBack: () => setPantallaActual('recetas') }}
          />
        );
      }
      default:
        return null;
    }
  }, [pantallaActual, volverAlInicio, verDetalleProducto, productoSeleccionado, ventaSeleccionada, recetaSeleccionada]);

  if (content) return content;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rico y saludable</Text>
        <View style={styles.headerTitleUnderline} />
        <Text style={styles.headerSubtitle}>Inicio</Text>
      </View>

      <View style={styles.actionsContainer}>
        <HomeActionButton
          icon="🛍️"
          title="Productos"
          subtitle="Gestionar productos y precios"
          onPress={navegarAProductos}
        />
        <HomeActionButton
          icon="📦"
          title="Ingredientes"
          subtitle="Controlar stock y costos"
          onPress={navegarAIngredientes}
        />
        <HomeActionButton
          icon="👤"
          title="Registrar cliente"
          subtitle="Crear un nuevo cliente"
          onPress={navegarAClientes}
        />
        <HomeActionButton
          icon="🧾"
          title="Registrar venta"
          subtitle="Crear una nueva venta"
          onPress={navegarAVentas}
        />
        <HomeActionButton
          icon="📖"
          title="Recetas"
          subtitle="Gestión de recetas"
          onPress={navegarARecetas}
          containerStyle={styles.recetasButton}
        />
      </View>

    </ScrollView>
  );
};


