import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Platform } from 'react-native';
import BackButton from '../components/BackButton';
import { styles } from '../styles/ProductoDetalleScreenStyles';
import * as NavigationBar from 'expo-navigation-bar';
import { readVentaLineasByVentaId, updateVentaInLocalExcel, replaceVentaLineas, readProductosFromLocalExcel } from '../utils/excel';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';
import { Picker } from '@react-native-picker/picker';

interface VentaDetalleScreenProps {
  venta: { id: number; cliente: string; fecha: string; total: number; estado?: 'pagado' | 'señado' | 'no pagado'; lineas?: Array<{ nombre: string; cantidad: number; unit: number; total: number }> };
  navigation?: { goBack: () => void };
}

export const VentaDetalleScreen: React.FC<VentaDetalleScreenProps> = ({ venta, navigation }) => {
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

  const lineas = useMemo(() => {
    if (venta.lineas && venta.lineas.length > 0) return venta.lineas;
    // intentar leer desde persistencia
    try {
      if (venta.id) {
        return readVentaLineasByVentaId(venta.id as number) as any;
      }
    } catch {}
    return [] as any[];
  }, [venta]);
  // Estado local para reflejar cambios de inmediato en el front
  const [ventaView, setVentaView] = useState<{ id: number; cliente: string; fecha: string; total: number; estado?: 'pagado' | 'señado' | 'no pagado' }>(
    { id: venta.id, cliente: venta.cliente, fecha: venta.fecha, total: venta.total, estado: venta.estado }
  );
  const [lineasView, setLineasView] = useState<any[]>(lineas);
  const subtotal = lineasView.reduce((acc: number, l: { total: number }) => acc + l.total, 0);
  const envioCalc = Math.max(0, (ventaView.total || 0) - subtotal);
  const [editVisible, setEditVisible] = useState(false);
  const [envioStr, setEnvioStr] = useState('');
  const [lineasEdit, setLineasEdit] = useState<any[]>(lineas);
  const [estadoEdit, setEstadoEdit] = useState<'pagado' | 'señado' | 'no pagado'>(venta.estado ?? 'pagado');

  // Si cambia la venta prop (p.ej. navegación), sincronizamos estados locales
  useEffect(() => {
    setVentaView({ id: venta.id, cliente: venta.cliente, fecha: venta.fecha, total: venta.total, estado: venta.estado });
    setLineasView(lineas);
    setLineasEdit(lineas);
    setEstadoEdit(venta.estado ?? 'pagado');
  }, [venta, lineas]);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState('');

  useEffect(() => {
    if (editVisible) {
      try {
        const prods = readProductosFromLocalExcel() as any[];
        setProductos(prods);
      } catch {}
    }
  }, [editVisible]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation?.goBack?.()} color="#3b82f6" />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{ventaView.cliente || 'Venta sin cliente'}</Text>
          <Text style={styles.headerSubtitle}>{new Date(ventaView.fecha).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.botonAccion} onPress={() => { setLineasEdit(lineas); setEnvioStr(''); setEstadoEdit(ventaView.estado ?? 'pagado'); setEditVisible(true); }}>
          <Text style={styles.botonAccionTexto}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {lineasView.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.label}>Productos</Text>
            <FlatList
              data={lineasView}
              keyExtractor={(_, idx) => String(idx)}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.value}>{item.nombre}</Text>
                    <Text style={styles.label}>{item.cantidad} x ${Math.round(item.unit)}</Text>
                  </View>
                  <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(item.total)}</Text>
                </View>
              )}
            />
          </View>
        ) : null}

        <View style={[styles.card, { gap: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(subtotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Envío</Text>
            <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(envioCalc)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.value, { color: '#28a745' }]}>${Math.round(ventaView.total)}</Text>
          </View>
        </View>
      </View>

      {/* Modal de edición simple */}
      <Modal visible={editVisible} animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={productoModalStyles.container}>
          <View style={productoModalStyles.header}>
            <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={() => setEditVisible(false)}>
              <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={productoModalStyles.headerTitle}>Editar Venta</Text>
            <TouchableOpacity
              style={productoModalStyles.botonGuardar}
              onPress={() => {
                try {
                  const envioNum = Number(envioStr);
                  const envioVal = Number.isFinite(envioNum) && envioNum > 0 ? envioNum : 0;
                  const nuevoTotal = lineasEdit.reduce((acc: number, l: any) => acc + Number(l.total || 0), 0) + envioVal;
                  updateVentaInLocalExcel({ id: venta.id, cliente: venta.cliente, fecha: venta.fecha, total: nuevoTotal, estado: estadoEdit });
                  replaceVentaLineas(
                    venta.id,
                    lineasEdit.map((l: any) => ({ ventaId: venta.id, productoId: l.productoId, nombre: l.nombre, cantidad: l.cantidad, unit: l.unit, total: l.total }))
                  );
                  // Reflejar en UI inmediatamente
                  setVentaView(prev => ({ ...prev, total: nuevoTotal, estado: estadoEdit }));
                  setLineasView(lineasEdit);
                  setEditVisible(false);
                } catch {}
              }}
            >
              <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <View style={productoModalStyles.formulario}>
            {/* Estado de la venta */}
            <Text style={productoModalStyles.etiqueta}>Estado de la venta</Text>
            {Platform.OS === 'web' ? (
              <select
                value={estadoEdit}
                onChange={(e) => setEstadoEdit(e.target.value as any)}
                style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', paddingLeft: 12, marginBottom: 16 } as any}
              >
                <option value="pagado">Pagado</option>
                <option value="señado">Señado</option>
                <option value="no pagado">No pagado</option>
              </select>
            ) : (
              <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16 }}>
                <Picker
                  selectedValue={estadoEdit}
                  onValueChange={(val: any) => setEstadoEdit(val)}
                  dropdownIconColor="#adb5bd"
                  style={{ color: '#f1f3f5' }}
                >
                  <Picker.Item label="Pagado" value="pagado" />
                  <Picker.Item label="Señado" value="señado" />
                  <Picker.Item label="No pagado" value="no pagado" />
                </Picker>
              </View>
            )}
            {/* Agregar producto a la venta */}
            <Text style={productoModalStyles.etiqueta}>Agregar producto</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                {Platform.OS === 'web' ? (
                  <select
                    value={selectedProductoId ?? ''}
                    onChange={(e) => setSelectedProductoId(e.target.value ? Number(e.target.value) : null)}
                    style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', paddingLeft: 12 } as any}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' }}>
                    <Picker
                      selectedValue={selectedProductoId ?? ''}
                      onValueChange={(val: any) => setSelectedProductoId(val ? Number(val) : null)}
                      dropdownIconColor="#adb5bd"
                      style={{ color: '#f1f3f5' }}
                    >
                      <Picker.Item label="Seleccionar producto" value="" />
                      {productos.map(p => (
                        <Picker.Item key={p.id} label={String(p.nombre)} value={String(p.id)} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
              <View style={{ width: 120 }}>
                <TextInput
                  style={productoModalStyles.input}
                  placeholder="Cantidad"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={cantidadTemp}
                  onChangeText={setCantidadTemp}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  const pid = selectedProductoId;
                  const qty = Number(cantidadTemp);
                  const prod = productos.find((p) => p.id === pid);
                  if (!pid || !prod || !Number.isFinite(qty) || qty <= 0) return;
                  const unit = Number(prod.precioUnitarioConGanancia ?? 0);
                  const total = unit * qty;
                  setLineasEdit(prev => [...prev, { productoId: pid, nombre: prod.nombre, cantidad: qty, unit, total }]);
                  setSelectedProductoId(null);
                  setCantidadTemp('');
                }}
                style={{ backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Agregar</Text>
              </TouchableOpacity>
            </View>

            <Text style={productoModalStyles.etiqueta}>Ajuste de envío (opcional)</Text>
            <Text style={{ color: '#adb5bd', marginBottom: 8 }}>Ingresa un monto para sumar al total final.</Text>
            <TextInput
              style={productoModalStyles.input}
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={envioStr}
              onChangeText={setEnvioStr}
            />

            <View style={{ marginTop: 16 }}>
              {lineasEdit.map((l, idx) => (
                <View key={`${l.productoId}-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ color: '#f1f3f5', fontWeight: '600' }}>{l.nombre}</Text>
                    <Text style={{ color: '#adb5bd', marginTop: 2 }}>{l.cantidad} x ${Math.round(l.unit)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#28a745', fontWeight: '700', marginRight: 12 }}>${Math.round(l.total)}</Text>
                    <TouchableOpacity onPress={() => setLineasEdit(prev => prev.filter((_, i) => i !== idx))} style={{ backgroundColor: '#dc3545', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
