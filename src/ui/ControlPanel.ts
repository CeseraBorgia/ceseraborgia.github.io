import { CrowdManager } from '../engine/CrowdManager';
import { ParticleSystem } from '../engine/ParticleSystem';
import { HUD } from '../engine/HUD';
import { soundEngine } from '../engine/AudioEngine';

const TURKISH_PHRASES = [
  'Harika!',
  'Takipteyim! 🚀',
  'TŞK DJ!',
  'Müzik bomba! 🔥',
  'Selamlar Aydan 🌙',
  'Rave başladı! ⚡',
  'Adamsın DJ! 🎧',
  'Hediyeyi kaptın! 💎',
  'Uçuyoruzzz! 🪐',
  'Ses ver Ay! 🔊'
];

const RANDOM_USERNAMES = [
  'efe_türk', 'can_99', 'merve_7', 'aylin_vip', 'cem_galaxy',
  'baris_beat', 'sinem_orbit', 'tolga_dj', 'burak_moon', 'defne_star',
  'serkan_m', 'leyla_sky', 'umut_cosmic', 'selin_pulsar', 'mert_34'
];

export class ControlPanel {
  private containerEl: HTMLElement;
  private crowd: CrowdManager;
  private particles: ParticleSystem;
  private hud: HUD;

  private isAutoSimulating: boolean = false;
  private autoSimInterval: number | null = null;
  private isAudioPlaying: boolean = false;
  private isCollapsed: boolean = false;

