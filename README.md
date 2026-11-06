# 🌕 TikTok LIVE Interactive Lunar Rave (Moon Club)

An interactive, real-time multiplayer lunar rave game designed for TikTok LIVE streams and OBS vertical broadcasting (1080x1920). Viewers on the livestream become animated astronaut partygoers on the surface of the Moon, visually advancing toward the DJ booth and VIP foreground based on their engagement level.

---

## 📸 Visual Concept & Layout
- **Foreground**: Futuristic DJ booth with an animated astronaut DJ seen from behind (facing the crowd), massive pumping subwoofers with audio-reactive neon rings, spinning jog wheels, digital equalizers, and upward cyber spotlights.
- **Midground / Lunar Horizon**: Moon craters, cyberpunk perspective ground grid, metal truss towers with neon signs (`LUNAR RAVE` & `MOON CLUB`), and oscillating stage lasers.
- **Deep Space Background**: Twinkling starfield, glowing cyan/purple nebulae, and a prominent rotating Planet Earth with atmospheric glow.
- **Top HUD**: Live Simulation / TikTok status badge, dynamic glowing `PARTY METER`, and real-time Viewer counter.

---

## 👥 Tiered Crowd Depth & Lane Hierarchy

1. **Back Tier (Normal Viewers / Lurkers)**:
   - Located along the lunar horizon (`y: 690 - 790`).
   - Smaller avatar scale (`~0.42x`).
   - Default arrival zone for all incoming viewers.
   - Slower, rhythmic low-G moon bounce animations.

2. **Middle Tier (Followers)**:
   - Located in the mid-ground dancefloor (`y: 860 - 1040`).
   - Medium avatar scale (`~0.72x`).
   - When a viewer follows, their astronaut performs an energetic low-gravity jetpack leap forward into this tier, displaying their `@username` pill and floating speech bubble.

3. **Front Tier (Gift Senders / VIPs)**:
   - Located right in front of the DJ booth (`y: 1140 - 1320`).
   - Largest avatar scale (`~1.22x`).
   - Highest-energy animations: celebratory rave dance, glowing floor VIP circle, orbiting golden stars, and visor illumination.
   - Persists in the VIP zone with an active timer; smoothly yields space if inactive.

---

## 🪐 Particle & Gift FX System

- **Small Gift (e.g. Rose / Stardust)**:
  - Sparkle ring bursts, stardust trails, floating hearts.
- **Medium Gift (e.g. Rocket / Cosmic Aura)**:
  - Concentric neon ground shockwaves, orbiting energy comets, twin jetpack flame bursts.
- **Big Gift (e.g. Galaxy Supernova / Universe)**:
  - **Space Laser Strike**: Colossal beam of light targeted directly from deep space onto the astronaut with cascading vertical `GIFT` holographic typography.
  - **Supernova Explosion**: 90+ radial stardust sparks exploding across the screen.
  - **Crater Shockwaves & Screen Shake**: Dynamic camera shake with intense floor glow.
- **Party Meter (100% Super Rave)**:
  - Accumulates energy on every interaction; triggers a full-screen **LUNAR SUPER RAVE** with meteor showers, strobe laser beams, and crowd euphoria!

---

## 🎵 Built-In Procedural Rave Synthesizer (Web Audio API)
- No external audio files needed.
- Synthesizes 128 BPM electronic music (four-on-the-floor kick, rolling cyber bassline, crisp hi-hats, cosmic arpeggios, and gift SFX).
- Real-time beat tracking (`kickIntensity`, `beatPhase`) drives the speaker cone pumping, DJ arm dancing, and lighting sweeps.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Frontend and WebSocket Server
```bash
npm start
```
Or run separately:
- **Frontend (Vite)**: `npm run dev` (opens on `http://localhost:5173`)
- **Backend (WebSocket Bridge)**: `npm run server` (runs on `ws://localhost:8080`)

### 3. Open in Browser
Visit [http://localhost:5173](http://localhost:5173).

---

## 🎮 Simulation Control Panel & Hotkeys

A built-in floating cyberpunk dashboard is included for zero-latency testing:
- **[H] Key**: Toggle hide/show control panel (perfect for clean streams).
- **⚡ Start Auto-Sim**: Runs continuous organic TikTok traffic (joins, follows, comments, and gifts).
- **🎵 Sound Toggle**: Starts/stops the synthesized 128 BPM lunar rave audio.
- **🚀 Follow (Leap to Mid)**: Promotes a back-row lurker with a low-G jetpack arc jump forward.
- **🎁 Gifts (Small, Mid, Big)**: Triggers instant front-row VIP teleportation, celestial laser strikes, and supernova effects.
- **💬 Turkish Comments**: Supports Turkish characters (`ç, ğ, ı, ö, ş, ü`) and emojis (`Takipteyim! 🚀`, `TŞK DJ!`, `Harika!`, `Müzik bomba! 🔥`).
- **📺 OBS Mode**: Hides all control interfaces for clean 1080x1920 portrait stream capture.

---

## 📡 TikTok LIVE Studio & OBS Studio Setup

1. In OBS Studio or TikTok LIVE Studio, add a new **Browser Source**.
2. Set URL: `http://localhost:5173`
3. Set Width: `1080`
4. Set Height: `1920`
5. Check **Control audio via OBS** if needed.
6. Press `H` in the browser or click **OBS Mode** to hide simulation controls during broadcasting.
