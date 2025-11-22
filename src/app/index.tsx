import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../contexts/SocketContext';
import { ANIMALS } from '../interfaces/player';

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🐶');
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
    if (!playerName.trim()) {
        Alert.alert("提示", "請輸入名稱");
        return;
    }

    setIsJoining(true);

    socket.emit('room:join', { 
        roomCode: roomCode,
        name: playerName,
        avatar: selectedEmoji
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.dot, { backgroundColor: isConnected ? '#00cc66' : '#ff4444' }]} />
        <Text style={styles.statusText}>{isConnected ? "已連線" : "連線中..."}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.emojiContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiScroll}>
                {ANIMALS.map((emoji) => (
                    <TouchableOpacity 
                        key={emoji} 
                        onPress={() => setSelectedEmoji(emoji)}
                        style={[
                            styles.emojiItem, 
                            selectedEmoji === emoji && styles.emojiSelected
                        ]}
                    >
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>房間號碼</Text>
            <TextInput
            style={styles.input}
            value={roomCode}
            onChangeText={setRoomCode}
            placeholder='輸入房間號碼'
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={6}
            />
        </View>

        <View style={styles.inputWrapper}>
            <Text style={styles.label}>名稱</Text>
            <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="輸入你的名稱"
            placeholderTextColor="#666"
            maxLength={10}
            />
        </View>
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
    marginBottom: 30,
    backgroundColor: '#2a2a2a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#ccc', fontSize: 12 },
  
  formContainer: {
      width: '100%',
      maxWidth: 320,
      marginBottom: 30,
  },
  inputWrapper: {
      marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    borderRadius: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  
  emojiContainer: {
      marginBottom: 20,
  },
  emojiScroll: {
      paddingHorizontal: 10,
      alignItems: 'center',
  },
  emojiItem: {
      padding: 10,
      marginHorizontal: 5,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: 'transparent',
  },
  emojiSelected: {
      borderColor: '#00cc66',
      backgroundColor: '#1a1a1a',
  },
  emojiText: {
      fontSize: 24,
  },

  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#555', opacity: 0.7 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});