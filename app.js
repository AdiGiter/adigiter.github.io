/**
 * SAHAYAK-DRISHTI — Frontend Application
 * app.js (Static Deploy Version)
 *
 * CHANGE FROM ORIGINAL:
 *   loadLocation() previously called GET /api/location/{key} (Spring Boot backend).
 *   Backend does not exist in this deployment.
 *   Now reads directly from locations.json (bundled with the static site).
 *
 * Everything else (SpeechSynthesis, progress, language switch) is unchanged.
 */

'use strict';

// ── STATE ────────────────────────────────────────────────
const state = {
  locationData: null,
  currentLang: 'en',
  speechRate: 1.0,
  utterance: null,
  isPlaying: false,
  isPaused: false,
  progressTimer: null,
  estimatedDuration: 0,
  startedAt: 0,
  elapsedBeforePause: 0,
};

// ── DOM REFS ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screens = {
  loading:  $('loading-screen'),
  home:     $('home-screen'),
  error:    $('error-screen'),
  guidance: $('guidance-screen'),
};

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  detectLanguage();
  const locKey = getLocationKey();
  if (!locKey) {
    showScreen('home');
    return;
  }
  loadLocation(locKey);
});

// ── LANGUAGE DETECTION ───────────────────────────────────
function detectLanguage() {
  const systemLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  state.currentLang = systemLang.startsWith('hi') ? 'hi' : 'en';
  updateLangBadge();
}

function updateLangBadge() {
  const badge = $('lang-badge');
  if (badge) badge.textContent = state.currentLang === 'hi' ? 'HI' : 'EN';
}

// ── URL PARSING ──────────────────────────────────────────
function getLocationKey() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('loc') || params.get('location');
  if (!key) return null;
  return key.replace(/[^a-z0-9_]/gi, '').toLowerCase();
}

// ── FETCH LOCATION FROM LOCAL JSON (replaces Spring Boot API) ──
async function loadLocation(locKey) {
  showScreen('loading');
  try {
    // Fetch the bundled locations.json instead of the backend API
    const response = await fetch('locations.json');
    if (!response.ok) {
      throw new Error(`Could not load locations data (HTTP ${response.status})`);
    }

    const allLocations = await response.json();
    const loc = allLocations[locKey];

    if (!loc) {
      throw new Error(`Location "${locKey}" not found.`);
    }

    // Normalise into the shape the rest of app.js expects
    // (mirrors the Spring Boot API response DTO)
    const data = {
      locationKey: locKey,
      nameEn:      loc.nameEn,
      nameHi:      loc.nameHi,
      scriptEn:    loc.scriptEn,
      scriptHi:    loc.scriptHi,
    };

    state.locationData = data;
    renderGuidance(data);
    showScreen('guidance');

    setTimeout(() => handlePlay(), 600);

  } catch (error) {
    console.error('Failed to load location:', error);
    showError(error.message || 'Could not load guidance for this location.');
  }
}

// ── RENDER GUIDANCE SCREEN ───────────────────────────────
function renderGuidance(data) {
  $('loc-key-label').textContent = data.locationKey.replace(/_/g, ' ').toUpperCase();
  $('loc-title-en').textContent = data.nameEn;
  $('loc-title-hi').textContent = data.nameHi;
  updateScriptText();
  document.title = `${data.nameEn} — Sahayak-Drishti`;
  updateLangButtons();
}

function updateScriptText() {
  if (!state.locationData) return;
  const text = state.currentLang === 'hi'
    ? state.locationData.scriptHi
    : state.locationData.scriptEn;
  $('script-text').textContent = text;

  const words = text.split(/\s+/).length;
  const wpm = state.currentLang === 'hi' ? 110 : 130;
  state.estimatedDuration = (words / (wpm * state.speechRate)) * 60 * 1000;
}

