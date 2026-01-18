const WebSocket = require("ws");
const http = require("http");

const PORT = 8081;

// Create HTTP server (required for Cloudflare)
const server = http.createServer();

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

server.listen(PORT, () => {
  console.log(`🟢 WebSocket server running on ws://localhost:${PORT}`);
});

let deviceClient = null;
const dashboards = new Set();

wss.on("connection", (ws) => {
  console.log("🔌 New client connected");

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      return;
    }

    // Identify client
    if (data.type === "client-type") {
      ws.clientType = data.payload;

      if (ws.clientType === "device") {
        if (deviceClient) deviceClient.close();
        deviceClient = ws;
        console.log("📱 Device connected");

        dashboards.forEach((d) =>
          d.send(
            JSON.stringify({
              type: "connection-status",
              payload: { deviceConnected: true },
            }),
          ),
        );
      }

      if (ws.clientType === "dashboard") {
        dashboards.add(ws);
        console.log("🖥️ Dashboard connected");

        ws.send(
          JSON.stringify({
            type: "connection-status",
            payload: { deviceConnected: !!deviceClient },
          }),
        );
      }
    }

    // Forward device data to dashboards
    if (data.type === "device-data" && ws === deviceClient) {
      dashboards.forEach((d) =>
        d.send(
          JSON.stringify({
            type: "drone-update",
            payload: {
              id: "PROXY-DRONE-01",
              ...data.payload,
              online: true,
            },
          }),
        ),
      );
    }
  });

  ws.on("close", () => {
    dashboards.delete(ws);

    if (ws === deviceClient) {
      deviceClient = null;
      console.log("📴 Device disconnected");

      dashboards.forEach((d) =>
        d.send(
          JSON.stringify({
            type: "connection-status",
            payload: { deviceConnected: false },
          }),
        ),
      );
    }
  });
});
