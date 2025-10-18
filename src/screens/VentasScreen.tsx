import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import styles from '../styles/VentasScreenStyles';
import { ModalVenta } from '../components/ModalVenta';
import { readVentasFromLocalExcel, appendVentaToLocalExcel, writeVentaLineasAllToLocalExcel, readVentaLineasAllFromLocalExcel, deleteVentaFromLocalExcel } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';

interface VentasScreenProps {
  navigation?: any;
  onVerDetalleVenta?: (venta: { id: number; cliente: string; fecha: string; total: number; lineas?: Array<{ nombre: string; cantidad: number; unit: number; total: number }> }) => void;
}

export const VentasScreen: React.FC<VentasScreenProps> = ({ navigation, onVerDetalleVenta }) => {
  const [busqueda, setBusqueda] = useState('');
  const [ventas, setVentas] = useState<Array<{ id: number; cliente: string; fecha: string; total: number }>>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirm, setConfirm] = useState<{ visible: boolean; ventaId?: number; cliente?: string }>({ visible: false });
  useEffect(() => {
    // Alinear Navigation Bar con el resto de pantallas: transparente + botones blancos
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setButtonStyleAsync('light');
        if ((NavigationBar as any).setBehaviorAsync) {
          await (NavigationBar as any).setBehaviorAsync('overlay-swipe');
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
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por cliente..."
          placeholderTextColor="#6b7280"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {ventas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Sin ventas</Text>
          <Text style={styles.emptySubtext}>Toca "+ Nuevo" para registrar tu primera venta</Text>
        </View>
      ) : (
        <FlatList
          data={ventas.filter(v => v.cliente.toLowerCase().includes(busqueda.toLowerCase()))}
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
        onGuardado={(venta: { id: number; cliente: string; fecha: string; total: number; lineas?: Array<{ productoId: number; nombre: string; cantidad: number; unit: number; total: number }> }) => {
          // Persistir venta
          const id = appendVentaToLocalExcel({ id: venta.id, cliente: venta.cliente, fecha: venta.fecha, total: venta.total });
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
          const v = { ...venta, id };
          setVentas(prev => [{ id, cliente: v.cliente, fecha: v.fecha, total: v.total }, ...prev]);
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
