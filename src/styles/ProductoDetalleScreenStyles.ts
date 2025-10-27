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
    paddingHorizontal: 12,
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
  },
  headerCenter: {
    alignItems: 'center',
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
});
