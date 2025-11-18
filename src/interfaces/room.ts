export interface Room {
    code: number;
    hostId: string;
    players: string[];
    gameStarted: boolean;
}