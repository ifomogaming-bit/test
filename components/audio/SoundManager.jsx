import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

// Sound effect generator using Web Audio API
class SoundEffects {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Pop/bubble sound
  playPop() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Coin collect sound
  playCoin() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Success sound
  playSuccess() {
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.1);
      
      gain.gain.setValueAtTime(0.15, this.audioContext.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.1 + 0.2);
      
      osc.start(this.audioContext.currentTime + i * 0.1);
      osc.stop(this.audioContext.currentTime + i * 0.1 + 0.2);
    });
  }

  // Click sound
  playClick() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  // Level up sound
  playLevelUp() {
    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.08 + 0.3);
      
      osc.start(this.audioContext.currentTime + i * 0.08);
      osc.stop(this.audioContext.currentTime + i * 0.08 + 0.3);
    });
  }

  // Background ambient sound - more musical and relaxing
  startAmbient() {
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const osc3 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'triangle';
    
    // C major chord - soothing ambient
    osc1.frequency.setValueAtTime(130.81, this.audioContext.currentTime); // C3
    osc2.frequency.setValueAtTime(164.81, this.audioContext.currentTime); // E3
    osc3.frequency.setValueAtTime(196.00, this.audioContext.currentTime); // G3
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.015, this.audioContext.currentTime);
    
    // Subtle modulation for movement
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.frequency.setValueAtTime(0.2, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(0.003, this.audioContext.currentTime);
    
    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();
    
    return { osc1, osc2, osc3, gain, lfo };
  }
}

let soundEffects = null;

export default function SoundManager() {
  const [isMuted, setIsMuted] = useState(false);
  const ambientRef = useRef(null);

  useEffect(() => {
    if (!soundEffects) {
      soundEffects = new SoundEffects();
    }

    // Add click sounds to all buttons
    const handleClick = (e) => {
      if (!isMuted && e.target.closest('button, a, [role="button"]')) {
        soundEffects.playClick();
      }
    };

    document.addEventListener('click', handleClick);

    // Ambient background removed per user request

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isMuted]);

  // Expose global sound functions
  useEffect(() => {
    if (!isMuted && soundEffects) {
      window.playPop = () => soundEffects.playPop();
      window.playCoin = () => soundEffects.playCoin();
      window.playSuccess = () => soundEffects.playSuccess();
      window.playLevelUp = () => soundEffects.playLevelUp();
    }

    return () => {
      delete window.playPop;
      delete window.playCoin;
      delete window.playSuccess;
      delete window.playLevelUp;
    };
  }, [isMuted]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsMuted(!isMuted)}
        variant="outline"
        size="icon"
        className="bg-slate-800/80 backdrop-blur border-slate-700 hover:bg-slate-700"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-slate-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-green-400" />
        )}
      </Button>
    </div>
  );
}

export { soundEffects };