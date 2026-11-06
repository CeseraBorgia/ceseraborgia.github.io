import './style.css';
import { Application } from 'pixi.js';
import { Environment } from './engine/Environment';
import { CrowdManager } from './engine/CrowdManager';
import { DJBooth } from './engine/DJBooth';
import { ParticleSystem } from './engine/ParticleSystem';
import { HUD } from './engine/HUD';
import { soundEngine } from './engine/AudioEngine';
import { ControlPanel } from './ui/ControlPanel';
import { WebSocketClient } from './engine/WebSocketClient';
import { TikTokEvent } from './types';

async function bootstrap() {
  console.log('[LunarRave] Bootstrapping TikTok LIVE Interactive Lunar Rave...');

  // 1. Initialize PixiJS Application (Exact 1080x1920 vertical canvas)
  const app = new Application();
  await app.init({
    width: 1080,
    height: 1920,
    resolution: 1,
    autoDensity: false,
    backgroundColor: 0x03020c,
    antialias: true
  });

  const appContainer = document.getElementById('canvas-container');
  if (appContainer) {
    appContainer.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

  // Pixel-perfect auto scaler for any window size
  function fitScreen() {
    const wrapper = document.getElementById('app-wrapper');
    if (!wrapper) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Exact 1080x1920 in TikTok LIVE Studio or OBS
    if (Math.abs(winW - 1080) < 4 && Math.abs(winH - 1920) < 4) {
      wrapper.style.transform = 'none';
      return;
    }

    // Auto fit proportionally without distortion or blur
    const scale = Math.min(winW / 1080, winH / 1920);
    wrapper.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', fitScreen);
  fitScreen();

  // 2. Instantiate Systems
  const environment = new Environment();
  const crowd = new CrowdManager();
  const particles = new ParticleSystem();
  const djBooth = new DJBooth();
  const hud = new HUD();

  // 3. Layer Hierarchy (Foreground to Background)
  app.stage.addChild(environment.container);
  app.stage.addChild(crowd.container);
  app.stage.addChild(particles.container);
  app.stage.addChild(djBooth.container);
  app.stage.addChild(hud.container);

  // 4. Initialize initial crowd (24 back lurkers, 4 followers, 3 VIPs)
  crowd.initCrowd();

  // 5. Initialize Simulation Control Panel (Yalnızca yerel testte veya ?sim=1 girilirse açılır)
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlParams = new URLSearchParams(window.location.search);
  const showSim = urlParams.has('sim') || urlParams.has('debug') || urlParams.has('test');

  if (showSim || (isLocal && !urlParams.has('clean'))) {
    new ControlPanel(crowd, particles, hud);
  }

  // 6. Initialize WebSocket Client for TikTok LIVE Bridge
  const wsClient = new WebSocketClient('ws://localhost:8080');
  wsClient.setCallbacks(
    (event: TikTokEvent) => {
      handleLiveEvent(event);
    },
    (isConnected: boolean) => {
      hud.setMode(isConnected);
    }
  );
  wsClient.connect();

  function handleLiveEvent(event: any) {
    if (event.type === 'tiktok_status') {
      hud.setMode(event.connected, event.username);
      return;
    }
    if (event.type === 'connected') {
      hud.setMode(event.isTikTokConnected, event.tiktokUsername);
      return;
    }
    if (event.type === 'join') {
      crowd.handleJoin(event.data.username);
      hud.addPartyScore(1);
    } else if (event.type === 'follow') {
      crowd.handleFollow(event.data.username);
      hud.addPartyScore(4);
    } else if (event.type === 'like') {
      crowd.handleLike(event.data.username, particles);
      hud.addPartyScore(2);
    } else if (event.type === 'comment') {
      crowd.handleComment(event.data.username, event.data.comment);
      hud.addPartyScore(3);
    } else if (event.type === 'gift') {
      crowd.handleGift(
        event.data.username,
        event.data.giftName,
        event.data.giftTier,
        particles
      );
      const score = event.data.giftTier === 'big' ? 30 : event.data.giftTier === 'medium' ? 15 : 6;
      hud.addPartyScore(score);
    }
  }

  // 7. Main Game Loop (60 FPS WebGL Ticker)
  let elapsedTime = 0;

  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime / 60; // seconds
    elapsedTime += dt;

    // Update Sound & Audio Reactivity
    soundEngine.update(dt);
    const kick = soundEngine.kickIntensity;
    const beatPhase = soundEngine.beatPhase;

    // Update Environment (Cosmos, rotating Earth, moon dust, lasers)
    environment.update(dt, kick);

    // Update Crowd & Lanes (Dancing, low-G leaps, speech bubbles)
    crowd.update(dt, elapsedTime, kick, particles);

    // Update Particles & FX (Lasers, shockwaves, stardust, screen shake)
    particles.update(dt);

    // Update DJ Stage & Booth (Pumping speakers, beatpads, DJ back-view dance)
    djBooth.update(dt, kick, beatPhase);

    // Update HUD (Party meter, viewer counter, super rave banner)
    hud.update(dt, kick);

    // Screen Shake Offset applied to stage
    app.stage.x = particles.shakeOffsetX;
    app.stage.y = particles.shakeOffsetY;
  });

  console.log('[LunarRave] Ready for TikTok LIVE!');
}

window.addEventListener('DOMContentLoaded', bootstrap);
