import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Platform
} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '../styles/ModalProductoStyles';
import { appendProductoToLocalExcel } from '../utils/excel';

interface ModalProductoProps {
  visible: boolean;
  onCerrar: () => void;
  // Devuelve el producto creado para renderizarlo inmediatamente en la lista
  onGuardado: (productoCreado: {
    id: number;
    nombre: string;
    cantidad: number;
    fechaCreacion: string;
    activo: boolean;
  }) => void;
}

export const ModalProducto: React.FC<ModalProductoProps> = ({ visible, onCerrar, onGuardado }) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');

  // En Android, asegurar barra de navegación transparente e iconos blancos cuando el modal está visible
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      (async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('#121212');
          await NavigationBar.setButtonStyleAsync('light');
          if (NavigationBar.setBehaviorAsync) {
            await NavigationBar.setBehaviorAsync('inset-swipe');
          }
        } catch {}
      })();
    }
  }, [visible]);

  const limpiarFormulario = () => {
    setNombre('');
    setCantidad('');
  };

  const validarFormulario = (): boolean => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return false;
    }
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número válido mayor a 0');
      return false;
    }
    return true;
  };

  const guardarProducto = async () => {
    if (!validarFormulario()) return;
    try {
      const payload = {
        nombre: nombre.trim(),
        cantidad: Number(cantidad),
        fechaCreacion: new Date().toISOString(),
        activo: true,
      };
  // Guardar en "Excel local" (localStorage base64), retornando un id incremental
  const id = appendProductoToLocalExcel(payload);
      // Enviar el producto creado al padre para actualización optimista
      onGuardado({ id, ...payload });
      limpiarFormulario();
      onCerrar();
      Alert.alert('Éxito', `Producto agregado (ID ${id})`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const cerrarModal = () => {
    limpiarFormulario();
    onCerrar();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cerrarModal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.botonCerrar}
            onPress={cerrarModal}
          >
            <Text style={styles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Producto</Text>
          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarProducto}
          >
            <Text style={styles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre del Producto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Torta de chocolate, Pan integral"
              placeholderTextColor="#6b7280"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Cantidad por Receta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12 (porciones), 20 (unidades)"
              placeholderTextColor="#6b7280"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.ayuda}>
            <Text style={styles.ayudaTexto}>* Campos obligatorios</Text>
            <Text style={styles.ayudaTexto}>
              La cantidad representa cuántas unidades o porciones se obtienen con esta receta.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};


