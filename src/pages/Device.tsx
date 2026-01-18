import React, { useState, useEffect, useRef } from "react";
import { Smartphone, Wifi, WifiOff, Battery } from "lucide-react";
import { Button } from "@/components/ui/button";

const Device: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const positionRef = useRef({ x: 400, y: 300 });
  const headingRef = useRef(0);
  const lastOrientationRef = useRef<any>(null);

  // -----------------------------------------
  //  FIXED: ALWAYS USE TUNNEL WS URL
  // -----------------------------------------
  const WS_URL = import.meta.env.VITE_WS_URL;

  useEffect(() => {
    const connect = () => {
      console.log("📱 Device connecting ->", WS_URL);

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("📱 Device connected");
        setConnected(true);

        ws.send(
          JSON.stringify({
            type: "client-type",
            payload: "device",
          }),
        );
      };

      ws.onclose = () => {
        console.log("📱 Device disconnected, retrying...");
        setConnected(false);
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => console.log("❌ WS error:", err);
    };

    connect();
    return () => wsRef.current?.close();
  }, [WS_URL]);

  // -----------------------------------------
  // Battery API
  // -----------------------------------------
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        setBatteryLevel(Math.round(b.level * 100));

        b.addEventListener("levelchange", () =>
          setBatteryLevel(Math.round(b.level * 100)),
        );
      });
    }
  }, []);

  // -----------------------------------------
  // Permission request
  // -----------------------------------------
  const requestPermissions = async () => {
    if ((DeviceOrientationEvent as any).requestPermission) {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res !== "granted") {
        alert("Permission denied");
        return;
      }
    }
    setPermissionGranted(true);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("devicemotion", handleMotion);
  };

  // Orientation updates heading
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!event.alpha || !event.beta || !event.gamma) return;

    if (lastOrientationRef.current) {
      const delta = event.alpha - lastOrientationRef.current.alpha;
      if (Math.abs(delta) > 5) {
        headingRef.current = (headingRef.current + delta + 360) % 360;
      }
    }

    lastOrientationRef.current = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    };
  };

  // Motion updates position
  const handleMotion = () => {
    const beta = lastOrientationRef.current?.beta ?? 0;
    const gamma = lastOrientationRef.current?.gamma ?? 0;

    positionRef.current = {
      x: Math.max(20, Math.min(780, positionRef.current.x + gamma / 45)),
      y: Math.max(20, Math.min(580, positionRef.current.y - beta / 45)),
    };
  };

  // -----------------------------------------
  // Send device data → WS @ 10Hz
  // -----------------------------------------
  useEffect(() => {
    if (!connected || !permissionGranted) return;

    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "device-data",
            payload: {
              position: positionRef.current,
              heading: headingRef.current,
              battery: batteryLevel,
            },
          }),
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [connected, permissionGranted, batteryLevel]);

  // -----------------------------------------
  // UI (your OLD UI)
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="w-8 h-8 text-primary" />
            <h1 className="font-tactical text-2xl text-primary tracking-wider">
              PROXY DRONE
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Live Device Controller
          </p>
        </div>

        <div
          className={`tactical-panel p-6 border-2 ${
            connected ? "border-tactical-green" : "border-tactical-red"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-tactical text-sm">CONNECTION</span>
            {connected ? (
              <Wifi className="w-5 h-5 text-tactical-green" />
            ) : (
              <WifiOff className="w-5 h-5 text-tactical-red" />
            )}
          </div>
          <div
            className={`text-2xl font-tactical ${
              connected ? "text-tactical-green" : "text-tactical-red"
            }`}
          >
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </div>

        <div className="tactical-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-tactical text-sm">BATTERY</span>
            <Battery className="w-5 h-5" />
          </div>

          <div className="text-2xl font-tactical">
            {batteryLevel === null ? "UNKNOWN" : `${batteryLevel}%`}
          </div>
        </div>

        {!permissionGranted && (
          <Button
            onClick={requestPermissions}
            className="w-full h-16 text-lg font-tactical"
          >
            REQUEST PERMISSIONS
          </Button>
        )}
      </div>
    </div>
  );
};

export default Device;
