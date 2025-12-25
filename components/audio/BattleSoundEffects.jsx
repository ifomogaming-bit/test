import { useEffect, useRef } from 'react';

// Web Audio API sound effects for battles
export default function BattleSoundEffects({ enabled = true, eventTrigger = null }) {
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !eventTrigger || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    if (eventTrigger.type === 'attack') {
      playAttackSound(ctx);
    } else if (eventTrigger.type === 'defend') {
      playDefendSound(ctx);
    } else if (eventTrigger.type === 'explosion') {
      playExplosionSound(ctx);
    } else if (eventTrigger.type === 'victory') {
      playVictorySound(ctx);
    } else if (eventTrigger.type === 'defeat') {
      playDefeatSound(ctx);
    }
  }, [eventTrigger, enabled]);

  return null;
}

function playAttackSound(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.start(now);
  osc.stop(now + 0.2);
}

function playDefendSound(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.linearRampToValueAtTime(400, now + 0.15);
  
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.15);
}

function playExplosionSound(ctx) {
  const now = ctx.currentTime;
  
  // White noise for explosion
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.5);
}

function playVictorySound(ctx) {
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}

function playDefeatSound(ctx) {
  const now = ctx.currentTime;
  const notes = [392, 349.23, 293.66]; // G, F, D (descending)
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = freq;
    osc.type = 'triangle';
    
    const startTime = now + i * 0.2;
    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

export { playAttackSound, playDefendSound, playExplosionSound, playVictorySound, playDefeatSound };