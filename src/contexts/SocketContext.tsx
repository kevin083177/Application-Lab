import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { io, Socket } from "socket.io-client"; 
import { socket } from "../socket/socket";
import { Room } from "../interfaces/room";
import { Scenario } from "../interfaces/scenario";
import { SocketResponse } from "../interfaces/socket";

interface SocketContextState {
  socket: Socket; 
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
  submitVote: (optionId: string) => void; 
}

const SocketContext = createContext<SocketContextState | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [socketId, setSocketId] = useState<string | null>(socket.id || null);
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

    const submitVote = (optionId: string) => {
        socket.emit('vote:submit', { optionId });
    };

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        function onConnect() {
            setIsConnected(true);
            setSocketId(socket.id as string);
        }

        function onDisconnect() {
            setIsConnected(false);
            setSocketId(null);
            setRoom(null);
            setCurrentScenario(null);
        }
        
        function onConnectError(err: any) {
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

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
            if (res.body && res.body.room) {
                setRoom(res.body.room);
            }
            router.replace('/game');
        });

        socket.on('game:restarted', (res: SocketResponse<any>) => {
            setRoom(res.body.room);
            setCurrentScenario(null);
            
            router.replace('/lobby'); 
        });

        const handleFirstScenario = (res: SocketResponse<Scenario>) => {
            if (res.success) {
                setCurrentScenario(res.body);
            } else {
                Alert.alert('遊戲錯誤', res.message);
            }
        };

        const handleNextScenario = (res: SocketResponse<Scenario>) => {
            if (res.success) {
                setTimeout(() => {
                    setCurrentScenario(res.body);
                }, 1000);
            } else {
                Alert.alert('遊戲錯誤', res.message);
            }
        };

        socket.on('scenario:first', handleFirstScenario);
        socket.on('scenario:next', handleNextScenario);

        socket.on('exception', (data: { message: string }) => {
            Alert.alert('系統錯誤', data.message);
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
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
            socket, 
            socketId, isConnected, room, currentScenario,
            connect, disconnect, joinRoom, leaveRoom, startGame, makeChoice, submitVote
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