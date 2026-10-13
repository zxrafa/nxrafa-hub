// Sintetizador procedural de som ambiente estilo PlayStation 5 Home
let ctx = null;
let masterGain = null;
let filterNode = null;
let oscillators = [];
let isPlaying = false;
let userEnabled = true;
let targetVolume = 0.04;

function initContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

  filterNode = ctx.createBiquadFilter();
  filterNode.type = "lowpass";
  filterNode.frequency.setValueAtTime(280, ctx.currentTime);
  filterNode.Q.setValueAtTime(1.8, ctx.currentTime);

  masterGain.connect(filterNode);
  filterNode.connect(ctx.destination);
  return ctx;
}

export function startAmbient() {
  if (!userEnabled || isPlaying) return;
  const c = initContext();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});

  const now = c.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value || 0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(targetVolume, now + 2.0);

  // Acorde flutuante sub-grave (La menor 9 / Dó maj)
  const freqs = [55.0, 82.4, 110.0, 164.8, 220.0];
  oscillators = freqs.map((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(f, now);

    // Micro-desafinação para criar sensação espacial orgânica
    osc.detune.setValueAtTime((i - 2) * 4, now);
    g.gain.setValueAtTime(0.2 / freqs.length, now);

    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    return osc;
  });

  isPlaying = true;
}

export function stopAmbient(fadeSeconds = 1.2) {
  if (!isPlaying || !ctx || !masterGain) return;
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);

  setTimeout(() => {
    oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (_) {} });
    oscillators = [];
    isPlaying = false;
  }, fadeSeconds * 1000);
}

export function toggleAmbient() {
  userEnabled = !userEnabled;
  if (userEnabled) startAmbient();
  else stopAmbient(0.8);
  return userEnabled;
}

export function isAmbientActive() { return userEnabled && isPlaying; }
export function isAmbientEnabled() { return userEnabled; }

export function setAmbientVolume(val) {
  targetVolume = Math.max(0, Math.min(0.15, val));
  if (isPlaying && ctx && masterGain) {
    masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.2);
  }
}

export function pauseAmbientForGame() {
  if (isPlaying) stopAmbient(0.5);
}

export function resumeAmbientAfterGame() {
  if (userEnabled && !isPlaying) setTimeout(() => startAmbient(), 400);
}
