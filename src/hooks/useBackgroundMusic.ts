import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Original 8-second looping background melody composed in C major pentatonic
 * (C D E G A). Synthesised entirely with the Web Audio API — no audio files
 * required. Uses a look-ahead scheduler so the loop is perfectly seamless.
 *
 * Usage:
 *   const music = useBackgroundMusic();
 *   music.toggle();          // start / stop
 *   music.playing            // boolean state
 *   music.stop(fade)         // optional fade-out
 */

// ── Melody ─────────────────────────────────────────────────────
// Format: [frequency Hz, duration seconds]
// 4 bars × 2 s = 8 s loop at 120 BPM (♩ = 0.5 s, ♪ = 0.25 s)
const MELODY: [number, number][] = [
  // Bar 1
  [523.25, 0.25], // C5 ♪
  [659.25, 0.25], // E5 ♪
  [783.99, 0.25], // G5 ♪
  [659.25, 0.25], // E5 ♪
  [523.25, 0.25], // C5 ♪
  [440.00, 0.25], // A4 ♪
  [392.00, 0.50], // G4 ♩
  // Bar 2
  [659.25, 0.25], // E5 ♪
  [783.99, 0.25], // G5 ♪
  [880.00, 0.25], // A5 ♪
  [783.99, 0.25], // G5 ♪
  [659.25, 0.25], // E5 ♪
  [523.25, 0.25], // C5 ♪
  [659.25, 0.50], // E5 ♩
  // Bar 3
  [523.25, 0.25], // C5 ♪
  [440.00, 0.25], // A4 ♪
  [392.00, 0.25], // G4 ♪
  [440.00, 0.25], // A4 ♪
  [523.25, 0.25], // C5 ♪
  [659.25, 0.25], // E5 ♪
  [783.99, 0.50], // G5 ♩
  // Bar 4
  [880.00, 0.25], // A5 ♪
  [783.99, 0.25], // G5 ♪
  [659.25, 0.25], // E5 ♪
  [523.25, 0.25], // C5 ♪
  [440.00, 0.50], // A4 ♩
  [523.25, 0.50], // C5 ♩  ← total = 8.00 s exactly
];

const LOOK_AHEAD_S = 0.10; // schedule this many seconds ahead
const TICK_MS      = 25;   // scheduler polling interval
const MASTER_VOL   = 0.13; // overall music volume (soft, not intrusive)
const FADE_OUT_S   = 0.40; // fade-out duration when stopping

export function useBackgroundMusic() {
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode   | null>(null);
  const timerRef  = useRef<number>(0);
  const nextTimeRef = useRef(0);
  const idxRef      = useRef(0);

  const [playing, setPlaying] = useState(false);

  // ── Lazy AudioContext creation ──────────────────────────────
  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = MASTER_VOL;
      masterRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }

  // ── Schedule one note (melody + quiet bass octave below) ───
  function scheduleNote(freq: number, time: number, dur: number) {
    const ac     = ctxRef.current!;
    const master = masterRef.current!;

    // ── Melody voice: triangle wave ────────────────────────
    const mOsc  = ac.createOscillator();
    const mGain = ac.createGain();
    mOsc.connect(mGain);
    mGain.connect(master);
    mOsc.type = 'triangle';
    mOsc.frequency.value = freq;
    mGain.gain.setValueAtTime(1.0, time);
    mGain.gain.setValueAtTime(1.0, time + dur * 0.80);
    mGain.gain.linearRampToValueAtTime(0, time + dur);
    mOsc.start(time);
    mOsc.stop(time + dur + 0.01);

    // ── Bass voice: sine wave one octave down, softer ──────
    const bOsc  = ac.createOscillator();
    const bGain = ac.createGain();
    bOsc.connect(bGain);
    bGain.connect(master);
    bOsc.type = 'sine';
    bOsc.frequency.value = freq / 2;
    bGain.gain.setValueAtTime(0.35, time);
    bGain.gain.linearRampToValueAtTime(0, time + dur);
    bOsc.start(time);
    bOsc.stop(time + dur + 0.01);
  }

  // ── Look-ahead scheduler tick ───────────────────────────────
  const tick = useCallback(() => {
    const ac = ctxRef.current!;
    while (nextTimeRef.current < ac.currentTime + LOOK_AHEAD_S) {
      const [freq, dur] = MELODY[idxRef.current % MELODY.length];
      scheduleNote(freq, nextTimeRef.current, dur);
      nextTimeRef.current += dur;
      idxRef.current     += 1;
    }
    timerRef.current = window.setTimeout(tick, TICK_MS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public: start ───────────────────────────────────────────
  const start = useCallback(() => {
    const ac = getCtx();
    // Restore master volume (may have been faded out)
    masterRef.current!.gain.cancelScheduledValues(ac.currentTime);
    masterRef.current!.gain.setValueAtTime(MASTER_VOL, ac.currentTime);

    nextTimeRef.current = ac.currentTime + 0.05;
    idxRef.current      = 0;
    tick();
    setPlaying(true);
  }, [tick]);

  // ── Public: stop (with optional fade) ──────────────────────
  const stop = useCallback((fade = true) => {
    clearTimeout(timerRef.current);
    if (fade && masterRef.current && ctxRef.current) {
      const ac = ctxRef.current;
      masterRef.current.gain.cancelScheduledValues(ac.currentTime);
      masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, ac.currentTime);
      masterRef.current.gain.linearRampToValueAtTime(0, ac.currentTime + FADE_OUT_S);
      // Restore volume value after fade so next start sounds correct
      setTimeout(() => {
        if (masterRef.current) masterRef.current.gain.value = MASTER_VOL;
      }, (FADE_OUT_S + 0.05) * 1000);
    }
    setPlaying(false);
  }, []);

  // ── Public: toggle ──────────────────────────────────────────
  const toggle = useCallback(() => {
    if (playing) stop();
    else         start();
  }, [playing, start, stop]);

  // ── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => () => {
    clearTimeout(timerRef.current);
    void ctxRef.current?.close();
  }, []);

  return { playing, toggle, start, stop };
}
