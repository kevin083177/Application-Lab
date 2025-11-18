import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function Index() {
    const { isConnected, connect, room, joinRoom } = useSocket();
    const [roomCode, setRoomCode] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        connect();
    }, []);

    useEffect(() => {
        if (room) {
            router.replace('/lobby');
        }
    }, [room]);

    const handleJoin = () => {
        if (roomCode.length === 6) {
            joinRoom(roomCode);
        } else {
            alert('請輸入6位數房間代碼');
        }
    };
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.card}>
                
                <View style={styles.statusContainer}>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusDot, 
                            { backgroundColor: isConnected ? '#4ade80' : '#f87171' }
                        ]} />
                        <Text style={styles.statusText}>
                            {isConnected ? '已連接至服務器' : '尚未連接至服務器'}
                        </Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="輸入6位數房號"
                        placeholderTextColor="#666"
                        value={roomCode}
                        onChangeText={setRoomCode}
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    <TouchableOpacity 
                        style={[styles.button, styles.joinBtn, !isConnected && styles.disabledBtn]} 
                        onPress={handleJoin}
                        disabled={!isConnected}
                    >
                        <Text style={styles.btnText}>加入房間</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: 30,
        width: '100%',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        color: '#9ca3af',
        fontSize: 14,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#374151',
        color: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 5,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    joinBtn: {
        backgroundColor: '#3b82f6',
    },
    createBtn: {
        backgroundColor: '#10b981',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});