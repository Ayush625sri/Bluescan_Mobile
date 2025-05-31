// @ts-nocheck
import { io, Socket, WebSocket } from 'socket.io-client';
import { API_URL } from '../config';
type SocketCallback = (...args: any[]) => void;
import { SOCKET_URL } from '../config';

// class WebSocketService {
//   private socket: Socket | null = null;
//   private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;

//   connect(token: string) {
//     if (this.socket && this.socket.connected) return;

//     this.socket = io(SOCKET_URL, {
//       auth: {
//         token
//       },
//       extraHeaders: {
//         'Authorization': `Bearer ${token}`,
//         'ngrok-skip-browser-warning': 'true'
//       },
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: this.maxReconnectAttempts,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//     });

//     this.setupSocketListeners();

//     // Set up listeners that were registered before connection
//     this.listeners.forEach((callbacks, event) => {
//       callbacks.forEach(callback => {
//         this.socket?.on(event, callback);
//       });
//     });
//   }

//   private setupSocketListeners() {
//     if (!this.socket) return;

//     this.socket.on('connect', () => {
//       console.log('WebSocket connected');
//       this.reconnectAttempts = 0;
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log('WebSocket disconnected:', reason);
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('WebSocket connection error:', error);
//       this.reconnectAttempts++;

//       if (this.reconnectAttempts > this.maxReconnectAttempts) {
//         console.error('Max reconnection attempts reached');
//       }
//     });
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   on(event: string, callback: (...args: any[]) => void) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }

//     this.listeners.get(event)?.push(callback);

//     if (this.socket) {
//       this.socket.on(event, callback);
//     }
//   }

//   off(event: string, callback?: (...args: any[]) => void) {
//     if (callback && this.listeners.has(event)) {
//       const callbacks = this.listeners.get(event) || [];
//       const index = callbacks.indexOf(callback);
//       if (index !== -1) {
//         callbacks.splice(index, 1);
//       }
//       if (callbacks.length === 0) {
//         this.listeners.delete(event);
//       } else {
//         this.listeners.set(event, callbacks);
//       }
//     } else {
//       this.listeners.delete(event);
//     }

//     if (this.socket) {
//       this.socket.off(event, callback);
//     }
//   }

//   emit(event: string, data: any) {
//     if (this.socket) {
//       this.socket.emit(event, data);
//     } else {
//       console.warn('Socket not connected, unable to emit event:', event);
//     }
//   }

//   isConnected(): boolean {
//     return this.socket?.connected || false;
//   }
// }
// Change from socket.io to native WebSocket



class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, SocketCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string, userId: string) {
    this.triggerListeners('connecting', {});
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${SOCKET_URL.replace('http', 'ws')}/api/v1/session/ws/${userId}?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.triggerListeners('connected', {})
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, ...payload } = data;
        this.triggerListeners(type, payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      this.triggerListeners('disconnected', {});
      console.log('WebSocket disconnected');
      this.attemptReconnect(token, userId);
    };
  }

  private attemptReconnect(token: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect(token, userId);
      }, 1000 * this.reconnectAttempts);
    }
  }

  private triggerListeners(event: string, data: any) {
    console.log('Triggering event:', event); // Add this
    const callbacks = this.listeners.get(event) || [];
    console.log('Callbacks found:', callbacks.length); // Add this
    callbacks.forEach(callback => callback(data));
  }
  on(event: string, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: SocketCallback) {
    if (callback && this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: event, ...data }));
    } else {
      console.warn('Socket not connected, unable to emit event:', event);
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.listeners.clear();
  }
}

export default new WebSocketService();