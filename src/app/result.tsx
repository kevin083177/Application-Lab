import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useRouter } from 'expo-router';

export default function Result() {
  const { leaveRoom } = useSocket();
  const router = useRouter();

  const handleLeave = () => {
    leaveRoom();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* 標題區域 */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>遊戲結束</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.statusContent}>
        <Text style={styles.message}>等待房主重新開始...</Text>
        <ActivityIndicator size="small" color="#666" style={styles.loader} />
      </View>

      <TouchableOpacity 
        style={styles.leaveButton} 
        activeOpacity={0.8}
        onPress={handleLeave}
      >
        <Text style={styles.leaveButtonText}>離開房間</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 10,
  },
  statusContent: {
    alignItems: 'center',
    marginBottom: 60,
  },
  message: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
    letterSpacing: 1,
  },
  loader: {
    transform: [{ scale: 1.2 }],
  },
  leaveButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 100,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});