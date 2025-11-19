/* */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../contexts/SocketContext';

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const onRoomJoined = (response: any) => {
      if (!isJoining) return;

      setIsJoining(false);
      if (response.success) {
        const code = response.body?.code?.toString() || roomCode;
        router.replace({ pathname: '/lobby', params: { code } });
      }
    };

    const onRoomError = (error: any) => {
      if (!isJoining) return;

      setIsJoining(false);
      Alert.alert("錯誤", error.message || "無法加入房間");
    };

    socket.on('room:joined', onRoomJoined);
    socket.on('room:error', onRoomError);

    return () => {
      socket.off('room:joined', onRoomJoined);
      socket.off('room:error', onRoomError);
    };
  }, [socket, isJoining, roomCode, router]);

  const handleJoinRoom = () => {
    if (!socket || !isConnected) {
      Alert.alert("連線錯誤", "尚未連接到伺服器");
      return;
    }

    if (!roomCode.trim()) {
        Alert.alert("提示", "請輸入房號");
        return;
    }

    setIsJoining(true);

    socket.emit('room:join', { roomCode: roomCode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SCENARIO</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.dot, { backgroundColor: isConnected ? '#00cc66' : '#ff4444' }]} />
        <Text style={styles.statusText}>{isConnected ? "已連線" : "連線中..."}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ROOM CODE</Text>
        <TextInput
          style={styles.input}
          value={roomCode}
          onChangeText={setRoomCode}
          placeholder="輸入房號"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={6}
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, !isConnected && styles.buttonDisabled]} 
        onPress={handleJoinRoom}
        disabled={!isConnected || isJoining}
      >
        {isJoining ? (
             <ActivityIndicator color="#000" />
        ) : (
             <Text style={styles.buttonText}>進入房間</Text>
        )}
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
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 5,
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
    backgroundColor: '#2a2a2a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#ccc',
    fontSize: 12,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    borderRadius: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});