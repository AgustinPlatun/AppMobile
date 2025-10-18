import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { styles } from '../styles/ModalIngredienteStyles';
import { IngredienteExcel, updateIngredienteInLocalExcel } from '../utils/excel';

interface ModalEditarIngredienteProps {
  visible: boolean;
  ingrediente: IngredienteExcel | null;
  onCerrar: () => void;
  onActualizado: (ingrediente: IngredienteExcel) => void;
}

export const ModalEditarIngrediente: React.FC<ModalEditarIngredienteProps> = ({ visible, ingrediente, onCerrar, onActualizado }) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState<'gramos' | 'mililitros' | 'litros' | 'kilo' | 'unidades'>('unidades');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    if (visible && ingrediente) {
      setNombre(ingrediente.nombre);
      setCantidad(String(ingrediente.cantidad));
      setUnidad(ingrediente.unidad);
      setPrecio(String(ingrediente.precio));
    }
  }, [visible, ingrediente]);

  const validar = () => {
    if (!nombre.trim()) return Alert.alert('Error', 'El nombre es obligatorio'), false;
    if (!cantidad.trim() || isNaN(Number(cantidad))) return Alert.alert('Error', 'Cantidad inválida'), false;
    if (!precio.trim() || isNaN(Number(precio))) return Alert.alert('Error', 'Precio inválido'), false;
    return true;
  };

  const guardar = () => {
    if (!ingrediente) return;
    if (!validar()) return;
    const actualizado: IngredienteExcel = {
      id: ingrediente.id,
      nombre: nombre.trim(),
      cantidad: Number(cantidad),
      unidad,
      precio: Number(precio),
      fechaCreacion: ingrediente.fechaCreacion ?? new Date().toISOString(),
      activo: ingrediente.activo ?? true,
    };
    const ok = updateIngredienteInLocalExcel(actualizado);
    if (!ok) {
      Alert.alert('Error', 'No se pudo actualizar el ingrediente');
      return;
    }
    onActualizado(actualizado);
    onCerrar();
    Alert.alert('Éxito', 'Ingrediente actualizado');
  };

  const cerrar = () => {
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={cerrar}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.botonCerrar} onPress={cerrar}>
            <Text style={styles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modificar ingrediente</Text>
          <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
            <Text style={styles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formulario} showsVerticalScrollIndicator={false}>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre *</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          </View>

          <View style={[styles.campo, { flexDirection: 'row', gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.etiqueta}>Cantidad *</Text>
              <TextInput style={styles.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.etiqueta}>Unidad *</Text>
              {typeof document !== 'undefined' ? (
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value as any)}
                  style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', paddingLeft: 12 } as any}
                >
                  <option value="gramos">gramos</option>
                  <option value="mililitros">mililitros</option>
                  <option value="unidades">unidades</option>
                </select>
              ) : (
                <TextInput style={styles.input} value={unidad} editable={false} />
              )}
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Precio *</Text>
            <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
          </View>

          <View style={styles.ayuda}>
            <Text style={styles.ayudaTexto}>Actualizá los datos del ingrediente seleccionado.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
