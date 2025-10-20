import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '../styles/ClientesScreenStyles';
import { ModalCliente } from '../components/ModalCliente';
import { readClientesFromLocalExcel } from '../utils/excel';
import { Cliente } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { ModalEditarCliente } from '../components/ModalEditarCliente';
import { deleteClienteFromLocalExcel } from '../utils/excel';

interface ClientesScreenProps {
  navigation?: any;
}

export const ClientesScreen: React.FC<ClientesScreenProps> = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmState, setConfirmState] = useState<{ visible: boolean; cliente?: Cliente }>({ visible: false });
  const [editState, setEditState] = useState<{ visible: boolean; cliente?: Cliente | null }>({ visible: false, cliente: null });

  useEffect(() => {
    cargarClientes();
  }, []);

  // Ajustar Navigation Bar para esta pantalla
  useEffect(() => {
    if (Platform.OS === 'android') {
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
  }, []);

  useEffect(() => {
    if (!mostrarModal) cargarClientes();
  }, [mostrarModal]);

  const cargarClientes = () => {
    const data = readClientesFromLocalExcel();
    setClientes(data as Cliente[]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity style={styles.botonAgregar} onPress={() => setMostrarModal(true)}>
          <Text style={styles.botonAgregarTexto}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.busquedaContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar clientes..."
          placeholderTextColor="#6b7280"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {clientes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Sin clientes</Text>
          <Text style={styles.emptySubtext}>Toca "+ Nuevo" para registrar tu primer cliente</Text>
        </View>
      ) : (
        <FlatList
          data={clientes.filter(c => `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase()))}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.clienteCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f1f3f5', marginBottom: 4 }}>
                    {item.nombre} {item.apellido}
                  </Text>
                  {item.telefono ? (
                    <Text style={{ fontSize: 14, color: '#adb5bd' }}>{item.telefono}</Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: '#adb5bd' }}>Sin teléfono</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => setEditState({ visible: true, cliente: item })}
                    accessibilityLabel="Editar cliente"
                  >
                    <Text style={{ color: '#3b82f6', fontSize: 18 }}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                    onPress={() => setConfirmState({ visible: true, cliente: item })}
                  >
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          style={styles.list}
        />
      )}

      <ModalCliente
        visible={mostrarModal}
        onCerrar={() => setMostrarModal(false)}
        onGuardado={(nuevo) => {
          // Optimista y luego recarga
          setClientes(prev => [nuevo as any, ...prev]);
          setMostrarModal(false);
        }}
      />

      <ConfirmModal
        visible={confirmState.visible}
        title="Eliminar cliente"
        message={`¿Seguro que querés eliminar a "${confirmState.cliente?.nombre} ${confirmState.cliente?.apellido}"?`}
        onCancel={() => setConfirmState({ visible: false })}
        onConfirm={() => {
          const id = confirmState.cliente?.id;
          if (id) {
            const ok = deleteClienteFromLocalExcel(id);
            if (ok) {
              setClientes(prev => prev.filter(c => c.id !== id));
            }
          }
          setConfirmState({ visible: false });
        }}
      />

      <ModalEditarCliente
        visible={editState.visible}
        cliente={editState.cliente ?? undefined}
        onCerrar={() => setEditState({ visible: false, cliente: null })}
        onActualizado={(actualizado) => {
          setClientes(prev => prev.map(c => (c.id === actualizado.id ? actualizado : c)));
          setEditState({ visible: false, cliente: null });
        }}
      />
    </View>
  );
};
