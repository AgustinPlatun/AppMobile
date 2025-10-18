import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';
import { appendClienteToLocalExcel } from '../utils/excel';

const localStyles = StyleSheet.create({
  errorText: {
    color: '#f87171',
    marginBottom: 8,
  },
});

interface ModalClienteProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (cliente: { id: number; nombre: string; apellido: string; telefono?: string }) => void;
}

export const ModalCliente: React.FC<ModalClienteProps> = ({ visible, onCerrar, onGuardado }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setNombre('');
      setApellido('');
      setTelefono('');
      setError('');
    }
  }, [visible]);

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

  const guardar = () => {
    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }
    const id = appendClienteToLocalExcel({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() ? telefono.trim() : undefined,
      fechaCreacion: new Date().toISOString(),
      activo: true,
    });
    onGuardado({ id, nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() || undefined });
    onCerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <View style={productoModalStyles.container}>
        <View style={productoModalStyles.header}>
          <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={onCerrar}>
            <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={productoModalStyles.headerTitle}>Nuevo Cliente</Text>
          <TouchableOpacity style={productoModalStyles.botonGuardar} onPress={guardar}>
            <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={productoModalStyles.formulario}>
          {!!error && <Text style={localStyles.errorText}>{error}</Text>}

          <Text style={productoModalStyles.etiqueta}>Nombre</Text>
          <TextInput
            style={productoModalStyles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor="#6b7280"
          />

          <Text style={productoModalStyles.etiqueta}>Apellido</Text>
          <TextInput
            style={productoModalStyles.input}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            placeholderTextColor="#6b7280"
          />

          <Text style={productoModalStyles.etiqueta}>Teléfono (opcional)</Text>
          <TextInput
            style={productoModalStyles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej: +54 9 11 1234-5678"
            placeholderTextColor="#6b7280"
            keyboardType="phone-pad"
          />

          <View style={{ height: 24 }} />
        </View>
      </View>
    </Modal>
  );
};