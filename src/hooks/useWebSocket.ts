import { useEffect, useRef, useState, useCallback } from 'react';

interface LiveDroneData {
    id: string;
    position?: { x: number; y: number };
    heading?: number;
    battery?: number | null;
    online: boolean;
}

interface UseWebSocketReturn {
    connected: boolean;
    deviceConnected: boolean;
    liveDroneData: LiveDroneData | null;
}

export const useWebSocket = (onDroneUpdate: (data: LiveDroneData) => void): UseWebSocketReturn => {
    const [connected, setConnected] = useState(false);
    const [deviceConnected, setDeviceConnected] = useState(false);
    const [liveDroneData, setLiveDroneData] = useState<LiveDroneData | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket('wss://revolution-super-commentary-kinds.trycloudflare.com');

            ws.onopen = () => {
                console.log('Dashboard connected to WebSocket server');
                setConnected(true);
                // Identify as dashboard
                ws.send(JSON.stringify({ type: 'client-type', payload: 'dashboard' }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📡 WebSocket message received:', message);

                    if (message.type === 'connection-status') {
                        console.log('🔌 Connection status:', message.payload.deviceConnected);
                        setDeviceConnected(message.payload.deviceConnected);
                    } else if (message.type === 'drone-update') {
                        console.log('🚁 LIVE DRONE UPDATE:', message.payload);
                        console.log('📊 Payload structure:', {
                            id: message.payload.id,
                            position: message.payload.position,
                            heading: message.payload.heading,
                            battery: message.payload.battery,
                            online: message.payload.online
                        });
                        const data = message.payload as LiveDroneData;
                        setLiveDroneData(data);
                        // Set device connected when we receive live data
                        if (data.online) {
                            console.log('✅ Setting deviceConnected = true');
                            setDeviceConnected(true);
                        }
                        console.log('📤 Calling onDroneUpdate callback...');
                        onDroneUpdate(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            ws.onclose = () => {
                console.log('Dashboard disconnected from WebSocket server');
                setConnected(false);
                setDeviceConnected(false);

                // Simple reconnect after 2 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 2000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            // Retry connection
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 2000);
        }
    }, [onDroneUpdate]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { connected, deviceConnected, liveDroneData };
};
