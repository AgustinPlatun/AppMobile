import React from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Platform } from 'react-native';
import BackButton from '../components/BackButton';
import * as NavigationBar from 'expo-navigation-bar';
import { Producto } from '../types';
import { styles } from '../styles/ProductoDetalleScreenStyles';
import { ModalAgregarIngrediente } from '../components/ModalAgregarIngrediente';
import { readIngredientesFromLocalExcel, appendProductoIngredienteToLocalExcel, readProductoIngredientesByProductoId, readProductosFromLocalExcel, updateProductoInLocalExcel, writeProductoIngredientesAllToLocalExcel, readProductoIngredientesAllFromLocalExcel, recomputeProductosTotalsFromIngredientes } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import { eventBus } from '../utils/eventBus';

interface ProductoDetalleScreenProps {
  producto: Producto;
  navigation?: { goBack: () => void };
}

export const ProductoDetalleScreen: React.FC<ProductoDetalleScreenProps> = ({ producto, navigation }) => {
  const [mostrarModal, setMostrarModal] = React.useState(false);
  const [ingredientesUsados, setIngredientesUsados] = React.useState<Array<{ id: string; ingredienteId: number; nombre: string; unidad: string; cantidad: number; costo: number }>>([]);
  const [confirm, setConfirm] = React.useState<{ visible: boolean; id?: string; nombre?: string }>({ visible: false });
  const totalCosto = React.useMemo(() => {
    return ingredientesUsados.reduce((acc, it) => acc + (Number.isFinite(it.costo) ? it.costo : 0), 0);
  }, [ingredientesUsados]);
  const [gananciaPct, setGananciaPct] = React.useState<string>('');
  const [editandoGanancia, setEditandoGanancia] = React.useState<boolean>(false);
  React.useEffect(() => {
    // Precargar ganancia guardada del producto si existe
    if (producto.id) {
      const productos = readProductosFromLocalExcel();
      const p = productos.find(p => p.id === producto.id);
      if (p && typeof p.gananciaPct === 'number') {
        setGananciaPct(String(p.gananciaPct));
      }
      // Nada más que precargar: los totales se recalculan al vuelo
    }
  }, [producto?.id]);

  // Ajustar Navigation Bar para esta pantalla
  React.useEffect(() => {
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
  const totalConGanancia = React.useMemo(() => {
    const pct = Number(gananciaPct);
    if (!Number.isFinite(pct)) return totalCosto;
    return totalCosto * (1 + pct / 100);
  }, [gananciaPct, totalCosto]);
  const costoUnitario = React.useMemo(() => {
    const unidades = Number(producto?.cantidad ?? 0);
    if (!Number.isFinite(unidades) || unidades <= 0) return 0;
    return totalCosto / unidades;
  }, [totalCosto, producto?.cantidad]);
  const costoUnitarioConGanancia = React.useMemo(() => {
    const unidades = Number(producto?.cantidad ?? 0);
    if (!Number.isFinite(unidades) || unidades <= 0) return 0;
    return totalConGanancia / unidades;
  }, [totalConGanancia, producto?.cantidad]);

  // Si cambia el total de ingredientes y hay un porcentaje válido, actualizamos los campos persistidos
  React.useEffect(() => {
    if (producto.id) {
      const pct = Number(gananciaPct);
      if (Number.isFinite(pct)) {
        const totalGan = totalCosto * (1 + pct / 100);
        const unidades = Number(producto.cantidad || 0);
        const unitGan = unidades > 0 ? totalGan / unidades : 0;
        updateProductoInLocalExcel({ id: producto.id, gananciaPct: pct, totalConGanancia: totalGan, precioUnitarioConGanancia: unitGan });
      }
    }
  }, [totalCosto, gananciaPct, producto?.id]);

  React.useEffect(() => {
    // Cargar relaciones guardadas para este producto
    if (producto.id) {
      const rels = readProductoIngredientesByProductoId(producto.id);
      const ingredientes = readIngredientesFromLocalExcel();
      const usados = rels.map(r => {
        const ing = ingredientes.find(i => (i.id ?? -1) === r.ingredienteId) || ingredientes.find(i => i.nombre.trim().toLowerCase() === r.nombre.trim().toLowerCase());
        let costo = 0;
        if (ing && ing.cantidad > 0 && ing.precio >= 0) {
          costo = (ing.precio / ing.cantidad) * r.cantidadUsada;
        }
        return { id: String(r.id ?? `${r.ingredienteId}-${r.cantidadUsada}`), ingredienteId: r.ingredienteId, nombre: r.nombre, unidad: r.unidad, cantidad: r.cantidadUsada, costo };
      });
      setIngredientesUsados(usados);
    }
  }, [producto?.id]);

  const onGuardarIngrediente = (sel: { ingredienteId: number; nombre: string; unidad: string; cantidadUsada: number }) => {
    // Buscar el ingrediente en el Excel local para obtener precio total y cantidad base
    const ingredientes = readIngredientesFromLocalExcel();
    let ing = ingredientes.find(i => (i.id ?? -1) === sel.ingredienteId);
    if (!ing) {
      const nombreLower = sel.nombre.trim().toLowerCase();
      ing = ingredientes.find(i => i.nombre.trim().toLowerCase() === nombreLower);
    }
    let costo = 0;
    if (ing && ing.cantidad > 0 && ing.precio >= 0) {
      const costoUnitario = ing.precio / ing.cantidad; // precio por unidad
      costo = costoUnitario * sel.cantidadUsada;
    }
    // Persistir relación
    if (producto.id) {
      appendProductoIngredienteToLocalExcel({
        productoId: producto.id,
        ingredienteId: sel.ingredienteId,
        nombre: sel.nombre,
        unidad: sel.unidad,
        cantidadUsada: sel.cantidadUsada,
        fechaCreacion: new Date().toISOString(),
      });
    }
    const nuevo = { id: `${sel.ingredienteId}-${Date.now()}`, ingredienteId: sel.ingredienteId, nombre: sel.nombre, unidad: sel.unidad, cantidad: sel.cantidadUsada, costo };
    setIngredientesUsados(prev => [nuevo, ...prev]);
    // Actualizar totales persistidos y notificar refresco de listas que muestren precios
    try { recomputeProductosTotalsFromIngredientes(); } catch {}
    eventBus.emit('ingredients:changed');
  };

  const eliminarIngredienteUsado = (idRow: string) => {
    // Remover de UI
    setIngredientesUsados(prev => prev.filter(i => i.id !== idRow));
    // Remover de persistencia buscando por id numérico si existe
    if (!producto.id) return;
    const all = readProductoIngredientesAllFromLocalExcel();
    const remaining = all.filter(r => String(r.id ?? `${r.ingredienteId}-${r.cantidadUsada}`) !== idRow);
    writeProductoIngredientesAllToLocalExcel(remaining);
    // Recalcular totales globales y notificar
    try { recomputeProductosTotalsFromIngredientes(); } catch {}
    eventBus.emit('ingredients:changed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation?.goBack?.()} color="#3b82f6" />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{producto.nombre}</Text>
          <Text style={styles.headerSubtitle}>{producto.cantidad} unidades</Text>
        </View>
        <View style={{ width: 68 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={{ backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12, marginTop: 12 }}
          onPress={() => setMostrarModal(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Agregar ingrediente</Text>
        </TouchableOpacity>

        {ingredientesUsados.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.label}>Ingredientes usados</Text>
            <FlatList
              data={ingredientesUsados}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.value}>{item.nombre}</Text>
                    <Text style={styles.label}>{item.cantidad} {item.unidad}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={styles.value}>${Math.round(item.costo)}</Text>
                    <TouchableOpacity onPress={() => setConfirm({ visible: true, id: item.id, nombre: item.nombre })} style={{ backgroundColor: '#dc3545', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        ) : null}

        {ingredientesUsados.length > 0 ? (
          <View style={[styles.card, { gap: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Total ingredientes</Text>
              <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(totalCosto)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Costo por unidad</Text>
              <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(costoUnitario)}</Text>
            </View>
            {editandoGanancia ? (
              <View>
                <Text style={styles.label}>Margen de ganancia (%)</Text>
                <TextInput
                  style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    paddingHorizontal: 12,
                    backgroundColor: '#fff',
                  }}
                  placeholder="Ej: 40"
                  keyboardType="numeric"
                  value={gananciaPct}
                  onChangeText={setGananciaPct}
                  onSubmitEditing={() => {
                    // Guardar y cerrar edición
                    if (producto.id) {
                      const pct = Number(gananciaPct);
                      const totalGan = Number.isFinite(pct) ? totalCosto * (1 + pct / 100) : totalCosto;
                      const unidades = Number(producto.cantidad || 0);
                      const unitGan = unidades > 0 ? totalGan / unidades : 0;
                      updateProductoInLocalExcel({ id: producto.id, gananciaPct: Number.isFinite(pct) ? pct : undefined, totalConGanancia: totalGan, precioUnitarioConGanancia: unitGan });
                    }
                    setEditandoGanancia(false);
                  }}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.label}>Margen de ganancia (%)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setEditandoGanancia(true)}
                    style={{ backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Editar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.value, { color: '#28a745' }]}>{Number.isFinite(Number(gananciaPct)) ? `${gananciaPct}%` : '--'}</Text>
                </View>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Total con ganancia</Text>
              <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(totalConGanancia)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Precio por unidad (con ganancia)</Text>
              <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(costoUnitarioConGanancia)}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <ModalAgregarIngrediente
        visible={mostrarModal}
        onCerrar={() => setMostrarModal(false)}
        onGuardar={onGuardarIngrediente}
      />

      <ConfirmModal
        visible={confirm.visible}
        title="Eliminar ingrediente"
        message={`¿Seguro que querés eliminar "${confirm.nombre ?? ''}" de este producto?`}
        onCancel={() => setConfirm({ visible: false })}
        onConfirm={() => {
          if (confirm.id) eliminarIngredienteUsado(confirm.id);
          setConfirm({ visible: false });
        }}
      />
    </View>
  );
};
