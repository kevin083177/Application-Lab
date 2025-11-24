import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Dimensions }from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../contexts/SocketContext';
import { ANIMALS } from '../interfaces/player';
import { useNotification } from '../contexts/NotificationContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = 80;
const ITEM_SPACING = 20;
const SNAP_INTERVAL = ITEM_SIZE + ITEM_SPACING;
const CONTAINER_PADDING = 50;

const EmojiItem = memo(({ item, isSelected, onPress }: { item: string, isSelected: boolean, onPress: () => void }) => {
  return (
    <View style={{ width: ITEM_SIZE, marginHorizontal: ITEM_SPACING / 2, alignItems: 'center' }}>
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.emojiItem,
                isSelected && styles.emojiSelected
            ]}
            activeOpacity={0.8}
        >
            <Text style={styles.emojiText}>{item}</Text>
        </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.item === nextProps.item && prevProps.isSelected === nextProps.isSelected;
});

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(ANIMALS[0]);
  const [isJoining, setIsJoining] = useState(false);
  
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const { showSuccess, showError, showWarning } = useNotification();

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
      showError(error.message || "無法加入房間");
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
      showError("尚未連接到伺服器");
      return;
    }
    if (!roomCode.trim()) {
        showError("請輸入房間號碼");
        return;
    }
    if (!playerName.trim()) {
        showError("請輸入名稱");
        return;
    }

    setIsJoining(true);

    socket.emit('room:join', { 
        roomCode: roomCode,
        name: playerName,
        avatar: selectedEmoji
    });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < ANIMALS.length) {
        if (ANIMALS[index] !== selectedEmoji) {
            setSelectedEmoji(ANIMALS[index]);
        }
    }
  };

  const renderItem = useCallback(({ item, index }: { item: string, index: number }) => {
    return (
      <EmojiItem 
        item={item} 
        isSelected={selectedEmoji === item} 
        onPress={() => {
            setSelectedEmoji(item);
            flatListRef.current?.scrollToOffset({
                offset: index * SNAP_INTERVAL,
                animated: true
            });
        }}
      />
    );
  }, [selectedEmoji]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_SIZE,
    offset: SNAP_INTERVAL * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome !</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.dot, { backgroundColor: isConnected ? '#00cc66' : '#ff4444' }]} />
        <Text style={styles.statusText}>{isConnected ? "已連線" : "連線中..."}</Text>
      </View>

      <View style={styles.formContainer}>
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

        <Text style={styles.label}>選擇你的頭像</Text>
        <View style={styles.emojiListContainer}>
            <FlatList
                ref={flatListRef}
                data={ANIMALS}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                contentContainerStyle={{
                  paddingVertical: 10,
                  paddingHorizontal: (width - CONTAINER_PADDING * 2 - ITEM_SIZE) / 2
                }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  statusText: { 
    color: '#ccc', 
    fontSize: 12 
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 30,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
    letterSpacing: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emojiListContainer: {
    height: 100,
  },
  emojiItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: '#00cc66',
    backgroundColor: '#1a1a1a',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 32,
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
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  buttonDisabled: { 
    backgroundColor: '#555', 
    opacity: 0.7 
  },
  buttonText: { 
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});