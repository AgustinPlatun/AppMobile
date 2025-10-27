import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import BackButton from '../components/BackButton';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '../styles/ProductosScreenStyles';
import { ModalBloqueReceta } from '../components/ModalBloqueReceta';
import { appendRecetaBloqueToLocalExcel, deleteRecetaBloqueFromLocalExcel, readRecetaBloquesByRecetaId, updateRecetaBloqueInLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';

interface RecetaDetalleScreenProps {
  receta: { id: number; nombre: string };
  navigation?: { goBack: () => void };
}

export const RecetaDetalleScreen: React.FC<RecetaDetalleScreenProps> = ({ receta, navigation }) => {
  const [bloques, setBloques] = useState<Array<{ id: number; titulo: string; descripcion: string }>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<{ id: number; titulo: string; descripcion: string } | undefined>(undefined);
  const [confirm, setConfirm] = useState<{ id: number; titulo: string } | null>(null);
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
    // cargar bloques de esta receta
    const data = readRecetaBloquesByRecetaId(receta.id);
    const mapped = data
      .filter(b => typeof b.id === 'number')
      .map(b => ({ id: b.id as number, titulo: b.titulo, descripcion: b.descripcion }));
    setBloques(mapped);
  }, [receta?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation?.goBack?.()} color="#007bff" />
        <Text style={[styles.headerTitle, { marginLeft: 10 }]}>{receta.nombre}</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start' }}
          onPress={() => {
            setEditing(undefined);
            setModalVisible(true);
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Agregar bloque</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        data={bloques}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Sin bloques todavía</Text>
            <Text style={styles.emptySubtext}>Usá “+ Agregar bloque” para sumar pasos o notas</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.productoCard}>
            <View style={styles.productoHeader}>
              <Text style={styles.productoNombre}>{item.titulo}</Text>
              <View style={styles.productoHeaderRight}>
                <TouchableOpacity
                  style={[styles.botonAccionChico, { backgroundColor: '#6c757d' }]}
                  onPress={() => {
                    setEditing(item);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.botonAccionTextoChico}>✏️</Text>
                </TouchableOpacity>
                <View style={{ width: 8 }} />
                <TouchableOpacity
                  style={styles.botonAccionChico}
                  onPress={() => setConfirm({ id: item.id, titulo: item.titulo })}
                >
                  <Text style={styles.botonAccionTextoChico}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text style={styles.cantidadInfo}>{item.descripcion}</Text>
            </View>
          </View>
        )}
      />

      <ModalBloqueReceta
        visible={modalVisible}
        onCerrar={() => setModalVisible(false)}
        onGuardado={(bloque) => {
          setBloques(prev => {
            const exists = prev.some(b => b.id === bloque.id);
            if (exists) {
              updateRecetaBloqueInLocalExcel({ ...bloque, recetaId: receta.id });
              return prev.map(b => (b.id === bloque.id ? bloque : b));
            }
            const id = appendRecetaBloqueToLocalExcel({ ...bloque, recetaId: receta.id });
            const nuevo = { ...bloque, id };
            return [...prev, nuevo];
          });
          setEditing(undefined);
        }}
        initialBloque={editing}
        modalTitle={editing ? 'Editar Bloque' : 'Nuevo Bloque'}
      />

      <ConfirmModal
        visible={!!confirm}
        title="Eliminar bloque"
        message={confirm ? `¿Eliminar el bloque "${confirm.titulo}"? Esta acción no se puede deshacer.` : ''}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            deleteRecetaBloqueFromLocalExcel(confirm.id);
            setBloques(prev => prev.filter(b => b.id !== confirm.id));
            setConfirm(null);
          }
        }}
      />
    </View>
  );
};
