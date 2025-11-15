import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { readIngredientesFromLocalExcel } from '../utils/excel';
import { styles as modalStyles } from '../styles/ModalIngredienteStyles';

type Opcion = { id: number; nombre: string; unidad: string };

interface ModalAgregarIngredienteProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardar: (seleccion: { ingredienteId: number; nombre: string; unidad: string; cantidadUsada: number }) => void;
}

export const ModalAgregarIngrediente: React.FC<ModalAgregarIngredienteProps> = ({ visible, onCerrar, onGuardar }) => {
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [ingredienteId, setIngredienteId] = useState<string>('');
  const [cantidadUsada, setCantidadUsada] = useState<string>('');
  const [nombreLibre, setNombreLibre] = useState<string>(''); // fallback para no-web

  useEffect(() => {
    if (visible) {
      const lista = readIngredientesFromLocalExcel();
      const ops = lista
        .filter(i => !!i.nombre)
        .map((i, idx) => ({ id: i.id ?? idx + 1, nombre: i.nombre, unidad: i.unidad }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
      setOpciones(ops);
    }
  }, [visible]);

  const validar = () => {
    // En web y en mobile usamos un selector (select o Picker), así que validamos ingredienteId
    if (!ingredienteId) {
      Alert.alert('Error', 'Seleccioná un ingrediente');
      return false;
    }
    if (!cantidadUsada.trim() || isNaN(Number(cantidadUsada)) || Number(cantidadUsada) <= 0) {
      Alert.alert('Error', 'Ingresá una cantidad válida (> 0)');
      return false;
    }
    return true;
  };

  const guardar = () => {
    if (!validar()) return;
    const idNum = Number(ingredienteId);
    const op = opciones.find(o => o.id === idNum);
    if (!op) {
      Alert.alert('Error', 'Ingrediente no encontrado');
      return;
    }
  onGuardar({ ingredienteId: op.id, nombre: op.nombre, unidad: op.unidad, cantidadUsada: Number(cantidadUsada) });
  setIngredienteId('');
  setCantidadUsada('');
  setNombreLibre('');
  onCerrar();
  };

  const cerrar = () => {
    setIngredienteId('');
    setCantidadUsada('');
    setNombreLibre('');
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={cerrar}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity style={modalStyles.botonCerrar} onPress={cerrar}>
            <Text style={modalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Agregar ingrediente</Text>
          <TouchableOpacity style={modalStyles.botonGuardar} onPress={guardar}>
            <Text style={modalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={modalStyles.formulario} showsVerticalScrollIndicator={false}>
          <View style={modalStyles.campo}>
            <Text style={modalStyles.etiqueta}>Ingrediente *</Text>
            {Platform.OS === 'web' ? (
              <select
                value={ingredienteId}
                onChange={(e) => setIngredienteId(e.target.value)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#e9ecef',
                  paddingLeft: 12,
                } as any}
              >
                <option value="">Seleccionar...</option>
                {opciones.map(op => (
                  <option key={op.id} value={op.id}>{op.nombre} ({op.unidad})</option>
                ))}
              </select>
            ) : (
              <View style={{
                backgroundColor: '#1e1e1e',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#2a2a2a',
              }}>
                <Picker
                  selectedValue={ingredienteId}
                  onValueChange={(val: string) => setIngredienteId(val)}
                  dropdownIconColor="#adb5bd"
                  style={{ color: '#f1f3f5' }}
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  {opciones.map(op => (
                    <Picker.Item key={op.id} label={`${op.nombre} (${op.unidad})`} value={String(op.id)} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={modalStyles.campo}>
            <Text style={modalStyles.etiqueta}>Cantidad usada *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="0"
              placeholderTextColor="#adb5bd"
              value={cantidadUsada}
              onChangeText={setCantidadUsada}
              keyboardType="numeric"
            />
          </View>

          <View style={modalStyles.ayuda}>
            <Text style={modalStyles.ayudaTexto}>Seleccioná un ingrediente existente y la cantidad utilizada en la receta.</Text>
          </View>
        </ScrollView>
        
      </View>
    </Modal>
  );
};
