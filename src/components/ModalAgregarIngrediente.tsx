import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
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
        .map((i, idx) => ({ id: i.id ?? idx + 1, nombre: i.nombre, unidad: i.unidad }));
      setOpciones(ops);
    }
  }, [visible]);

  const validar = () => {
    if (typeof document !== 'undefined') {
      if (!ingredienteId) {
        Alert.alert('Error', 'Seleccioná un ingrediente');
        return false;
      }
    } else {
      if (!nombreLibre.trim()) {
        Alert.alert('Error', 'Ingresá el nombre del ingrediente');
        return false;
      }
    }
    if (!cantidadUsada.trim() || isNaN(Number(cantidadUsada)) || Number(cantidadUsada) <= 0) {
      Alert.alert('Error', 'Ingresá una cantidad válida (> 0)');
      return false;
    }
    return true;
  };

  const guardar = () => {
    if (!validar()) return;
    if (typeof document !== 'undefined') {
      const idNum = Number(ingredienteId);
      const op = opciones.find(o => o.id === idNum);
      if (!op) {
        Alert.alert('Error', 'Ingrediente no encontrado');
        return;
      }
      onGuardar({ ingredienteId: op.id, nombre: op.nombre, unidad: op.unidad, cantidadUsada: Number(cantidadUsada) });
    } else {
      // Fallback sin select nativo (no-web): usar nombreLibre y unidad por defecto "unidades"
      onGuardar({ ingredienteId: -1, nombre: nombreLibre.trim(), unidad: 'unidades', cantidadUsada: Number(cantidadUsada) });
    }
    Alert.alert('Éxito', 'Ingrediente agregado');
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
            {typeof document !== 'undefined' ? (
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
              <TextInput
                style={modalStyles.input}
                placeholder="Escribe el nombre del ingrediente"
                value={nombreLibre}
                onChangeText={setNombreLibre}
              />
            )}
          </View>

          <View style={modalStyles.campo}>
            <Text style={modalStyles.etiqueta}>Cantidad usada *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="0"
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
