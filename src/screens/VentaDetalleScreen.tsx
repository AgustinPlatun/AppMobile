import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Platform } from 'react-native';
import BackButton from '../components/BackButton';
import { styles as baseStyles } from '../styles/ProductoDetalleScreenStyles';
import { styles as ventaStyles } from '../styles/VentaDetalleScreenStyles';
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
    <View style={baseStyles.container}>
      <View style={baseStyles.header}>
        <BackButton onPress={() => navigation?.goBack?.()} color="#3b82f6" />
        <View style={baseStyles.headerCenter}>
          <Text style={baseStyles.headerTitle}>{ventaView.cliente || 'Venta sin cliente'}</Text>
          <Text style={baseStyles.headerSubtitle}>{new Date(ventaView.fecha).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={baseStyles.botonAccion} onPress={() => { setLineasEdit(lineas); setEnvioStr(''); setEstadoEdit(ventaView.estado ?? 'pagado'); setEditVisible(true); }}>
          <Text style={baseStyles.botonAccionTexto}>Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={baseStyles.content}>
        {lineasView.length > 0 ? (
          <View style={baseStyles.card}>
            <Text style={baseStyles.label}>Productos</Text>
            <FlatList
              data={lineasView}
              keyExtractor={(_, idx) => String(idx)}
              renderItem={({ item }) => (
                <View style={ventaStyles.row}>
                  <View>
                    <Text style={baseStyles.value}>{item.nombre}</Text>
                    <Text style={baseStyles.label}>{item.cantidad} x ${Math.round(item.unit)}</Text>
                  </View>
                  <Text style={[baseStyles.value, ventaStyles.valueGreen]}>${Math.round(item.total)}</Text>
                </View>
              )}
            />
          </View>
        ) : null}

        <View style={[baseStyles.card, { gap: 12 }]}>
          <View style={ventaStyles.totalsRow}>
            <Text style={baseStyles.label}>Subtotal</Text>
            <Text style={[baseStyles.value, ventaStyles.valueGreen]}>${Math.round(subtotal)}</Text>
          </View>
          <View style={ventaStyles.totalsRow}>
            <Text style={baseStyles.label}>Envío</Text>
            <Text style={[baseStyles.value, ventaStyles.valueGreen]}>${Math.round(envioCalc)}</Text>
          </View>
          <View style={ventaStyles.totalsRow}>
            <Text style={baseStyles.label}>Total</Text>
            <Text style={[baseStyles.value, ventaStyles.valueGreen]}>${Math.round(ventaView.total)}</Text>
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
                style={ventaStyles.selectWebMb16 as any}
              >
                <option value="pagado">Pagado</option>
                <option value="señado">Señado</option>
                <option value="no pagado">No pagado</option>
              </select>
            ) : (
              <View style={ventaStyles.pickerContainerMb16}>
                <Picker
                  selectedValue={estadoEdit}
                  onValueChange={(val: any) => setEstadoEdit(val)}
                  dropdownIconColor="#adb5bd"
                  style={ventaStyles.pickerText}
                >
                  <Picker.Item label="Pagado" value="pagado" />
                  <Picker.Item label="Señado" value="señado" />
                  <Picker.Item label="No pagado" value="no pagado" />
                </Picker>
              </View>
            )}
            {/* Agregar producto a la venta */}
            <Text style={productoModalStyles.etiqueta}>Agregar producto</Text>
            <View style={ventaStyles.rowCenterGap12}>
              <View style={ventaStyles.flex1}>
                {Platform.OS === 'web' ? (
                  <select
                    value={selectedProductoId ?? ''}
                    onChange={(e) => setSelectedProductoId(e.target.value ? Number(e.target.value) : null)}
                    style={ventaStyles.selectWeb as any}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <View style={ventaStyles.pickerContainer}>
                    <Picker
                      selectedValue={selectedProductoId ?? ''}
                      onValueChange={(val: any) => setSelectedProductoId(val ? Number(val) : null)}
                      dropdownIconColor="#adb5bd"
                      style={ventaStyles.pickerText}
                    >
                      <Picker.Item label="Seleccionar producto" value="" />
                      {productos.map(p => (
                        <Picker.Item key={p.id} label={String(p.nombre)} value={String(p.id)} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
              <View style={ventaStyles.width120}>
                <TextInput
                  style={ventaStyles.input}
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
                style={ventaStyles.buttonGreen}
              >
                <Text style={ventaStyles.textWhiteStrong}>Agregar</Text>
              </TouchableOpacity>
            </View>

            <Text style={productoModalStyles.etiqueta}>Ajuste de envío (opcional)</Text>
            <Text style={ventaStyles.helperText}>Ingresa un monto para sumar al total final.</Text>
            <TextInput
              style={ventaStyles.input}
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={envioStr}
              onChangeText={setEnvioStr}
            />

            <View style={ventaStyles.mt16}>
              {lineasEdit.map((l, idx) => (
                <View key={`${l.productoId}-${idx}`} style={ventaStyles.row}>
                  <View style={[ventaStyles.flex1, ventaStyles.mr12]}>
                    <Text style={ventaStyles.itemTitle}>{l.nombre}</Text>
                    <Text style={ventaStyles.itemSubtext}>{l.cantidad} x ${Math.round(l.unit)}</Text>
                  </View>
                  <View style={ventaStyles.rowCenterGap8}>
                    <Text style={[ventaStyles.valueGreenStrong, ventaStyles.mr12]}>${Math.round(l.total)}</Text>
                    <TouchableOpacity onPress={() => setLineasEdit(prev => prev.filter((_, i) => i !== idx))} style={ventaStyles.deleteBtn}>
                      <Text style={ventaStyles.textWhiteStrong}>Eliminar</Text>
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