// ── SPEECH PLAYBACK ──────────────────────────────────────
window.handlePlay = function() {
  if (!state.locationData) return;

  if (state.isPaused && speechSynthesis.paused) {
    speechSynthesis.resume();
    state.isPaused = false;
    state.isPlaying = true;
    state.startedAt = Date.now();
    setStatus('playing');
    resumeProgress();
    return;
  }

  stopSpeech();

  const script = state.currentLang === 'hi'
    ? state.locationData.scriptHi
    : state.locationData.scriptEn;

  const utterance = new SpeechSynthesisUtterance(script);
  utterance.lang  = state.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
  utterance.rate  = state.speechRate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang === utterance.lang)
                 || voices.find(v => v.lang.startsWith(state.currentLang))
                 || null;
  if (preferred) utterance.voice = preferred;

  utterance.onstart = () => {
    state.isPlaying = true;
    state.isPaused  = false;
    state.startedAt = Date.now();
    state.elapsedBeforePause = 0;
    setStatus('playing');
    startProgress();
    $('script-box').classList.add('active');
  };

  utterance.onend = () => {
    state.isPlaying = false;
    state.isPaused  = false;
    setStatus('stopped');
    stopProgress(true);
    $('script-box').classList.remove('active');
    $('play-icon').textContent  = '▶';
    $('play-label').textContent = 'REPLAY';
  };

  utterance.onerror = (e) => {
    console.warn('Speech error:', e.error);
    if (e.error !== 'interrupted') {
      setStatus('stopped');
      stopProgress(false);
    }
  };

  utterance.onpause = () => {
    state.isPaused  = true;
    state.isPlaying = false;
    setStatus('paused');
    pauseProgress();
  };

  utterance.onresume = () => {
    state.isPaused  = false;
    state.isPlaying = true;
    setStatus('playing');
    resumeProgress();
  };

  state.utterance = utterance;
  speechSynthesis.speak(utterance);
  $('play-icon').textContent  = '⟳';
  $('play-label').textContent = 'PLAYING';
};

window.handlePause = function() {
  if (state.isPlaying && speechSynthesis.speaking && !speechSynthesis.paused) {
    state.elapsedBeforePause += Date.now() - state.startedAt;
    speechSynthesis.pause();
  }
};

window.handleStop = function() {
  stopSpeech();
  setStatus('stopped');
  stopProgress(false);
  $('script-box').classList.remove('active');
  $('play-icon').textContent  = '▶';
  $('play-label').textContent = 'PLAY';
  $('progress-fill').style.width = '0%';
};

function stopSpeech() {
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }
  state.isPlaying = false;
  state.isPaused  = false;
  state.utterance = null;
}

// ── LANGUAGE SWITCH ──────────────────────────────────────
window.switchLang = function(lang) {
  if (state.currentLang === lang) return;
  state.currentLang = lang;
  updateLangBadge();
  updateLangButtons();
  updateScriptText();
  if (state.isPlaying || state.isPaused) {
    stopSpeech();
    setTimeout(handlePlay, 300);
  }
};

function updateLangButtons() {
  ['en', 'hi'].forEach(l => {
    const btn = $(`btn-lang-${l}`);
    if (!btn) return;
    const active = state.currentLang === l;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

// ── SPEED CONTROL ────────────────────────────────────────
window.setSpeed = function(rate) {
  state.speechRate = rate;
  $('speed-display').textContent = `${rate}×`;
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === rate);
  });
  updateScriptText();
  if (state.isPlaying || state.isPaused) {
    stopSpeech();
    setTimeout(handlePlay, 300);
  }
};

// ── STATUS CHIP ──────────────────────────────────────────
function setStatus(status) {
  const chip = $('status-chip');
  const text = $('status-text');
  const waveform = $('waveform');
  chip.className = `status-chip ${status}`;
  waveform.className = `waveform ${status === 'playing' ? 'playing' : ''}`;
  const labels = { playing: 'Playing', paused: 'Paused', stopped: 'Ready' };
  text.textContent = labels[status] || 'Ready';
}

// ── PROGRESS BAR ─────────────────────────────────────────
function startProgress() {
  stopProgress(false);
  const fill = $('progress-fill');
  fill.style.width = '0%';
  state.progressTimer = setInterval(() => {
    const elapsed = (Date.now() - state.startedAt) + state.elapsedBeforePause;
    const pct = Math.min((elapsed / state.estimatedDuration) * 100, 98);
    fill.style.width = pct + '%';
  }, 200);
}

function stopProgress(complete) {
  if (state.progressTimer) { clearInterval(state.progressTimer); state.progressTimer = null; }
  if (complete) {
    $('progress-fill').style.width = '100%';
    setTimeout(() => { $('progress-fill').style.width = '0%'; }, 1200);
  }
}

function pauseProgress() {
  if (state.progressTimer) { clearInterval(state.progressTimer); state.progressTimer = null; }
}

function resumeProgress() {
  state.startedAt = Date.now();
  startProgress();
}

// ── SCREEN SWITCHING ─────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => { if (s) s.style.display = 'none'; });
  const target = screens[name];
  if (target) target.style.display = 'flex';
}

function showError(msg) {
  const el = $('error-message');
  if (el) el.textContent = msg;
  showScreen('error');
}

// ── PWA SERVICE WORKER ───────────────────────────────────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  }
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    console.log('Voices loaded:', speechSynthesis.getVoices().length);
  };
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.isPlaying) {
    handlePause();
  }
});
