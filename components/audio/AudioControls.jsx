import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Music, VolumeX, Volume2 } from 'lucide-react';
import soundManager from './SoundManager';

export default function AudioControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    soundManager.init();
  }, []);

  const handleToggleMusic = () => {
    const playing = soundManager.toggleMusic();
    setIsPlaying(playing);
    if (!playing) {
      soundManager.playClick();
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleMusic}
        className="bg-slate-800/80 backdrop-blur border-slate-700 hover:bg-slate-700"
        title={isPlaying ? 'Stop Music' : 'Play Music'}
      >
        <Music className={`w-5 h-5 ${isPlaying ? 'text-green-400' : 'text-slate-400'}`} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleMute}
        className="bg-slate-800/80 backdrop-blur border-slate-700 hover:bg-slate-700"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-slate-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-green-400" />
        )}
      </Button>
    </div>
  );
}