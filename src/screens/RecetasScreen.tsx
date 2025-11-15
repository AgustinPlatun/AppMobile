import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import HeaderScreen from '../components/HeaderScreen';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '../styles/ProductosScreenStyles';
import { ModalReceta } from '../components/ModalReceta';
import { deleteRecetaFromLocalExcel, readRecetasFromLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';

interface RecetasScreenProps {
  navigation?: { goBack: () => void };
  onVerDetalle?: (receta: { id: number; nombre: string }) => void;
}

export const RecetasScreen: React.FC<RecetasScreenProps> = ({ navigation, onVerDetalle }) => {
  const [recetas, setRecetas] = useState<Array<{ id: number; nombre: string }>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirm, setConfirm] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#121212');
        await NavigationBar.setButtonStyleAsync('light');
        if ((NavigationBar as any).setBehaviorAsync) {
          await (NavigationBar as any).setBehaviorAsync('inset-swipe');
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // cargar recetas almacenadas
    const data = readRecetasFromLocalExcel();
    setRecetas(data as any);
  }, []);

  const onNuevaRecetaGuardada = (receta: { id: number; nombre: string }) => {
    setRecetas(prev => [receta, ...prev]);
  };

  const recetasOrdenadas = useMemo(() => {
    return recetas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [recetas]);

  return (
    <View style={styles.container}>
      <HeaderScreen
        title="Recetas"
        onBack={() => navigation?.goBack?.()}
        onAdd={() => setModalVisible(true)}
      />

      <FlatList
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        data={recetasOrdenadas}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No hay recetas aún</Text>
            <Text style={styles.emptySubtext}>Toca “+ Nuevo” para crear tu primera receta</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onVerDetalle?.(item)}>
            <View style={styles.productoCard}>
              <View style={styles.productoHeader}>
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{item.nombre}</Text>
                  <Text style={styles.cantidadInfo}>Creada recientemente</Text>
                </View>
                <View style={styles.productoHeaderRight}>
                  <TouchableOpacity
                    style={styles.botonAccionChico}
                    onPress={(e: any) => {
                      e?.stopPropagation?.();
                      setConfirm({ id: item.id, nombre: item.nombre });
                    }}
                  >
                    <Text style={styles.botonAccionTextoChico}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <ConfirmModal
        visible={!!confirm}
        title="Eliminar receta"
        message={confirm ? `¿Eliminar la receta "${confirm.nombre}"? Se eliminarán también sus notas.` : ''}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            if (deleteRecetaFromLocalExcel(confirm.id)) {
              setRecetas(prev => prev.filter(r => r.id !== confirm.id));
              setConfirm(null);
            }
          }
        }}
      />

      <ModalReceta
        visible={modalVisible}
        onCerrar={() => setModalVisible(false)}
        onGuardado={onNuevaRecetaGuardada}
      />
    </View>
  );
};
