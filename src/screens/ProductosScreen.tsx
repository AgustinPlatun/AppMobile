import React, { useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput
} from 'react-native';
import { ModalProducto } from '../components/ModalProducto';
import { styles } from '../styles/ProductosScreenStyles';
import HeaderScreen from '../components/HeaderScreen';
import { Producto } from '../types';
import { readProductosFromLocalExcel, deleteProductoFromLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import { eventBus } from '../utils/eventBus';

interface ProductosScreenProps {
  navigation?: any;
  onVerDetalle?: (producto: Producto) => void;
}

export const ProductosScreen: React.FC<ProductosScreenProps> = ({ navigation, onVerDetalle }) => {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [confirmar, setConfirmar] = useState<{ visible: boolean; producto?: Producto }>()
    || useState({ visible: false as boolean, producto: undefined as Producto | undefined })[0];
  const [confirmState, setConfirmState] = useState<{ visible: boolean; producto?: Producto }>({ visible: false });

  useEffect(() => {
    cargarProductos();
  }, []);

  // Escuchar cambios en ingredientes para refrescar productos cuando corresponda
  useEffect(() => {
    const off = eventBus.on('ingredients:changed', () => {
      try { cargarProductos(); } catch {}
    });
    return () => { off(); };
  }, []);

  // Ajustar Navigation Bar para esta pantalla
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

  // Recargar al cerrar el modal (después de guardar)
  useEffect(() => {
    if (!mostrarModal) {
      cargarProductos();
    }
  }, [mostrarModal]);

  const cargarProductos = async () => {
    try {
      const data = readProductosFromLocalExcel();
      setProductos(data as Producto[]);
    } catch (e) {
      console.error('Error cargando productos (excel)', e);
    }
  };

  // Importar Excel eliminado

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const onProductoGuardado = (productoCreado: Producto) => {
    // Actualización optimista: mostrar inmediatamente
    setProductos((prev) => [productoCreado, ...prev]);
    // Además, recargar desde DB para asegurar consistencia
    cargarProductos();
  // Sin cartel de éxito: solo cerrar modal y actualizar lista
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity style={styles.productoCard} onPress={() => onVerDetalle?.(item)}>
      <View style={styles.productoHeader}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          <Text style={styles.cantidadInfo}>Rinde: {item.cantidad} unidades</Text>
          {(item.totalConGanancia !== undefined || item.precioUnitarioConGanancia !== undefined) && (
            <View style={{ marginTop: 6 }}>
              {item.totalConGanancia !== undefined && (
                <Text style={styles.cantidadInfo}>
                  Total c/ ganancia: <Text style={{ color: '#28a745', fontWeight: '600' }}>${Math.round(item.totalConGanancia)}</Text>
                </Text>
              )}
              {item.precioUnitarioConGanancia !== undefined && (
                <Text style={styles.cantidadInfo}>
                  Por unidad c/ ganancia: <Text style={{ color: '#28a745', fontWeight: '600' }}>${Math.round(item.precioUnitarioConGanancia)}</Text>
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={styles.botonAccionChico}
            onPress={() => setConfirmState({ visible: true, producto: item })}
          >
            <Text style={styles.botonAccionTextoChico}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HeaderScreen
        title="Productos"
        onBack={() => navigation?.goBack?.()}
        onAdd={() => setMostrarModal(true)}
      />

      <View style={styles.busquedaContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar productos..."
          placeholderTextColor="#6b7280"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {/* Exportación eliminada */}
      </View>

      {productos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Productos</Text>
          <Text style={styles.emptySubtext}>
            Toca "Nuevo" para crear tu primer producto
          </Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ModalProducto
        visible={mostrarModal}
        onCerrar={cerrarModal}
        onGuardado={onProductoGuardado}
      />

      <ConfirmModal
        visible={confirmState.visible}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${confirmState.producto?.nombre}"? Esta acción eliminará también sus ingredientes asociados.`}
        onCancel={() => setConfirmState({ visible: false })}
        onConfirm={() => {
          const id = confirmState.producto?.id;
          if (id) {
            const ok = deleteProductoFromLocalExcel(id);
            if (ok) {
              setProductos(prev => prev.filter(p => p.id !== id));
            }
          }
          setConfirmState({ visible: false });
        }}
      />

      
    </View>
  );
};


