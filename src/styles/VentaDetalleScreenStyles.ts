import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Rows and layout
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: { flex: 1 },
  width120: { width: 120 },
  mt16: { marginTop: 16 },
  mr12: { marginRight: 12 },
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
  rowCenterGap12: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Buttons
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonGreen: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },

  // Text coloring helpers
  valueGreen: {
    color: '#28a745',
    fontWeight: '600',
  },
  valueGreenStrong: {
    color: '#28a745',
    fontWeight: '700',
  },
  textWhiteStrong: {
    color: '#fff',
    fontWeight: '700',
  },
  helperText: {
    color: '#adb5bd',
    marginBottom: 8,
  },
  itemTitle: {
    color: '#f1f3f5',
    fontWeight: '600',
  },
  itemSubtext: {
    color: '#adb5bd',
    marginTop: 2,
  },

  // Picker/select containers
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  pickerContainerMb16: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  selectWeb: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingLeft: 12,
  },
  selectWebMb16: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingLeft: 12,
    marginBottom: 16,
  },
  pickerText: {
    color: '#f1f3f5',
  },
  // TextInput style (mismo look que los inputs de los modales)
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
});
