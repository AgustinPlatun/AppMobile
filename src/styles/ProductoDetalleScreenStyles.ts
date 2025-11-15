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
    paddingHorizontal: 16,
    paddingTop: 65,
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
    textAlign: 'center',
    flexShrink: 1,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 2,
  },
  botonAccion: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonAccionTexto: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#5B21B6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f3f5',
  },
  // --- Extras movidos desde el screen ---
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  btnTextStrongWhite: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: { backgroundColor: '#dc3545', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  primaryBtn: { backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenterGap8: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueGreen: {
    color: '#28a745',
  },
  gap12: {
    gap: 12,
  },
  headerRightSpacer: {
    width: 110,
  },
});
