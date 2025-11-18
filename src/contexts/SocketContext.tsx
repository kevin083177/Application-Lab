import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { socket } from "../socket/socket";
import { Room } from "../interfaces/room";
import { Scenario } from "../interfaces/scenario";
import { SocketResponse } from "../interfaces/socket";

interface SocketContextState {
  socketId: string | null;
  isConnected: boolean;
  room: Room | null;
  currentScenario: Scenario | null;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  makeChoice: (nextScenarioId: string) => void;
}

const SocketContext = createContext<SocketContextState | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
    const router = useRouter();

    const connect = () => {
        if (!socket.connected) socket.connect();
    };
    const disconnect = () => socket.disconnect();

    const joinRoom = (code: string) => socket.emit('room:join', { roomCode: code });
    
    const leaveRoom = () => {
        socket.emit('room:leave'); 
        setRoom(null);
        setCurrentScenario(null);
    }
    
    const startGame = () => socket.emit('game:start');
    
    const makeChoice = (nextScenarioId: string) => {
        socket.emit('scenario:next', { nextScenarioId });
    };

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            setSocketId(socket.id as string);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            setSocketId(null);
            setRoom(null);
            setCurrentScenario(null);
        });

        const handleRoomUpdate = (res: SocketResponse<Room>) => {
            if (res.success) {
                setRoom(res.body);
            } else {
                Alert.alert('錯誤', res.message);
            }
        };

        socket.on('room:created', handleRoomUpdate);
        socket.on('room:joined', handleRoomUpdate);
        socket.on('player:joined', handleRoomUpdate);
        socket.on('player:left', handleRoomUpdate);

        socket.on('room:closed', () => {
            Alert.alert('通知', '房間已解散');
            setRoom(null);
            setCurrentScenario(null);
            router.replace('/');
        });

        socket.on('game:started', (res: SocketResponse<any>) => {
            router.replace('/game');
        });

        const handleScenarioUpdate = (res: SocketResponse<Scenario>) => {
            if (res.success) {
                setCurrentScenario(res.body);
            } else {
                Alert.alert('遊戲錯誤', res.message);
            }
        };

        socket.on('scenario:first', handleScenarioUpdate);
        socket.on('scenario:next', handleScenarioUpdate);

        socket.on('exception', (data: { message: string }) => {
            Alert.alert('系統錯誤', data.message);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('room:created');
            socket.off('room:joined');
            socket.off('player:joined');
            socket.off('player:left');
            socket.off('room:closed');
            socket.off('game:started');
            socket.off('scenario:first');
            socket.off('scenario:next');
            socket.off('exception');
        };
    }, [router]);

    return (
        <SocketContext.Provider value={{ 
            socketId, isConnected, room, currentScenario,
            connect, disconnect, joinRoom, leaveRoom, startGame, makeChoice 
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};