import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Alert, Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
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
        if (Platform.OS === 'android') {
          // Barra con color de fondo del home y botones blancos (light)
          try {
            await NavigationBar.setBackgroundColorAsync('#121212');
            await NavigationBar.setButtonStyleAsync('light');
            if (NavigationBar.setBehaviorAsync) {
              await NavigationBar.setBehaviorAsync('inset-swipe');
            }
            if ((NavigationBar as any).setPositionAsync) {
              await (NavigationBar as any).setPositionAsync('relative');
            }
          } catch {}
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo inicializar la base de datos');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Reaplicar estilo de barra de navegación cuando la app vuelve a primer plano
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && Platform.OS === 'android') {
        try {
          await NavigationBar.setBackgroundColorAsync('#121212');
          await NavigationBar.setButtonStyleAsync('light');
          if (NavigationBar.setBehaviorAsync) {
            await NavigationBar.setBehaviorAsync('inset-swipe');
          }
          if ((NavigationBar as any).setPositionAsync) {
            await (NavigationBar as any).setPositionAsync('relative');
          }
        } catch {}
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      {ready ? <HomeScreen /> : null}
      <StatusBar style="light" backgroundColor="#121212" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
