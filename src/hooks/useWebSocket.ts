import { useEffect, useRef, useState, useCallback } from "react";

export interface LiveDroneData {
  id: string;
  position?: { x: number; y: number };
  heading?: number;
  battery?: number | null;
  online: boolean;
}

export const useWebSocket = (onDroneUpdate: (data: LiveDroneData) => void) => {
  const [connected, setConnected] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [liveDroneData, setLiveDroneData] = useState<LiveDroneData | null>(
    null,
  );

  const wsRef = useRef<WebSocket | null>(null);

  const WS_URL = import.meta.env.VITE_WS_URL; // FIXED

  const connect = useCallback(() => {
    console.log("🖥 Dashboard connecting →", WS_URL);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🖥 Dashboard connected");
      setConnected(true);

      ws.send(
        JSON.stringify({
          type: "client-type",
          payload: "dashboard",
        }),
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "connection-status") {
        setDeviceConnected(msg.payload.deviceConnected);
      }

      if (msg.type === "drone-update") {
        setLiveDroneData(msg.payload);
        setDeviceConnected(true);
        onDroneUpdate(msg.payload);
      }
    };
    ;
    ws.onclose = () => {
      console.log("🔌 WS closed, reconnecting...");
      setConnected(false);
      setDeviceConnected(false);

      setTimeout(connect, 2000);
    };
  }, [WS_URL, onDroneUpdate]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { connected, deviceConnected, liveDroneData };
};
