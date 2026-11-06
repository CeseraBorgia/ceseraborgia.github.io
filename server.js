import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'TikTok Lunar Rave Bridge', clients: wss.clients.size }));
    return;
  }

  // Allow external webhook or connector to POST events
  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        broadcast(event);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, broadcastTo: wss.clients.size }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// WebSocket Server
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  console.log(`[WebSocket] New client connected. Total clients: ${wss.clients.size}`);

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to Lunar Rave TikTok LIVE Bridge'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Re-broadcast received message to all clients
      broadcast(data);
    } catch (err) {
      console.error('[WebSocket] Invalid JSON message received:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected. Total clients: ${wss.clients.size}`);
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌕 TikTok LIVE Lunar Rave Server`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🔗 HTTP Webhook:  http://localhost:${PORT}/event`);
  console.log(`===============================================`);
});
