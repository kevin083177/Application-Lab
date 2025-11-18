export interface SocketResponse<T> {
    success: boolean;
    message: string;
    body: T;
}