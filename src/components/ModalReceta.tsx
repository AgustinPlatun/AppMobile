import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';
import { appendRecetaToLocalExcel } from '../utils/excel';

const localStyles = StyleSheet.create({
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
});

interface ModalRecetaProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (receta: { id: number; nombre: string }) => void;
}

export const ModalReceta: React.FC<ModalRecetaProps> = ({ visible, onCerrar, onGuardado }) => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setNombre('');
      setError('');
    }
  }, [visible]);

  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      (async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('#121212');
          await NavigationBar.setButtonStyleAsync('light');
          if ((NavigationBar as any).setBehaviorAsync) {
            await (NavigationBar as any).setBehaviorAsync('inset-swipe');
          }
        } catch {}
      })();
    }
  }, [visible]);

  const guardar = () => {
    if (!nombre.trim()) {
      setError('El nombre de la receta es obligatorio');
      return;
    }
    const id = appendRecetaToLocalExcel({
      nombre: nombre.trim(),
      fechaCreacion: new Date().toISOString(),
      activo: true,
    });
    onGuardado({ id, nombre: nombre.trim() });
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <View style={productoModalStyles.container}>
        <View style={productoModalStyles.header}>
          <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={onCerrar}>
            <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={productoModalStyles.headerTitle}>Nueva Receta</Text>
          <TouchableOpacity style={productoModalStyles.botonGuardar} onPress={guardar}>
            <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={productoModalStyles.formulario}>
          {!!error && <Text style={localStyles.errorText}>{error}</Text>}

          <Text style={productoModalStyles.etiqueta}>Nombre de receta</Text>
          <TextInput
            style={productoModalStyles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Tarta de manzana"
            placeholderTextColor="#6b7280"
          />

          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
  );
};
