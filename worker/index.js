export default {
  fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    server.addEventListener("message", (event) => {
      server.send(`MSG: ${event.data}`);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
