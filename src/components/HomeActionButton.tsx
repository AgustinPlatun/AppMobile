import React from 'react';
import { TouchableOpacity, Text, View, StyleProp, ViewStyle } from 'react-native';
import { styles as homeStyles } from '../styles/HomeScreenStyles';

interface HomeActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const HomeActionButton: React.FC<HomeActionButtonProps> = ({ icon, title, subtitle, onPress, containerStyle }) => {
  return (
    <TouchableOpacity style={[homeStyles.actionButton, containerStyle]} onPress={onPress}>
      <Text style={homeStyles.actionIcon}>{icon}</Text>
      <Text style={homeStyles.actionTitle}>{title}</Text>
      <Text style={homeStyles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

export default HomeActionButton;
