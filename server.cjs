const WebSocket = require('ws');

const PORT = process.env.WS_PORT || 8090;
const wss = new WebSocket.Server({ port: PORT });

// Track connected clients
let deviceClient = null; // Only ONE device allowed
const dashboardClients = new Set();

// Handle server-level errors (EADDRINUSE, etc.)
wss.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${PORT} is already in use. WebSocket server already running. Exiting gracefully.`);
        process.exit(0);
    } else {
        console.error('WebSocket server error:', err);
        throw err;
    }
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Handle client identification
            if (data.type === 'client-type') {
                if (data.payload === 'device') {
                    // Single device enforcement: replace previous device if exists
                    if (deviceClient && deviceClient !== ws) {
                        console.log('Replacing previous device connection');
                        deviceClient.close();
                    }
                    deviceClient = ws;
                    ws.clientType = 'device';
                    console.log('Device connected');

                    // Notify all dashboards that device is connected
                    broadcastToDashboards({
                        type: 'connection-status',
                        payload: { deviceConnected: true }
                    });
                } else if (data.payload === 'dashboard') {
                    dashboardClients.add(ws);
                    ws.clientType = 'dashboard';
                    console.log('Dashboard connected');

                    // Send current device connection status
                    ws.send(JSON.stringify({
                        type: 'connection-status',
                        payload: { deviceConnected: deviceClient !== null }
                    }));
                }
            }

            // Handle device sensor data
            if (data.type === 'device-data' && ws.clientType === 'device') {
                // Convert sensor data to drone state and broadcast to dashboards
                const droneUpdate = {
                    type: 'drone-update',
                    payload: {
                        id: 'PROXY-DRONE-01',
                        position: data.payload.position,
                        heading: data.payload.heading,
                        battery: data.payload.battery, // null if unavailable
                        online: true
                    }
                };

                broadcastToDashboards(droneUpdate);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');

        if (ws.clientType === 'device' && ws === deviceClient) {
            deviceClient = null;
            console.log('Device disconnected');

            // Notify all dashboards that device is disconnected
            broadcastToDashboards({
                type: 'connection-status',
                payload: { deviceConnected: false }
            });

            // Send offline status for proxy drone
            broadcastToDashboards({
                type: 'drone-update',
                payload: {
                    id: 'PROXY-DRONE-01',
                    online: false
                }
            });
        } else if (ws.clientType === 'dashboard') {
            dashboardClients.delete(ws);
            console.log('Dashboard disconnected');
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcastToDashboards(message) {
    const messageStr = JSON.stringify(message);
    dashboardClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nShutting down WebSocket server...');
    wss.close(() => {
        console.log('WebSocket server closed');
        process.exit(0);
    });
});
