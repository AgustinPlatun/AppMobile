import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, title = 'Confirmar', message, confirmText = 'Eliminar', cancelText = 'Cancelar', onConfirm, onCancel }) => {
  // En Android, mantener la Navigation Bar transparente e iconos blancos cuando el modal está visible
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      (async () => {
        try {
          await NavigationBar.setBackgroundColorAsync('transparent');
          await NavigationBar.setButtonStyleAsync('light');
          if (NavigationBar.setBehaviorAsync) {
            await NavigationBar.setBehaviorAsync('overlay-swipe');
          }
        } catch {}
      })();
    }
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 420, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 8 }}>{title}</Text>
          <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 16 }}>{message}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity onPress={onCancel} style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: '#6c757d', fontWeight: '600' }}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={{ backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
