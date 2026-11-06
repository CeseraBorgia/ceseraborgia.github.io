import { TikTokEvent } from '../types';

export type EventCallback = (event: TikTokEvent) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onEventCallback: EventCallback | null = null;
  private onConnectionChange: ((isConnected: boolean) => void) | null = null;
  private reconnectTimer: number | null = null;
  private isConnected: boolean = false;

  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }

  public setCallbacks(
    onEvent: EventCallback,
    onConnChange?: (isConnected: boolean) => void
  ) {
    this.onEventCallback = onEvent;
    this.onConnectionChange = onConnChange || null;
  }

  public connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocketClient] Connected to TikTok LIVE Bridge');
        this.isConnected = true;
        this.onConnectionChange?.(true);
      };

      this.ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data) as TikTokEvent;
          this.onEventCallback?.(parsed);
        } catch (err) {
          console.error('[WebSocketClient] Error parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        if (this.isConnected) {
          console.log('[WebSocketClient] Disconnected from server. Retrying...');
        }
        this.isConnected = false;
        this.onConnectionChange?.(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}
