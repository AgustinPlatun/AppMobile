import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f3f5',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#adb5bd',
    marginTop: 4,
  },
  alertContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e53e3e',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: 8,
  },
  alertItem: {
    fontSize: 14,
    color: '#744210',
    marginBottom: 4,
  },
  alertMore: {
    fontSize: 12,
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingTop: 15,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recetasButton: {},
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#adb5bd',
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f3f5',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#adb5bd',
  },
  productActions: {
    justifyContent: 'center',
  },
  productButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  productButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
