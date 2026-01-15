import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Wifi, WifiOff, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Device: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const positionRef = useRef({ x: 400, y: 300 }); // Start at center
    const headingRef = useRef(0);
    const lastOrientationRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);

    // WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            const ws = new WebSocket('wss://revolution-super-commentary-kinds.trycloudflare.com');

            ws.onopen = () => {
                console.log('Connected to server');
                setConnected(true);
                // Identify as device
                ws.send(JSON.stringify({ type: 'client-type', payload: 'device' }));
            };

            ws.onclose = () => {
                console.log('Disconnected from server');
                setConnected(false);
                // Simple reconnect after 2 seconds
                setTimeout(connectWebSocket, 2000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Battery API
    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(Math.round(battery.level * 100));

                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                });
            }).catch(() => {
                console.log('Battery API unavailable');
                setBatteryLevel(null);
            });
        } else {
            console.log('Battery API not supported');
            setBatteryLevel(null);
        }
    }, []);

    // Request sensor permissions
    const requestPermissions = async () => {
        try {
            // iOS 13+ requires user gesture to request permission
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    setPermissionGranted(true);
                    startSensorTracking();
                }
            } else {
                // Android or older iOS
                setPermissionGranted(true);
                startSensorTracking();
            }
        } catch (error) {
            console.error('Permission denied:', error);
            alert('Sensor permissions denied. Please enable in browser settings.');
        }
    };

    const startSensorTracking = () => {
        // Device orientation for heading (relative changes only)
        window.addEventListener('deviceorientation', handleOrientation);

        // Device motion for position (tilt-based movement)
        window.addEventListener('devicemotion', handleMotion);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
        if (!event.alpha || !event.beta || !event.gamma) return;

        const current = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma
        };

        // Use relative orientation changes with minimum threshold
        if (lastOrientationRef.current) {
            const deltaAlpha = current.alpha - lastOrientationRef.current.alpha;

            // Apply minimum change threshold to prevent jitter (5 degrees)
            if (Math.abs(deltaAlpha) > 5) {
                headingRef.current = (headingRef.current + deltaAlpha) % 360;
                if (headingRef.current < 0) headingRef.current += 360;
            }
        }

        lastOrientationRef.current = current;
    };

    const handleMotion = (event: DeviceMotionEvent) => {
        if (!event.accelerationIncludingGravity) return;

        const { x, y } = event.accelerationIncludingGravity;
        if (x === null || y === null) return;

        // Map phone tilt to movement direction (clear cause-effect)
        // Tilt forward (beta < 0) = move up, tilt back = move down
        // Tilt left (gamma < 0) = move left, tilt right = move right

        const beta = lastOrientationRef.current?.beta || 0;
        const gamma = lastOrientationRef.current?.gamma || 0;

        // Movement speed based on tilt angle (simple linear mapping)
        const moveSpeed = 2;
        let dx = 0;
        let dy = 0;

        // Horizontal movement (gamma: -90 to 90)
        if (Math.abs(gamma) > 10) { // 10 degree threshold
            dx = (gamma / 90) * moveSpeed;
        }

        // Vertical movement (beta: -180 to 180, but use -90 to 90 range)
        const normalizedBeta = beta > 90 ? beta - 180 : beta;
        if (Math.abs(normalizedBeta) > 10) { // 10 degree threshold
            dy = -(normalizedBeta / 90) * moveSpeed; // Negative because screen Y is inverted
        }

        // Update position with clamping to map bounds
        positionRef.current = {
            x: Math.max(20, Math.min(780, positionRef.current.x + dx)),
            y: Math.max(20, Math.min(580, positionRef.current.y + dy))
        };
    };

    // Send sensor data to server at 10Hz
    useEffect(() => {
        if (!connected || !permissionGranted) return;

        const interval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'device-data',
                    payload: {
                        position: positionRef.current,
                        heading: headingRef.current,
                        battery: batteryLevel
                    }
                }));
            }
        }, 100); // 10Hz

        return () => clearInterval(interval);
    }, [connected, permissionGranted, batteryLevel]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                {/* Header */}
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

                {/* Connection Status */}
                <div className={`tactical-panel p-6 border-2 ${connected ? 'border-tactical-green' : 'border-tactical-red'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-tactical text-sm">CONNECTION</span>
                        {connected ? (
                            <Wifi className="w-5 h-5 text-tactical-green" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-tactical-red" />
                        )}
                    </div>
                    <div className={`text-2xl font-tactical ${connected ? 'text-tactical-green' : 'text-tactical-red'
                        }`}>
                        {connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </div>
                </div>

                {/* Battery Status */}
                <div className="tactical-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-tactical text-sm">BATTERY</span>
                        <Battery className={`w-5 h-5 ${batteryLevel === null ? 'text-muted-foreground' :
                            batteryLevel < 20 ? 'text-tactical-red' :
                                batteryLevel < 50 ? 'text-tactical-amber' :
                                    'text-tactical-green'
                            }`} />
                    </div>
                    <div className={`text-2xl font-tactical ${batteryLevel === null ? 'text-muted-foreground' :
                        batteryLevel < 20 ? 'text-tactical-red' :
                            batteryLevel < 50 ? 'text-tactical-amber' :
                                'text-tactical-green'
                        }`}>
                        {batteryLevel === null ? 'UNKNOWN' : `${batteryLevel}%`}
                    </div>
                </div>

                {/* Permission Request */}
                {!permissionGranted && (
                    <Button
                        onClick={requestPermissions}
                        className="w-full h-16 text-lg font-tactical"
                        size="lg"
                    >
                        REQUEST PERMISSIONS
                    </Button>
                )}

                {/* Instructions */}
                {permissionGranted && (
                    <div className="tactical-panel p-4 text-xs text-muted-foreground space-y-2">
                        <div className="font-tactical text-primary mb-2">INSTRUCTIONS</div>
                        <div>• Tilt phone to move drone</div>
                        <div>• Rotate phone to change heading</div>
                        <div>• Keep this page open</div>
                        <div>• Battery updates automatically</div>
                    </div>
                )}

                {/* Status Indicator */}
                {permissionGranted && connected && (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tactical-green/20 border border-tactical-green">
                            <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
                            <span className="text-xs font-tactical text-tactical-green">
                                STREAMING ACTIVE
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Device;
