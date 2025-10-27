import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  // header y boton agregar migraron a HeaderScreen
  busquedaContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  busquedaInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#f1f3f5',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ingredienteCard: {
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#5B21B6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ingredienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  ingredienteInfo: {
    flex: 1,
    marginRight: 12,
  },
  ingredienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginBottom: 4,
  },
  proveedor: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 0,
  },
  categoria: {
    fontSize: 12,
    color: '#60a5fa',
    backgroundColor: '#0b1727',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  precioContainer: {
    alignItems: 'flex-end',
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 4,
  },
  unidad: {
    fontSize: 12,
    color: '#adb5bd',
    marginTop: 2,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockLabel: {
    fontSize: 14,
    color: '#adb5bd',
    marginRight: 8,
  },
  stockCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginRight: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
  },
  botonEliminar: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  // variantes chicas para header, similares a Productos
  botonEditarChico: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonAccionChico: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonAccionTextoChico: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
  },
  ingredienteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fechaCompra: {
    fontSize: 12,
    color: '#adb5bd',
  },
  fechaVencimiento: {
    fontSize: 12,
    color: '#fd7e14',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f3f5',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});
