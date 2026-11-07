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
  private isCollapsed: boolean = true; // Varsayılan olarak kapalı başlar

  constructor(crowd: CrowdManager, particles: ParticleSystem, hud: HUD) {
    this.crowd = crowd;
    this.particles = particles;
    this.hud = hud;

    this.containerEl = document.createElement('div');
    this.containerEl.id = 'simulation-controls';

    // Varsayılan olarak paneli GİZLİ başlat (Yayında asla görünmez)
    // Sadece ?sim=1 veya ?test=1 parametresi varsa veya 'H' tuşuna basılırsa açılır
    const urlParams = new URLSearchParams(window.location.search);
    const shouldShowSim = urlParams.has('sim') || urlParams.has('test') || urlParams.has('panel');

    if (shouldShowSim) {
      document.body.classList.add('show-sim');
    }

    this.render();
    document.body.appendChild(this.containerEl);

    // Klavye kısayolu 'H' ile test panelini aç / kapat
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'h' && (e.target as HTMLElement).tagName !== 'INPUT') {
        document.body.classList.toggle('show-sim');
        const bodyEl = this.containerEl.querySelector('.panel-body') as HTMLElement;
        if (bodyEl) bodyEl.style.display = 'block';
      }
    });
  }

  private toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const bodyEl = this.containerEl.querySelector('.panel-body') as HTMLElement;
    const toggleBtn = this.containerEl.querySelector('.btn-toggle-panel') as HTMLElement;
    if (bodyEl && toggleBtn) {
      bodyEl.style.display = this.isCollapsed ? 'none' : 'block';
      toggleBtn.innerText = this.isCollapsed ? '▶ Aç [H]' : '▼ Kapat [H]';
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
            <span>SIMULATOR</span>
          </div>
          <div class="panel-header-actions">
            <button class="btn-toggle-panel">▶ Aç [H]</button>
            <button class="btn-close-forever" title="Yayında görünmesin (Tamamen Gizle)">✕</button>
          </div>
        </div>

        <div class="panel-body" style="display: none;">
          <div class="clean-url-notice">
            <span>📺 OBS / TikTok LIVE için temiz link:</span>
            <code>?clean=1</code>
          </div>

          <div class="control-section">
            <div class="section-label">⚡ HIZLI TEST</div>
            <div class="btn-grid">
              <button id="btn-auto-sim" class="btn btn-primary">⚡ Test Simülasyonu</button>
              <button id="btn-audio-toggle" class="btn btn-audio">🎵 Müzik: KAPALI</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">👥 4 KATMANLI DANS PİSTİ</div>
            <div class="btn-grid">
              <button id="btn-spawn-viewer" class="btn">👤 Katıl (Tier 1 İzleyici)</button>
              <button id="btn-follower-leap" class="btn btn-cyan">🚀 Takip Et (Tier 2)</button>
              <button id="btn-like" class="btn btn-pink">❤️ Beğen (Tier 3 - 1dk)</button>
              <button id="btn-50-likes" class="btn btn-purple">✨ 50 Beğeni (Karakter Değişimi)</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">🎁 HEDİYELER & DJ YANI VIP</div>
            <div class="btn-grid">
              <button id="btn-gift-small" class="btn btn-gift-small">🌹 Gül (Tier 4 - Kalıcı En Ön)</button>
              <button id="btn-gift-mid" class="btn btn-gift-mid">🚀 Roket (Tier 4 - Kalıcı)</button>
              <button id="btn-gift-big" class="btn btn-gift-big">👑 Galaksi (DJ Yanı VIP - 30sn)</button>
            </div>
          </div>

          <div class="control-section">
            <div class="section-label">💬 TÜRKÇE YORUM & BALON</div>
            <div class="comment-input-row">
              <input type="text" id="input-comment" placeholder="Yorum yaz..." value="Takipteyim! 🚀" />
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
            <button id="btn-obs-mode" class="btn btn-obs">📺 Bu Paneli Yayında Tamamen Gizle</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Aç / Kapat
    this.containerEl.querySelector('.btn-toggle-panel')?.addEventListener('click', () => {
      this.toggleCollapse();
    });

    // Tamamen Kapat (Çarpı butonu)
    this.containerEl.querySelector('.btn-close-forever')?.addEventListener('click', () => {
      this.containerEl.style.display = 'none';
      localStorage.setItem('lunar_sim_hidden', 'true');
    });

    // Auto Sim
    const autoSimBtn = this.containerEl.querySelector('#btn-auto-sim') as HTMLButtonElement;
    autoSimBtn?.addEventListener('click', () => {
      this.isAutoSimulating = !this.isAutoSimulating;
      if (this.isAutoSimulating) {
        autoSimBtn.innerText = '⏹ Simülasyonu Durdur';
        autoSimBtn.classList.add('active');
        this.startAutoSimulation();
      } else {
        autoSimBtn.innerText = '⚡ Test Simülasyonu';
        autoSimBtn.classList.remove('active');
        this.stopAutoSimulation();
      }
    });

    // Audio Toggle
    const audioBtn = this.containerEl.querySelector('#btn-audio-toggle') as HTMLButtonElement;
    audioBtn?.addEventListener('click', () => {
      const isPlaying = soundEngine.toggle();
      this.isAudioPlaying = isPlaying;
      audioBtn.innerText = isPlaying ? '🔊 Müzik: AÇIK' : '🎵 Müzik: KAPALI';
      audioBtn.classList.toggle('active', isPlaying);
    });

    // Spawn Viewer (Tier 1)
    this.containerEl.querySelector('#btn-spawn-viewer')?.addEventListener('click', () => {
      const u = `user_${Math.floor(100 + Math.random() * 899)}`;
      this.crowd.handleJoin(u);
      this.hud.addPartyScore(1);
    });

    // Follower Leap (Tier 2)
    this.containerEl.querySelector('#btn-follower-leap')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleFollow(u);
      this.hud.addPartyScore(4);
    });

    // Like (Tier 3 - 1dk)
    this.containerEl.querySelector('#btn-like')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleLike(u, this.particles);
      this.hud.addPartyScore(2);
    });

    // 50 Likes Test (Mutates character appearance)
    this.containerEl.querySelector('#btn-50-likes')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      const av = this.crowd.handleLike(u, this.particles);
      // Simulate rapid 50 likes
      av.likeCount = 49;
      this.crowd.handleLike(u, this.particles);
      this.hud.addPartyScore(10);
    });

    // Small Gift (Tier 4 - Kalıcı en önde)
    this.containerEl.querySelector('#btn-gift-small')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Rose', 'small', this.particles, 5);
      this.hud.addPartyScore(5);
    });

    // Medium Gift (Tier 4 - Kalıcı en önde)
    this.containerEl.querySelector('#btn-gift-mid')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Rocket', 'medium', this.particles, 30);
      this.hud.addPartyScore(15);
    });

    // Big Gift (DJ Yanı VIP - 30sn)
    this.containerEl.querySelector('#btn-gift-big')?.addEventListener('click', () => {
      const u = this.getRandomUser();
      this.crowd.handleGift(u, 'Galaxy Rave', 'big', this.particles, 100);
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

    // Paneli Tamamen Gizle
    this.containerEl.querySelector('#btn-obs-mode')?.addEventListener('click', () => {
      this.containerEl.style.display = 'none';
      localStorage.setItem('lunar_sim_hidden', 'true');
    });
  }

  private startAutoSimulation() {
    if (this.autoSimInterval !== null) return;

    this.autoSimInterval = window.setInterval(() => {
      const rand = Math.random();
      const user = this.getRandomUser();

      if (rand < 0.35) {
        this.crowd.handleLike(user, this.particles);
        this.hud.addPartyScore(1);
      } else if (rand < 0.60) {
        const phrase = this.getRandomPhrase();
        this.crowd.handleComment(user, phrase);
        this.hud.addPartyScore(2);
      } else if (rand < 0.80) {
        this.crowd.handleFollow(user);
        this.hud.addPartyScore(4);
      } else if (rand < 0.93) {
        this.crowd.handleGift(user, 'Neon Rose', 'small', this.particles);
        this.hud.addPartyScore(6);
      } else {
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
