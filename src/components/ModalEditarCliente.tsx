import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';
import { Cliente } from '../types';
import { updateClienteInLocalExcel } from '../utils/excel';

interface ModalEditarClienteProps {
  visible: boolean;
  cliente?: Cliente | null;
  onCerrar: () => void;
  onActualizado: (cliente: Cliente) => void;
}

export const ModalEditarCliente: React.FC<ModalEditarClienteProps> = ({ visible, cliente, onCerrar, onActualizado }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    if (visible && cliente) {
      setNombre(cliente.nombre || '');
      setApellido(cliente.apellido || '');
      setTelefono(cliente.telefono || '');
    }
  }, [visible, cliente]);

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

  const guardar = () => {
    if (!cliente?.id) return onCerrar();
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }
    const actualizado: Cliente = {
      ...cliente,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() || undefined,
    };
    const ok = updateClienteInLocalExcel(actualizado as any);
    if (ok) {
      onActualizado(actualizado);
      onCerrar();
    } else {
      Alert.alert('Error', 'No se pudo actualizar el cliente');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <View style={productoModalStyles.container}>
        <View style={productoModalStyles.header}>
          <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={onCerrar}>
            <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={productoModalStyles.headerTitle}>Editar Cliente</Text>
          <TouchableOpacity style={productoModalStyles.botonGuardar} onPress={guardar}>
            <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={productoModalStyles.formulario}>
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
        </View>
      </View>
    </Modal>
  );
};
