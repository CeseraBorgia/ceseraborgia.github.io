import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { TikTokLiveConnection } from 'tiktok-live-connector';

const PORT = process.env.PORT || 8080;
let tiktokUsername = process.env.TIKTOK_USERNAME || 'avokadobey';

let tiktokConnection = null;
let isTikTokConnected = false;
let reconnectTimeout = null;

// HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health and Status check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      tiktokUsername,
      isTikTokConnected,
      webSocketClients: wss.clients.size
    }));
    return;
  }

  // Change TikTok Username dynamically: POST /connect
  if (req.method === 'POST' && req.url === '/connect') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.username) {
          tiktokUsername = parsed.username.replace('@', '').trim();
          connectToTikTok(tiktokUsername);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, target: tiktokUsername }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Username required' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Manual event injector: POST /event
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

// WebSocket Server for Overlay / OBS
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
  console.log(`[WebSocket] Browser Overlay connected. Total clients: ${wss.clients.size}`);

  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Lunar Rave TikTok Bridge',
    tiktokUsername,
    isTikTokConnected
  }));

  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected. Total clients: ${wss.clients.size}`);
  });
});

// Determine Gift Tier (Small, Medium, Big)
function classifyGiftTier(diamondCount, giftName = '') {
  const name = giftName.toLowerCase();
  if (
    diamondCount >= 500 ||
    name.includes('galaxy') ||
    name.includes('galaksi') ||
    name.includes('universe') ||
    name.includes('evren') ||
    name.includes('leon') ||
    name.includes('whale') ||
    name.includes('falcon')
  ) {
    return 'big';
  }

  if (
    diamondCount >= 30 ||
    name.includes('corgi') ||
    name.includes('donut') ||
    name.includes('rocket') ||
    name.includes('gun') ||
    name.includes('perfume') ||
    name.includes('kalp')
  ) {
    return 'medium';
  }

  return 'small';
}

// Connect to TikTok LIVE
function connectToTikTok(username) {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const cleanUser = username.replace('@', '').trim();
  console.log(`\n📡 Connecting to TikTok LIVE: @${cleanUser}...`);

  try {
    tiktokConnection = new TikTokLiveConnection(cleanUser, {
      processInitialData: false,
      enableExtendedGiftInfo: true,
      enableWebsocketUpgrade: true,
      requestPollingIntervalMs: 1000
    });

    tiktokConnection.connect().then(state => {
      isTikTokConnected = true;
      console.log(`✅ [TikTok LIVE CONNECTED] Room ID: ${state.roomId} (@${cleanUser})`);
      broadcast({
        type: 'tiktok_status',
        connected: true,
        username: cleanUser,
        roomId: state.roomId
      });
    }).catch(err => {
      isTikTokConnected = false;
      console.log(`⚠️ [TikTok Offline/Waiting] @${cleanUser} is currently offline or stream not found.`);
      console.log(`   (Waiting for stream to go live. Auto-retrying in 15 seconds...)`);

      broadcast({
        type: 'tiktok_status',
        connected: false,
        username: cleanUser,
        error: 'Stream offline'
      });

      // Retry every 15 seconds
      reconnectTimeout = setTimeout(() => {
        connectToTikTok(cleanUser);
      }, 15000);
    });

    // 1. Comments / Chat
    tiktokConnection.on('chat', data => {
      console.log(`💬 [@${data.uniqueId}]: ${data.comment}`);
      broadcast({
        type: 'comment',
        data: {
          id: data.msgId || String(Date.now()),
          userId: data.userId || data.uniqueId,
          username: data.uniqueId,
          comment: data.comment,
          timestamp: Date.now()
        }
      });
    });

    // 2. Gifts
    tiktokConnection.on('gift', data => {
      // Ignore repeat streaks until complete or batch
      const tier = classifyGiftTier(data.diamondCount, data.giftName);
      console.log(`🎁 [@${data.uniqueId}] sent ${data.giftName} x${data.repeatCount} (${data.diamondCount} diamonds, Tier: ${tier})`);

      broadcast({
        type: 'gift',
        data: {
          id: data.msgId || String(Date.now()),
          userId: data.userId || data.uniqueId,
          username: data.uniqueId,
          giftName: data.giftName,
          giftTier: tier,
          giftCount: data.repeatCount || 1,
          diamonds: data.diamondCount || 1,
          timestamp: Date.now()
        }
      });
    });

    // 3. New Followers (Leap to mid-tier)
    tiktokConnection.on('follow', data => {
      console.log(`🚀 [@${data.uniqueId}] followed the stream!`);
      broadcast({
        type: 'follow',
        data: {
          id: data.msgId || String(Date.now()),
          userId: data.userId || data.uniqueId,
          username: data.uniqueId,
          timestamp: Date.now()
        }
      });
    });

    // 4. Likes
    tiktokConnection.on('like', data => {
      broadcast({
        type: 'like',
        data: {
          id: String(Date.now()),
          userId: data.userId || data.uniqueId,
          username: data.uniqueId,
          likeCount: data.likeCount || 1,
          timestamp: Date.now()
        }
      });
    });

    // 5. Viewer Joins (Back-tier crowd spawn)
    tiktokConnection.on('member', data => {
      broadcast({
        type: 'join',
        data: {
          id: data.msgId || String(Date.now()),
          userId: data.userId || data.uniqueId,
          username: data.uniqueId,
          timestamp: Date.now()
        }
      });
    });

    tiktokConnection.on('streamEnd', () => {
      console.log(`🛑 TikTok Stream ended.`);
      isTikTokConnected = false;
      broadcast({ type: 'tiktok_status', connected: false, username: cleanUser });
      reconnectTimeout = setTimeout(() => connectToTikTok(cleanUser), 15000);
    });

    tiktokConnection.on('error', err => {
      console.error(`⚠️ TikTok Connection error:`, err?.message || err);
    });

  } catch (err) {
    console.error('Failed to initialize TikTok connection:', err);
  }
}

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌕 TikTok LIVE Lunar Rave Server`);
  console.log(`🎯 Target TikTok Account: @${tiktokUsername}`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🔗 HTTP Webhook:  http://localhost:${PORT}/event`);
  console.log(`===============================================`);

  // Initial connection attempt
  connectToTikTok(tiktokUsername);
});