  constructor(crowd: CrowdManager, particles: ParticleSystem, hud: HUD) {
    this.crowd = crowd;
    this.particles = particles;
    this.hud = hud;

    this.containerEl = document.createElement('div');
    this.containerEl.id = 'simulation-controls';
    this.render();
    document.body.appendChild(this.containerEl);

    // Keyboard shortcut 'H' to toggle panel
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'h' && (e.target as HTMLElement).tagName !== 'INPUT') {
        this.toggleCollapse();
      }
    });
  }

  private toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const bodyEl = this.containerEl.querySelector('.panel-body') as HTMLElement;
    const toggleBtn = this.containerEl.querySelector('.btn-toggle-panel') as HTMLElement;
    if (bodyEl && toggleBtn) {
      bodyEl.style.display = this.isCollapsed ? 'none' : 'block';
      toggleBtn.innerText = this.isCollapsed ? '▶ Show Controls [H]' : '▼ Hide Controls [H]';
    }
  }

  private getRandomUser(): string {
    return RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
  }

  private getRandomPhrase(): string {
    return TURKISH_PHRASES[Math.floor(Math.random() * TURKISH_PHRASES.length)];
  }

  public render() {
    this.containerEl.innerHTML = `
      <div class="rave-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="pulse-dot"></span>
            <span>LUNAR RAVE SIMULATOR</span>
          </div>
          <button class="btn-toggle-panel">▼ Hide Controls [H]</button>
        </div>

        <div class="panel-body">
          <div class="control-section">
            <div class="section-label">⚡ QUICK SIMULATION</div>
            <div class="btn-grid">
              <button id="btn-auto-sim" class="btn btn-primary">⚡ Start Auto-Sim</button>
              <button id="btn-audio-toggle" class="btn btn-audio">🎵 Sound: OFF</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">👥 CROWD & LANES (TIER SYSTEM)</div>
            <div class="btn-grid">
              <button id="btn-spawn-viewer" class="btn">👤 Join (Back Row)</button>
              <button id="btn-follower-leap" class="btn btn-cyan">🚀 Follow (Leap to Mid)</button>
              <button id="btn-like" class="btn btn-pink">❤️ Like Stream</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">🎁 GIFTS (FRONT VIP PROMOTION)</div>
            <div class="btn-grid">
              <button id="btn-gift-small" class="btn btn-gift-small">🌹 Rose (Small)</button>
              <button id="btn-gift-mid" class="btn btn-gift-mid">🚀 Rocket (Mid)</button>
              <button id="btn-gift-big" class="btn btn-gift-big">🪐 Galaxy Supernova (VIP)</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">💬 TURKISH COMMENTS & SPEECH BUBBLE</div>
            <div class="comment-input-row">
              <input type="text" id="input-comment" placeholder="Yorum yaz (örn: Takipteyim! 🚀)" value="Takipteyim! 🚀" />
              <button id="btn-send-comment" class="btn btn-comment">Gönder</button>
            </div>
            <div class="quick-phrase-tags">
              <span class="tag-phrase" data-text="Harika! 🎉">Harika!</span>
              <span class="tag-phrase" data-text="TŞK DJ! 🎧">TŞK DJ!</span>
              <span class="tag-phrase" data-text="Müzik bomba! 🔥">Müzik bomba!</span>
              <span class="tag-phrase" data-text="Uçuyoruzzz! 🪐">Uçuyoruzzz!</span>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">⚡ SPECIAL EVENTS</div>
            <div class="btn-grid">
              <button id="btn-super-rave" class="btn btn-gold">💥 Trigger 100% Super Rave</button>
              <button id="btn-obs-mode" class="btn btn-obs">📺 OBS Mode (Clean Canvas)</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Toggle button
    this.containerEl.querySelector('.btn-toggle-panel')?.addEventListener('click', () => {
      this.toggleCollapse();
    });

    // Auto Sim
    const autoSimBtn = this.containerEl.querySelector('#btn-auto-sim') as HTMLButtonElement;
    autoSimBtn?.addEventListener('click', () => {
      this.isAutoSimulating = !this.isAutoSimulating;
      if (this.isAutoSimulating) {
        autoSimBtn.innerText = '⏹ Stop Auto-Sim';
        autoSimBtn.classList.add('active');
        this.startAutoSimulation();
      } else {
        autoSimBtn.innerText = '⚡ Start Auto-Sim';
        autoSimBtn.classList.remove('active');
        this.stopAutoSimulation();
      }
    });

    // Audio Toggle
    const audioBtn = this.containerEl.querySelector('#btn-audio-toggle') as HTMLButtonElement;
    audioBtn?.addEventListener('click', () => {
      const isPlaying = soundEngine.toggle();
      this.isAudioPlaying = isPlaying;
      audioBtn.innerText = isPlaying ? '🔊 Sound: ON' : '🎵 Sound: OFF';
      audioBtn.classList.toggle('active', isPlaying);
    });

    // Spawn Viewer
    this.containerEl.querySelector('#btn-spawn-viewer')?.addEventListener('click', () => {
      const u = `user_${Math.floor(100 + Math.random() * 899)}`;
      this.crowd.handleJoin(u);
      this.hud.addPartyScore(1);
    });

    // Follower Leap
    this.containerEl.querySelector('#btn-follower-leap')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleFollow(u);
      this.hud.addPartyScore(4);
    });

    // Like
    this.containerEl.querySelector('#btn-like')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleLike(u, this.particles);
      this.hud.addPartyScore(2);
    });

    // Small Gift
    this.containerEl.querySelector('#btn-gift-small')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Rose', 'small', this.particles);
      this.hud.addPartyScore(5);
    });

    // Medium Gift
    this.containerEl.querySelector('#btn-gift-mid')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Rocket', 'medium', this.particles);
      this.hud.addPartyScore(15);
    });

    // Big Gift (Galaxy Supernova + Celestial Laser)
    this.containerEl.querySelector('#btn-gift-big')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Galaxy Rave', 'big', this.particles);
      this.hud.addPartyScore(30);
    });

    // Comment
    const commentInput = this.containerEl.querySelector('#input-comment') as HTMLInputElement;
    const sendComment = () => {
      const text = commentInput?.value.trim();
      if (text) {
        const u = this.getRandomUser();
        this.crowd.handleComment(u, text);
        this.hud.addPartyScore(3);
      }
    };

    this.containerEl.querySelector('#btn-send-comment')?.addEventListener('click', sendComment);
    commentInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendComment();
    });

    // Quick phrases
    this.containerEl.querySelectorAll('.tag-phrase').forEach((el) => {
      el.addEventListener('click', () => {
        const text = (el as HTMLElement).getAttribute('data-text') || '';
        if (text && commentInput) {
          commentInput.value = text;
          sendComment();
        }
      });
    });

    // Super Rave
    this.containerEl.querySelector('#btn-super-rave')?.addEventListener('click', () => {
      this.hud.addPartyScore(100);
      soundEngine.playGiftSFX('big');
      this.particles.triggerBigGift(540, 1200, 0xff00bb);
    });

    // OBS Mode
    this.containerEl.querySelector('#btn-obs-mode')?.addEventListener('click', () => {
      this.containerEl.style.display = 'none';
      const hint = document.createElement('div');
      hint.id = 'obs-hint';
      hint.innerText = 'OBS Clean Mode Active. Press [H] to restore controls.';
      document.body.appendChild(hint);

      const restore = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'h') {
          this.containerEl.style.display = 'block';
          hint.remove();
          window.removeEventListener('keydown', restore);
        }
      };
      window.addEventListener('keydown', restore);
    });
  }

  private startAutoSimulation() {
    if (this.autoSimInterval !== null) return;

    this.autoSimInterval = window.setInterval(() => {
      const rand = Math.random();
      const user = this.getRandomUser();

      if (rand < 0.35) {
        // Likes
        this.crowd.handleLike(user, this.particles);
        this.hud.addPartyScore(1);
      } else if (rand < 0.60) {
        // Comment
        const phrase = this.getRandomPhrase();
        this.crowd.handleComment(user, phrase);
        this.hud.addPartyScore(2);
      } else if (rand < 0.80) {
        // Follower Leap
        this.crowd.handleFollow(user);
        this.hud.addPartyScore(4);
      } else if (rand < 0.93) {
        // Small/Mid Gift
        this.crowd.handleGift(user, 'Neon Rose', 'small', this.particles);
        this.hud.addPartyScore(6);
      } else {
        // Big Gift!
        this.crowd.handleGift(user, 'Galaxy Supernova', 'big', this.particles);
        this.hud.addPartyScore(25);
      }
    }, 2200);
  }

  private stopAutoSimulation() {
    if (this.autoSimInterval !== null) {
      clearInterval(this.autoSimInterval);
      this.autoSimInterval = null;
    }
  }
}
