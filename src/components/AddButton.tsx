import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';

type AddButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  label?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  compact?: boolean; // controla paddings
};

export const AddButton: React.FC<AddButtonProps> = ({
  onPress,
  label = '+ Nuevo',
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  style,
  textStyle,
  compact = true,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor,
          paddingHorizontal: compact ? 12 : 20,
          paddingVertical: compact ? 8 : 10,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  text: {
    fontWeight: '600',
  },
});

export default AddButton;
