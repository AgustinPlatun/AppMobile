import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { initDatabase } from './src/database/database';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo inicializar la base de datos');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <HomeScreen />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
