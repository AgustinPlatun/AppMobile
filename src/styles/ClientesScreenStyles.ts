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
  botonVolver: {
    paddingVertical: 8,
  },
  botonVolverTexto: {
    fontSize: 16,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f3f5',
  },
  botonAgregar: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontWeight: '600',
  },
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
  clienteCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
