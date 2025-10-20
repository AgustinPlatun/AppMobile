import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { styles as productoModalStyles } from '../styles/ModalProductoStyles';
import * as NavigationBar from 'expo-navigation-bar';
import { Picker } from '@react-native-picker/picker';
import { readClientesFromLocalExcel, readProductosFromLocalExcel, appendVentaLineaToLocalExcel } from '../utils/excel';

interface ModalVentaProps {
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (venta: { id: number; cliente: string; fecha: string; total: number; estado?: 'pagado' | 'señado' | 'no pagado'; lineas?: Array<{ productoId: number; nombre: string; cantidad: number; unit: number; total: number }> }) => void;
}

export const ModalVenta: React.FC<ModalVentaProps> = ({ visible, onCerrar, onGuardado }) => {
  const [clientes, setClientes] = useState<Array<{ id: number; nombre: string; apellido?: string }>>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [productos, setProductos] = useState<Array<any>>([]);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState('');
  const [lineas, setLineas] = useState<Array<{ productoId: number; nombre: string; cantidad: number; unit: number; total: number }>>([]);
  const [envio, setEnvio] = useState('');
  const [estado, setEstado] = useState<'pagado' | 'señado' | 'no pagado'>('pagado');

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

  // Cargar clientes y productos cuando se abre el modal
  useEffect(() => {
    if (visible) {
      try {
        const cls = readClientesFromLocalExcel() as any[];
        setClientes(cls.map(c => ({ id: c.id, nombre: c.nombre, apellido: c.apellido })));
      } catch {}
      try {
        const prods = readProductosFromLocalExcel() as any[];
        setProductos(prods);
      } catch {}
    }
  }, [visible]);

  const cerrar = () => {
    setSelectedClienteId(null);
    setSelectedProductoId(null);
    setCantidadTemp('');
    setLineas([]);
    setEnvio('');
    setEstado('pagado');
    onCerrar();
  };

  const guardar = () => {
    const subtotal = lineas.reduce((acc, l) => acc + l.total, 0);
    const envioNum = Number(envio);
    const envioVal = Number.isFinite(envioNum) && envioNum > 0 ? envioNum : 0;
    const monto = subtotal + envioVal;
    if (!Number.isFinite(monto) || monto <= 0 || lineas.length === 0) return;
    const clienteNombre = selectedClienteId
      ? (() => {
          const c = clientes.find(x => x.id === selectedClienteId);
          return c ? `${c.nombre}${c.apellido ? ' ' + c.apellido : ''}` : '';
        })()
      : '';
  const venta = { id: Date.now(), cliente: clienteNombre, fecha: new Date().toISOString(), total: monto, estado, lineas: [...lineas] };
    // Guardar líneas con ventaId provisional; el id definitivo lo establecerá la pantalla al persistir la venta principal
    try {
      // No escribimos aún en storage global aquí (para evitar id desfasados), solo devolvemos las líneas
      // Alternativamente, si quisiéramos persistir aquí, necesitaríamos el id final.
    } catch {}
    onGuardado(venta);
    cerrar();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={cerrar}>
      <View style={productoModalStyles.container}>
        <View style={productoModalStyles.header}>
          <TouchableOpacity style={productoModalStyles.botonCerrar} onPress={cerrar}>
            <Text style={productoModalStyles.botonCerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={productoModalStyles.headerTitle}>Nueva Venta</Text>
          <TouchableOpacity style={productoModalStyles.botonGuardar} onPress={guardar}>
            <Text style={productoModalStyles.botonGuardarTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={productoModalStyles.formulario}>
          <Text style={productoModalStyles.etiqueta}>Estado de la venta</Text>
          {Platform.OS === 'web' ? (
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e9ecef',
                paddingLeft: 12,
                marginBottom: 16,
              } as any}
            >
              <option value="pagado">Pagado</option>
              <option value="señado">Señado</option>
              <option value="no pagado">No pagado</option>
            </select>
          ) : (
            <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16 }}>
              <Picker
                selectedValue={estado}
                onValueChange={(val: any) => setEstado(val)}
                dropdownIconColor="#adb5bd"
                style={{ color: '#f1f3f5' }}
              >
                <Picker.Item label="Pagado" value="pagado" />
                <Picker.Item label="Señado" value="señado" />
                <Picker.Item label="No pagado" value="no pagado" />
              </Picker>
            </View>
          )}
          <Text style={productoModalStyles.etiqueta}>Cliente (opcional)</Text>
          {Platform.OS === 'web' ? (
            <select
              value={selectedClienteId ?? ''}
              onChange={(e) => setSelectedClienteId(e.target.value ? Number(e.target.value) : null)}
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e9ecef',
                paddingLeft: 12,
              } as any}
            >
              <option value="">Sin cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}{c.apellido ? ' ' + c.apellido : ''}</option>
              ))}
            </select>
          ) : (
            <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' }}>
              <Picker
                selectedValue={selectedClienteId ?? ''}
                onValueChange={(val: any) => setSelectedClienteId(val ? Number(val) : null)}
                dropdownIconColor="#adb5bd"
                style={{ color: '#f1f3f5' }}
              >
                <Picker.Item label="Sin cliente" value="" />
                {clientes.map(c => (
                  <Picker.Item key={c.id} label={`${c.nombre}${c.apellido ? ' ' + c.apellido : ''}`} value={String(c.id)} />
                ))}
              </Picker>
            </View>
          )}

          {/* Precio de envío (opcional) debajo de cliente */}
          <View style={{ marginTop: 16 }}>
            <Text style={productoModalStyles.etiqueta}>Precio de envío (opcional)</Text>
            <TextInput
              style={productoModalStyles.input}
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={envio}
              onChangeText={setEnvio}
            />
          </View>

          <View style={{ height: 16 }} />

          <Text style={productoModalStyles.etiqueta}>Productos de la venta</Text>
          {/* Selector de producto + cantidad */}
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              {Platform.OS === 'web' ? (
                <select
                  value={selectedProductoId ?? ''}
                  onChange={(e) => setSelectedProductoId(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                    paddingLeft: 12,
                  } as any}
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
                setLineas(prev => [...prev, { productoId: pid, nombre: prod.nombre, cantidad: qty, unit, total }]);
                setSelectedProductoId(null);
                setCantidadTemp('');
              }}
              style={{ backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de líneas */}
          <View style={{ marginTop: 16 }}>
            {lineas.map((l, idx) => (
              <View key={`${l.productoId}-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: '#f1f3f5', fontWeight: '600' }}>{l.nombre}</Text>
                  <Text style={{ color: '#adb5bd', marginTop: 2 }}>{l.cantidad} x ${Math.round(l.unit)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: '#28a745', fontWeight: '700' }}>${Math.round(l.total)}</Text>
                  <TouchableOpacity onPress={() => setLineas(prev => prev.filter((_, i) => i !== idx))} style={{ backgroundColor: '#dc3545', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Totales */}
          {(() => {
            const subtotal = lineas.reduce((acc, l) => acc + l.total, 0);
            const envioNum = Number(envio);
            const envioVal = Number.isFinite(envioNum) && envioNum > 0 ? envioNum : 0;
            const total = subtotal + envioVal;
            return (
              <View style={{ marginTop: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={productoModalStyles.etiqueta}>Subtotal</Text>
                  <Text style={{ color: '#28a745', fontWeight: '800', fontSize: 16 }}>${Math.round(subtotal)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={productoModalStyles.etiqueta}>Envío</Text>
                  <Text style={{ color: '#28a745', fontWeight: '800', fontSize: 16 }}>${Math.round(envioVal)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={productoModalStyles.etiqueta}>Total</Text>
                  <Text style={{ color: '#28a745', fontWeight: '900', fontSize: 18 }}>${Math.round(total)}</Text>
                </View>
              </View>
            );
          })()}
        </View>
      </View>
    </Modal>
  );
};
