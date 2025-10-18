import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Alert } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { initDatabase } from './src/database/database';
import { initExcelStorage } from './src/utils/excel';

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await initExcelStorage();
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo inicializar la base de datos');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {ready ? <HomeScreen /> : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
