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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  botonCerrar: {
    paddingVertical: 8,
  },
  botonCerrarTexto: {
    fontSize: 16,
    color: '#adb5bd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f3f5',
  },
  botonGuardar: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: '600',
  },
  formulario: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  campo: {
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f3f5',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#f1f3f5',
  },
  inputMultilinea: {
    height: 80,
    textAlignVertical: 'top',
  },
  ayuda: {
    marginTop: 20,
    marginBottom: 40,
  },
  ayudaTexto: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 4,
  },
});
