/** Scraplords Audio v2 — browser ES module, no dependencies. */
export class ScraplordsAudio {
  constructor({ baseUrl = new URL('../', import.meta.url).href, manifest = null } = {}) {
    this.baseUrl = baseUrl;
    this.manifest = manifest;
    this.music = null;
    this.currentTrack = null;
    this.currentSessionId = null;
    this.lastSfx = new Map();
    this.activeSfx = new Set();
    this.musicVolume = Number(localStorage.getItem('scrap_music_volume') ?? .35);
    this.sfxVolume = Number(localStorage.getItem('scrap_sfx_volume') ?? .65);
    this.muted = localStorage.getItem('scrap_muted') === 'true';
    this.lastTrack = null;
  }
  async init() {
    if (!this.manifest) {
      const response = await fetch(new URL('audio-manifest.json', this.baseUrl));
      if (!response.ok) throw new Error('Audio manifest could not be loaded');
      this.manifest = await response.json();
    }
    return this;
  }
  url(path) { return new URL(path, this.baseUrl).href; }
  pick(items, previous = null) {
    if (!items?.length) return null;
    const options = items.length > 1 ? items.filter(x => x !== previous) : items;
    return options[Math.floor(Math.random() * options.length)];
  }
  /** Call once when creating a new single match or BO3 series.
      Pass stable series ID on refresh to keep the same soundtrack. */
  async startSession(sessionId, { resume = false } = {}) {
    await this.init();
    if (!sessionId) throw new Error('startSession requires a stable match/series ID');
    const saved = this.readSession();
    const tracks = Object.keys(this.manifest.music);
    const same = saved?.id === sessionId && tracks.includes(saved.track);
    const track = (resume && same) ? saved.track : this.pick(tracks, saved?.track ?? this.lastTrack);
    this.currentSessionId = sessionId;
    this.lastTrack = track;
    sessionStorage.setItem('scrap_audio_session', JSON.stringify({ id: sessionId, track }));
    await this.startMusic(track);
    return track;
  }
  readSession() {
    try { return JSON.parse(sessionStorage.getItem('scrap_audio_session') || 'null'); }
    catch { return null; }
  }
  async resumeSession() {
    const saved = this.readSession();
    if (!saved) return null;
    return this.startSession(saved.id, { resume: true });
  }
  async startMusic(track) {
    await this.init();
    if (!this.manifest.music[track]) return false;
    if (this.music && this.currentTrack === track) {
      this.music.volume = this.muted ? 0 : this.musicVolume;
      try { await this.music.play(); return true; } catch { return false; }
    }
    this.stopMusic();
    const audio = new Audio(this.url(this.manifest.music[track]));
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = this.muted ? 0 : this.musicVolume;
    this.music = audio;
    this.currentTrack = track;
    try { await audio.play(); return true; } catch { return false; }
  }
  stopMusic() { if (this.music) { this.music.pause(); this.music.currentTime = 0; this.music = null; } this.currentTrack = null; }
  pauseMusic() { this.music?.pause(); }
  async play(event) {
    await this.init();
    const variants = this.manifest.sfx[event];
    if (!variants?.length) { console.warn('Unknown Scraplords audio event:', event); return null; }
    const path = this.pick(variants, this.lastSfx.get(event));
    this.lastSfx.set(event, path);
    const audio = new Audio(this.url(path));
    audio.volume = this.muted ? 0 : this.sfxVolume;
    this.activeSfx.add(audio);
    const cleanup = () => this.activeSfx.delete(audio);
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    try { await audio.play(); } catch { cleanup(); }
    return path;
  }
  setMusicVolume(v) { this.musicVolume = Math.max(0, Math.min(1, Number(v))); localStorage.setItem('scrap_music_volume', String(this.musicVolume)); if (this.music) this.music.volume = this.muted ? 0 : this.musicVolume; }
  setSfxVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, Number(v))); localStorage.setItem('scrap_sfx_volume', String(this.sfxVolume)); for (const a of this.activeSfx) a.volume = this.muted ? 0 : this.sfxVolume; }
  setMuted(value) { this.muted = Boolean(value); localStorage.setItem('scrap_muted', String(this.muted)); if (this.music) this.music.volume = this.muted ? 0 : this.musicVolume; for (const a of this.activeSfx) a.volume = this.muted ? 0 : this.sfxVolume; }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }
}
export const scrapAudio = new ScraplordsAudio();
