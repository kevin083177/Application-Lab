import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSocket } from '../contexts/SocketContext';

export default function Lobby() {
  const { code } = useLocalSearchParams();
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const handleGameStart = (response: any) => {
        console.log("Game Started!", response);
        router.replace('/game');
    };

    socket.on('game:started', handleGameStart);

    socket.on('room:closed', () => {
        router.replace('/');
    });

    return () => {
        socket.off('game:started', handleGameStart);
        socket.off('room:closed');
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>ROOM</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <View style={styles.waitingArea}>
        <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
        <Text style={styles.waitingText}>等待其他玩家...</Text>
        <Text style={styles.subText}>請留意大螢幕</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  codeContainer: {
    alignItems: 'center',
  },
  codeLabel: {
    color: '#666',
    fontSize: 14,
    letterSpacing: 2,
  },
  code: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  waitingArea: {
    alignItems: 'center',
  },
  waitingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  subText: {
    color: '#666',
    fontSize: 14,
  }
});