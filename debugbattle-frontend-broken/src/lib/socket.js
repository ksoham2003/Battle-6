import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/config';

const socketUrl = SOCKET_URL || window.location.origin;

// Single production-grade socket instance
export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default socket;
