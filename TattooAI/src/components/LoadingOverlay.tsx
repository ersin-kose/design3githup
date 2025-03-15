import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Text } from 'react-native-paper';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = ({ visible, message = 'Yükleniyor...' }: LoadingOverlayProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    width: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  message: {
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
  },
});

export default LoadingOverlay;