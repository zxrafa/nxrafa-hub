// Web Audio API Synth para efeitos sonoros estilo console (PS/Xbox)
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleConsoleSound() {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

let masterVolume = 1.0;
export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
}
export function getMasterVolume() { return masterVolume; }

// Chime harmônico de boot estilo PlayStation / Console
export function playBootChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.35);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
  masterGain.connect(ctx.destination);

  // Acorde rico em quinta e oitava (Dó maior / Lá menor console pad)
  const notes = [130.81, 196.00, 261.63, 392.00, 523.25, 783.99];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = idx < 2 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now);
    
    // Pequeno glide harmônico estilo console
    osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.8);
    
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.18 / notes.length, now + 0.2 + idx * 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 2.5);
  });
}

// Tick sutil e tátil de navegação (d-pad / hover)
export function playNavTick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

  gain.gain.setValueAtTime(0.04 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

// Som de seleção / ativação de jogo
export function playSelectSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);

  gain.gain.setValueAtTime(0.12 * masterVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}
