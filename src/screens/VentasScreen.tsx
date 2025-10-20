import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, FlatList } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import styles from '../styles/VentasScreenStyles';
import { ModalVenta } from '../components/ModalVenta';
import { readVentasFromLocalExcel, appendVentaToLocalExcel, writeVentaLineasAllToLocalExcel, readVentaLineasAllFromLocalExcel, deleteVentaFromLocalExcel, readClientesFromLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import { Picker } from '@react-native-picker/picker';

interface VentasScreenProps {
  navigation?: any;
  onVerDetalleVenta?: (venta: { id: number; cliente: string; fecha: string; total: number; lineas?: Array<{ nombre: string; cantidad: number; unit: number; total: number }> }) => void;
}

export const VentasScreen: React.FC<VentasScreenProps> = ({ navigation, onVerDetalleVenta }) => {
  const [clientes, setClientes] = useState<Array<{ id: number; nombre: string; apellido?: string }>>([]);
  const [clienteFiltro, setClienteFiltro] = useState<string>('ALL'); // 'ALL' | 'NONE' | nombre completo
  const [estadoFiltro, setEstadoFiltro] = useState<'ALL' | 'pagado' | 'señado' | 'no pagado'>('ALL');
  const [ventas, setVentas] = useState<Array<{ id: number; cliente: string; fecha: string; total: number; estado?: 'pagado' | 'señado' | 'no pagado' }>>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirm, setConfirm] = useState<{ visible: boolean; ventaId?: number; cliente?: string }>({ visible: false });
  useEffect(() => {
    // Alinear Navigation Bar con el resto de pantallas: transparente + botones blancos
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

  // Cargar ventas persistidas al abrir la pantalla
  useEffect(() => {
    try {
      const data = readVentasFromLocalExcel();
      setVentas(data as any);
    } catch (e) {}
  }, []);

  // Cargar clientes para el filtro desplegable
  useEffect(() => {
    try {
      const cls = readClientesFromLocalExcel() as any[];
      setClientes(cls.map(c => ({ id: c.id, nombre: c.nombre, apellido: c.apellido })));
    } catch {}
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.botonVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ventas</Text>
        <TouchableOpacity style={styles.botonAgregar} onPress={() => setMostrarModal(true)}>
          <Text style={styles.botonAgregarTexto}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.busquedaContainer}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#adb5bd', marginBottom: 8 }}>Cliente</Text>
            {Platform.OS === 'web' ? (
              <select
                value={clienteFiltro}
                onChange={(e) => setClienteFiltro(e.target.value)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2a2a2a',
                  backgroundColor: '#1e1e1e',
                  color: '#f1f3f5',
                  paddingLeft: 12,
                  width: '100%',
                } as any}
              >
                <option value="ALL">Todos</option>
                <option value="NONE">Venta sin cliente</option>
                {clientes.map(c => {
                  const label = `${c.nombre}${c.apellido ? ' ' + c.apellido : ''}`;
                  return (
                    <option key={c.id} value={label}>{label}</option>
                  );
                })}
              </select>
            ) : (
              <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' }}>
                <Picker
                  selectedValue={clienteFiltro}
                  onValueChange={(val: any) => setClienteFiltro(val)}
                  dropdownIconColor="#adb5bd"
                  style={{ color: '#f1f3f5' }}
                >
                  <Picker.Item label="Todos" value="ALL" />
                  <Picker.Item label="Venta sin cliente" value="NONE" />
                  {clientes.map(c => {
                    const label = `${c.nombre}${c.apellido ? ' ' + c.apellido : ''}`;
                    return (
                      <Picker.Item key={c.id} label={label} value={label} />
                    );
                  })}
                </Picker>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#adb5bd', marginBottom: 8 }}>Estado</Text>
            {Platform.OS === 'web' ? (
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value as any)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2a2a2a',
                  backgroundColor: '#1e1e1e',
                  color: '#f1f3f5',
                  paddingLeft: 12,
                  width: '100%',
                } as any}
              >
                <option value="ALL">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="señado">Señado</option>
                <option value="no pagado">No pagado</option>
              </select>
            ) : (
              <View style={{ backgroundColor: '#1e1e1e', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a' }}>
                <Picker
                  selectedValue={estadoFiltro}
                  onValueChange={(val: any) => setEstadoFiltro(val)}
                  dropdownIconColor="#adb5bd"
                  style={{ color: '#f1f3f5' }}
                >
                  <Picker.Item label="Todos" value="ALL" />
                  <Picker.Item label="Pagado" value="pagado" />
                  <Picker.Item label="Señado" value="señado" />
                  <Picker.Item label="No pagado" value="no pagado" />
                </Picker>
              </View>
            )}
          </View>
        </View>
      </View>

      {ventas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Sin ventas</Text>
          <Text style={styles.emptySubtext}>Toca "+ Nuevo" para registrar tu primera venta</Text>
        </View>
      ) : (
        <FlatList
          data={ventas.filter(v => {
            // Cliente filter
            const clienteOk = clienteFiltro === 'ALL'
              ? true
              : clienteFiltro === 'NONE'
              ? (!v.cliente || v.cliente.trim().length === 0)
              : v.cliente === clienteFiltro;
            // Estado filter
            const estadoVal = (v.estado ?? 'pagado');
            const estadoOk = estadoFiltro === 'ALL' ? true : estadoVal === estadoFiltro;
            return clienteOk && estadoOk;
          })}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.ventaCard}>
              <View style={styles.ventaHeader}>
                <TouchableOpacity onPress={() => onVerDetalleVenta?.(item)} style={{ flex: 1 }}>
                  <View style={styles.ventaInfo}>
                    <Text style={styles.ventaCliente}>{item.cliente || 'Venta sin cliente'}</Text>
                    <Text style={styles.ventaFecha}>{new Date(item.fecha).toLocaleDateString()}</Text>
                    <Text style={styles.ventaTotal}>${Math.round(item.total)}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.accionesContainer}>
                  {!!item.estado && (
                    <View
                      style={[
                        styles.ventaEstadoBadge,
                        item.estado === 'no pagado'
                          ? styles.estadoRojo
                          : item.estado === 'pagado'
                          ? styles.estadoVerde
                          : styles.estadoAmarillo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ventaEstadoTexto,
                          (item.estado === 'no pagado' || item.estado === 'pagado') && styles.ventaEstadoTextoClaro,
                        ]}
                      >
                        {item.estado}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setConfirm({ visible: true, ventaId: item.id, cliente: item.cliente })}
                    style={styles.ventaEliminarBtn}
                  >
                    <Text style={styles.ventaEliminarTexto}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <ModalVenta
        visible={mostrarModal}
        onCerrar={() => setMostrarModal(false)}
        onGuardado={(venta: { id: number; cliente: string; fecha: string; total: number; estado?: 'pagado' | 'señado' | 'no pagado'; lineas?: Array<{ productoId: number; nombre: string; cantidad: number; unit: number; total: number }> }) => {
          // Persistir venta
          const id = appendVentaToLocalExcel({ id: venta.id, cliente: venta.cliente, fecha: venta.fecha, total: venta.total, estado: (venta as any).estado ?? 'pagado' });
          // Persistir líneas asociadas
          if (venta.lineas && venta.lineas.length > 0) {
            const existentes = readVentaLineasAllFromLocalExcel();
            // mapear a registros con el id definitivo de la venta
            const nuevas = venta.lineas.map((l) => ({
              id: undefined as any,
              ventaId: id,
              productoId: l.productoId,
              nombre: l.nombre,
              cantidad: l.cantidad,
              unit: l.unit,
              total: l.total,
            }));
            // generar ids incrementales continuando los existentes
            let maxId = existentes.reduce((m, r) => (r.id && r.id > m ? r.id : m), 0);
            const conId = nuevas.map(n => ({ ...n, id: ++maxId }));
            writeVentaLineasAllToLocalExcel([...
              conId,
              ...existentes,
            ] as any);
          }
          const v = { ...venta, id } as any;
          setVentas(prev => [{ id, cliente: v.cliente, fecha: v.fecha, total: v.total, estado: v.estado ?? 'pagado' }, ...prev]);
          setMostrarModal(false);
        }}
      />

      <ConfirmModal
        visible={confirm.visible}
        title="Eliminar venta"
        message={`¿Eliminar la venta${confirm.cliente ? ' de ' + confirm.cliente : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirm({ visible: false })}
        onConfirm={() => {
          try {
            if (confirm.ventaId) {
              const ok = deleteVentaFromLocalExcel(confirm.ventaId);
              if (ok) {
                setVentas(prev => prev.filter(v => v.id !== confirm.ventaId));
              }
            }
          } finally {
            setConfirm({ visible: false });
          }
        }}
      />
    </View>
  );
};
