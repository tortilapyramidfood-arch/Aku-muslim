import React, { useState, useEffect } from 'react';
import { quranPlayer, PlayerState, RepeatMode } from '../../services/quranPlayerController';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Gauge,
  WifiOff,
  Volume2,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const GlobalAudioPlayerBar: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(quranPlayer.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = quranPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  // Sembunyikan player jika audio tidak sedang aktif atau belum dimulai
  if (!playerState.isPlaying && playerState.currentTime === 0 && !playerState.statusMessage) {
    return null;
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleNextRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'repeat_ayah', 'repeat_surah'];
    const currentIdx = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    quranPlayer.setRepeatMode(nextMode);
  };

  const handleNextSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const currentIdx = speeds.indexOf(playerState.playbackRate);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    quranPlayer.setPlaybackRate(nextSpeed);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto bg-stone-900/95 dark:bg-stone-950/95 text-white rounded-2xl shadow-2xl border border-stone-800 backdrop-blur-md overflow-hidden transition-all duration-300">
        {/* Progress Seek Bar */}
        <div className="relative w-full h-1 bg-stone-800 group cursor-pointer">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{
              width: `${playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={playerState.duration || 100}
            value={playerState.currentTime}
            onChange={(e) => quranPlayer.seek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Status Error Warning Banner */}
        {playerState.statusMessage && (
          <div className="bg-amber-950/80 text-amber-200 px-3 py-1 text-[11px] flex items-center justify-between border-b border-amber-900/50">
            <span>{playerState.statusMessage}</span>
            <button
              onClick={() => quranPlayer.resume()}
              className="text-white underline font-bold"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Main Bar Content */}
        <div className="p-3 flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5 text-amber-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  QS. {playerState.surahName} : Ayat {playerState.ayahNumber}
                </h4>
                {playerState.isCurrentAyahOfflineReady ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                    Offline
                  </span>
                ) : (
                  playerState.isOffline && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                      <WifiOff className="w-2.5 h-2.5" />
                      <span>Online Saja</span>
                    </span>
                  )
                )}
              </div>

              <span className="text-[11px] text-stone-400 block truncate">
                {playerState.qari.name}
              </span>
            </div>
          </div>

          {/* Quick Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => quranPlayer.prevAyah()}
              title="Ayat Sebelumnya"
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => quranPlayer.togglePlay()}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
            >
              {playerState.isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => quranPlayer.nextAyah()}
              title="Ayat Berikutnya"
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 ml-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              onClick={() => quranPlayer.stop()}
              title="Tutup Pemutar"
              className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-stone-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded Drawer: Speed, Repeat, Autoplay */}
        {isExpanded && (
          <div className="px-4 py-3 bg-stone-950 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            {/* Time progress */}
            <div className="text-[11px] font-mono text-stone-400">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>

            {/* Controls: Repeat, Speed, Autoplay */}
            <div className="flex items-center gap-2">
              {/* Repeat Button */}
              <button
                onClick={handleNextRepeatMode}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                  playerState.repeatMode !== 'none'
                    ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                {playerState.repeatMode === 'repeat_ayah' ? (
                  <>
                    <Repeat1 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ulang Ayat</span>
                  </>
                ) : playerState.repeatMode === 'repeat_surah' ? (
                  <>
                    <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ulang Surah</span>
                  </>
                ) : (
                  <>
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Tanpa Ulang</span>
                  </>
                )}
              </button>

              {/* Speed Button */}
              <button
                onClick={handleNextSpeed}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-[11px] font-mono font-bold"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{playerState.playbackRate}x</span>
              </button>

              {/* Autoplay Next Surah Switch */}
              <button
                onClick={() => quranPlayer.setAutoPlayNextSurah(!playerState.autoPlayNextSurah)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                  playerState.autoPlayNextSurah
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                    : 'bg-stone-900 border-stone-800 text-stone-500'
                }`}
              >
                Lanjut Surah: {playerState.autoPlayNextSurah ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
