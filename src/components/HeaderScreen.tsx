import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import BackButton from './BackButton';
import AddButton from './AddButton';

type HeaderScreenProps = {
  title: string;
  onBack?: () => void;
  onAdd?: () => void;
  backColor?: string; // color del botón volver (borde/texto)
  addLabel?: string;  // etiqueta del botón de agregar (por defecto + Nuevo)
  style?: ViewStyle;  // override opcional del contenedor
  titleStyle?: TextStyle; // override opcional del título
};

const HeaderScreen: React.FC<HeaderScreenProps> = ({
  title,
  onBack,
  onAdd,
  backColor = '#3b82f6',
  addLabel,
  style,
  titleStyle,
}) => {
  return (
    <View style={[styles.header, style]}> 
      <BackButton onPress={onBack} color={backColor} compact arrowOffset={-2} />
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      <AddButton onPress={onAdd} label={addLabel} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 65,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f3f5',
  },
});

export default HeaderScreen;
