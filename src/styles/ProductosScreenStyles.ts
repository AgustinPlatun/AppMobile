import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  // BackButton component handles its own styles; legacy botonVolver removed
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f3f5',
  },
  // boton agregar migró a HeaderScreen
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
  productoCard: {
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
  productoHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productoInfo: {
    flex: 1,
    marginRight: 12,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginBottom: 4,
  },
  cantidadInfo: {
    fontSize: 14,
    color: '#adb5bd',
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
  botonTexto: {
    color: '#fff',
    fontSize: 16,
  },
  // Variante más chica para acciones en la cabecera
  botonAccionChico: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  botonAccionTextoChico: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f3f5',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});
