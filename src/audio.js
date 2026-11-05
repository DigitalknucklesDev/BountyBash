import { audioManifest } from './audio-manifest.js';
/** Scraplords Audio v2 — browser ES module, no dependencies. */
export class ScraplordsAudio {
  constructor({ baseUrl = new URL('../', import.meta.url).href, manifest = audioManifest } = {}) {
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
  init() { return this; }
  url(path) { return new URL(path, this.baseUrl).href; }
  pick(items, previous = null) {
    if (!items?.length) return null;
    const options = items.length > 1 ? items.filter(x => x !== previous) : items;
    return options[Math.floor(Math.random() * options.length)];
  }
  /** Call once when creating a new single match or BO3 series.
      Pass stable series ID on refresh to keep the same soundtrack. */
  startSession(sessionId, { resume = false } = {}) {

    if (!sessionId) throw new Error('startSession requires a stable match/series ID');
    const saved = this.readSession();
    const tracks = Object.keys(this.manifest.music);
    const same = saved?.id === sessionId && tracks.includes(saved.track);
    const track = (resume && same) ? saved.track : this.pick(tracks, saved?.track ?? this.lastTrack);
    this.currentSessionId = sessionId;
    this.lastTrack = track;
    sessionStorage.setItem('scrap_audio_session', JSON.stringify({ id: sessionId, track }));
    this.startMusic(track);
    return track;
  }
  readSession() {
    try { return JSON.parse(sessionStorage.getItem('scrap_audio_session') || 'null'); }
    catch { return null; }
  }
  resumeSession() {
    const saved = this.readSession();
    if (!saved) return null;
    return this.startSession(saved.id, { resume: true });
  }
  startMusic(track) {

    if (!this.manifest.music[track]) return false;
    if (this.music && this.currentTrack === track) {
      this.music.volume = this.muted ? 0 : this.musicVolume;
      this.attemptPlay(this.music, 'Music'); return true;
    }
    this.stopMusic();
    const audio = new Audio(this.url(this.manifest.music[track]));
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = this.muted ? 0 : this.musicVolume;
    this.music = audio;
    this.currentTrack = track;
    this.attemptPlay(audio, 'Music'); return true;
  }
  stopMusic() { if (this.music) { this.music.pause(); this.music.currentTime = 0; this.music = null; } this.currentTrack = null; }
  pauseMusic() { this.music?.pause(); }
  play(event) {

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
    this.attemptPlay(audio, `SFX ${event}`, cleanup);
    return path;
  }
  attemptPlay(audio, label, onFailure = () => {}) {
    audio.addEventListener('error', () => this.report(`${label}: file missing or unsupported (${audio.currentSrc || audio.src})`), {once:true});
    try {
      const result = audio.play(); // Must be called synchronously inside user gesture.
      if (result?.catch) result.catch(err => { this.report(`${label}: ${err.message}`); onFailure(); });
    } catch (err) { this.report(`${label}: ${err.message}`); onFailure(); }
  }
  report(message) { this.status = message; console.warn('Scraplords Audio:', message); document.dispatchEvent(new CustomEvent('scrap-audio-status',{detail:message})); }
  setMusicVolume(v) { this.musicVolume = Math.max(0, Math.min(1, Number(v))); localStorage.setItem('scrap_music_volume', String(this.musicVolume)); if (this.music) this.music.volume = this.muted ? 0 : this.musicVolume; }
  setSfxVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, Number(v))); localStorage.setItem('scrap_sfx_volume', String(this.sfxVolume)); for (const a of this.activeSfx) a.volume = this.muted ? 0 : this.sfxVolume; }
  setMuted(value) { this.muted = Boolean(value); localStorage.setItem('scrap_muted', String(this.muted)); if (this.music) this.music.volume = this.muted ? 0 : this.musicVolume; for (const a of this.activeSfx) a.volume = this.muted ? 0 : this.sfxVolume; }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }
}
export const scrapAudio = new ScraplordsAudio();
