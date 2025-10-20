import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';

const localStyles = StyleSheet.create({
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
  descripcionInput: {
    height: 400,
    textAlignVertical: 'top',
  },
});

interface ModalBloqueRecetaProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (bloque: { id: number; titulo: string; descripcion: string }) => void;
  initialBloque?: { id?: number; titulo: string; descripcion: string };
  modalTitle?: string;
}

export const ModalBloqueReceta: React.FC<ModalBloqueRecetaProps> = ({ visible, onCerrar, onGuardado, initialBloque, modalTitle }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setTitulo('');
      setDescripcion('');
      setError('');
    } else if (initialBloque) {
      setTitulo(initialBloque.titulo || '');
      setDescripcion(initialBloque.descripcion || '');
    }
  }, [visible, initialBloque]);

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
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Título y descripción son obligatorios');
      return;
    }
    const id = initialBloque?.id ?? Date.now();
    onGuardado({ id, titulo: titulo.trim(), descripcion: descripcion.trim() });
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <View style={productoModalStyles.container}>
        <View style={productoModalStyles.header}>
          <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={onCerrar}>
            <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={productoModalStyles.headerTitle}>{modalTitle || (initialBloque ? 'Editar Bloque' : 'Nuevo Bloque')}</Text>
          <TouchableOpacity style={productoModalStyles.botonGuardar} onPress={guardar}>
            <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={productoModalStyles.formulario}>
          {!!error && <Text style={localStyles.errorText}>{error}</Text>}

          <Text style={productoModalStyles.etiqueta}>Título</Text>
          <TextInput
            style={productoModalStyles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ej: Preparación"
            placeholderTextColor="#6b7280"
          />

          <Text style={productoModalStyles.etiqueta}>Descripción</Text>
          <TextInput
            style={[productoModalStyles.input, localStyles.descripcionInput]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Escribe aquí el paso a paso, notas, etc."
            placeholderTextColor="#6b7280"
            multiline
          />

          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
  );
};
