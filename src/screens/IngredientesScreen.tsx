import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '../styles/IngredientesScreenStyles';
import { ModalIngrediente } from '../components/ModalIngrediente';
import { ModalEditarIngrediente } from '../components/ModalEditarIngrediente';
import { IngredienteExcel, deleteIngredienteFromLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import { readIngredientesFromLocalExcel } from '../utils/excel';

interface IngredientesScreenProps {
  navigation?: any;
}

export const IngredientesScreen: React.FC<IngredientesScreenProps> = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<IngredienteExcel | null>(null);
  const [confirmState, setConfirmState] = useState<{ visible: boolean; ingrediente?: IngredienteExcel }>({ visible: false });

  useEffect(() => {
    cargarIngredientes();
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
    if (!mostrarModal) cargarIngredientes();
  }, [mostrarModal]);

  const cargarIngredientes = () => {
    const data = readIngredientesFromLocalExcel();
    setIngredientes(data);
  };

  const cerrarModal = () => setMostrarModal(false);
  const onIngredienteGuardado = (ing: any) => {
    setIngredientes((prev) => [ing, ...prev]);
  };

  const onIngredienteActualizado = (ing: IngredienteExcel) => {
    setIngredientes((prev) => prev.map((x) => (x.id === ing.id ? ing : x)));
  };

  const renderIngrediente = ({ item }: { item: any }) => (
    <View style={styles.ingredienteCard}>
      <View style={styles.ingredienteHeader}>
        <View style={styles.ingredienteInfo}>
          <Text style={styles.ingredienteNombre}>{item.nombre}</Text>
          <Text style={styles.proveedor}>{item.cantidad} {item.unidad}</Text>
          <Text style={styles.precio}>${item.precio}</Text>
        </View>
        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={styles.botonEditarChico}
            onPress={() => { setSeleccionado(item); setMostrarEditar(true); }}
          >
            <Text style={styles.botonAccionTextoChico}>Modificar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonAccionChico}
            onPress={() => setConfirmState({ visible: true, ingrediente: item })}
          >
            <Text style={styles.botonAccionTextoChico}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation?.goBack()}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ingredientes</Text>
        <TouchableOpacity style={styles.botonAgregar} onPress={() => setMostrarModal(true)}>
          <Text style={styles.botonAgregarTexto}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.busquedaContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar ingredientes..."
          placeholderTextColor="#6b7280"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {ingredientes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Ingredientes</Text>
          <Text style={styles.emptySubtext}>Toca "Nuevo" para agregar tu primer ingrediente</Text>
        </View>
      ) : (
        <FlatList
          data={ingredientes}
          renderItem={renderIngrediente}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
        />
      )}

  <ModalIngrediente visible={mostrarModal} onCerrar={cerrarModal} onGuardado={onIngredienteGuardado} />
  <ModalEditarIngrediente
    visible={mostrarEditar}
    ingrediente={seleccionado}
    onCerrar={() => setMostrarEditar(false)}
    onActualizado={onIngredienteActualizado}
  />
  <ConfirmModal
    visible={confirmState.visible}
    title="Eliminar ingrediente"
    message={`¿Seguro que querés eliminar "${confirmState.ingrediente?.nombre}"? Esto removerá su uso en productos.`}
    onCancel={() => setConfirmState({ visible: false })}
    onConfirm={() => {
      const id = confirmState.ingrediente?.id;
      if (id) {
        const ok = deleteIngredienteFromLocalExcel(id);
        if (ok) {
          setIngredientes(prev => prev.filter(i => i.id !== id));
        }
      }
      setConfirmState({ visible: false });
    }}
  />
    </View>
  );
};