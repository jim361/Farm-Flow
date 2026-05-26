import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = 'ws://localhost:8080/ws/websocket';

export function useWebSocket<T>(
  topic: string,
  onMessage: (data: T) => void,
  enabled: boolean = true
) {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(topic, (msg) => {
          try {
            const data = JSON.parse(msg.body) as T;
            onMessage(data);
          } catch {
            // 파싱 실패 무시
          }
        });
      },
      onStompError: () => {
        // 백엔드 미연결 시 조용히 실패
      },
    });

    client.activate();
    clientRef.current = client;
  }, [topic, onMessage, enabled]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);
}
