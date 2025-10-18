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
import { Picker } from '@react-native-picker/picker';
import { styles } from '../styles/ModalIngredienteStyles';
import { appendIngredienteToLocalExcel } from '../utils/excel';

interface ModalIngredienteProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (ingredienteCreado: {
    id: number;
    nombre: string;
    cantidad: number;
    unidad: 'gramos' | 'mililitros' | 'litros' | 'kilo' | 'unidades';
    precio: number;
    fechaCreacion: string;
    activo: boolean;
  }) => void;
}

export const ModalIngrediente: React.FC<ModalIngredienteProps> = ({ visible, onCerrar, onGuardado }) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState<'gramos' | 'mililitros' | 'litros' | 'kilo' | 'unidades'>('unidades');
  const [precio, setPrecio] = useState('');

  // En Android, asegurar barra de navegación transparente e iconos blancos cuando el modal está visible
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      (async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('transparent');
          await NavigationBar.setButtonStyleAsync('light');
          if (NavigationBar.setBehaviorAsync) {
            await NavigationBar.setBehaviorAsync('overlay-swipe');
          }
        } catch {}
      })();
    }
  }, [visible]);

  const limpiarFormulario = () => {
    setNombre('');
    setCantidad('');
    setUnidad('unidades');
    setPrecio('');
  };

  const validarFormulario = (): boolean => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del ingrediente es obligatorio');
      return false;
    }
    if (!precio.trim() || isNaN(Number(precio))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return false;
    }
    if (!cantidad.trim() || isNaN(Number(cantidad))) {
      Alert.alert('Error', 'La cantidad debe ser un número válido');
      return false;
    }
    return true;
  };

  const guardarIngrediente = async () => {
    if (!validarFormulario()) return;
    const payload = {
      nombre: nombre.trim(),
      cantidad: Number(cantidad),
      unidad,
      precio: Number(precio),
      fechaCreacion: new Date().toISOString(),
      activo: true,
    } as const;
    const id = appendIngredienteToLocalExcel(payload);
    onGuardado({ id, ...payload });
    limpiarFormulario();
    onCerrar();
    Alert.alert('Éxito', 'Ingrediente agregado');
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
          <Text style={styles.headerTitle}>Nuevo Ingrediente</Text>
          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarIngrediente}
          >
            <Text style={styles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Harina de trigo"
              placeholderTextColor="#6b7280"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* Cantidad y unidad en la misma fila */}
          <View style={[styles.campo, { flexDirection: 'row', gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.etiqueta}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#6b7280"
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.etiqueta}>Unidad *</Text>
              {/* Web: select nativo del navegador. Mobile: Picker nativo. */}
              {Platform.OS === 'web' ? (
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value as any)}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    paddingLeft: 12,
                  } as any}
                >
                  <option value="gramos">gramos</option>
                  <option value="mililitros">mililitros</option>
                  <option value="unidades">unidades</option>
                </select>
              ) : (
                <View style={{
                  backgroundColor: '#1e1e1e',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2a2a2a',
                }}>
                  <Picker
                    selectedValue={unidad}
                    onValueChange={(val: string) => setUnidad(val as any)}
                    dropdownIconColor="#adb5bd"
                    style={{ color: '#f1f3f5' }}
                  >
                    <Picker.Item label="gramos" value="gramos" />
                    <Picker.Item label="mililitros" value="mililitros" />
                    <Picker.Item label="unidades" value="unidades" />
                  </Picker>
                </View>
              )}
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Precio *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.ayuda}>
            <Text style={styles.ayudaTexto}>* Campos obligatorios</Text>
            <Text style={styles.ayudaTexto}>La fecha se registra automáticamente.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};


