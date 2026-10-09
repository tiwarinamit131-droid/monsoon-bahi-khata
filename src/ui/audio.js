/**
 * Rain, synthesised live with the Web Audio API: pink noise through a band-pass,
 * with sparse clicks for individual drops. No audio files.
 */
let ctx = null;
let gain = null;

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const seconds = 3;
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // Paul Kellet's economy pink-noise filter.
      b0 = 0.99765 * b0 + white * 0.099;
      b1 = 0.963 * b1 + white * 0.2965;
      b2 = 0.57 * b2 + white * 1.0527;
      d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
      if (Math.random() < 0.0009) d[i] += (Math.random() - 0.5) * 0.9;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 2400;
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 220;
  gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination);
  src.start();
}

/** Turn rain on or off. `intensity` 0–1.5 follows the sky. Must be called from a user gesture. */
export async function setRain(on, intensity = 0.6) {
  if (!ctx) build();
  if (ctx.state === 'suspended') await ctx.resume();
  gain.gain.setTargetAtTime(on ? 0.55 * (0.4 + Math.min(1.4, intensity)) : 0, ctx.currentTime, 0.4);
}
