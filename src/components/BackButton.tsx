import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native';

type BackButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  label?: string;
  color?: string; // borde y texto
  style?: ViewStyle; // estilos extra para el touchable
  compact?: boolean; // usa paddings más chicos
  arrowOffset?: number; // ajuste vertical fino de la flecha
};

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  label = 'Volver',
  color = '#3b82f6',
  style,
  compact = true,
  arrowOffset = -2,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          borderColor: color,
          paddingVertical: compact ? 5 : 8,
          paddingHorizontal: compact ? 6 : 12,
        },
        style,
      ]}
    >
      <View style={styles.wrapper}>
        <Text style={[styles.arrow, { top: arrowOffset, color }]}>{'\u2190'}</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 8,
  },
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    minHeight: 12,
    paddingLeft: 23, // espacio para la flecha
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    left: 0,
    fontSize: 18,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    right: 5,
    fontWeight: 'normal',
  },
});

export default BackButton;
