import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <Text style={styles.title}>遊戲結束</Text>
      
      <View style={styles.content}>
        <Text style={styles.message}>等待房主重新開始...</Text>
      </View>

      <TouchableOpacity 
        style={styles.leaveButton} 
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  message: {
    fontSize: 20,
    color: '#fff',
  },
  leaveButton: {
    backgroundColor: '#FF6B6B', // 紅色
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});