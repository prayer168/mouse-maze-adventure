import { useRef, useCallback } from 'react';

/**
 * Provides two short Web-Audio sound effects:
 *   playSqueak() — cute mouse squeak on each move
 *   playWin()    — happy ascending fanfare on reaching the cheese
 *
 * All synthesis is done in-browser (no audio files needed).
 * The AudioContext is created lazily on the first call so browsers that
 * require a user gesture before audio is allowed work correctly.
 */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext | null {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }

  /**
   * Short triangle-wave pitch sweep (≈130 ms).
   * Base pitch varies slightly each call so repeated moves feel alive.
   */
  const playSqueak = useCallback(() => {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;

    const now   = ac.currentTime;
    const pitch = 640 + Math.random() * 160; // 640–800 Hz, randomised

    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle'; // warmer/cuter than square
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.52, now + 0.11);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.start(now);
    osc.stop(now + 0.14);
  }, [enabled]);

  /**
   * Four-note ascending chord arpeggio (C5 → E5 → G5 → C6).
   * Plays when the mouse reaches the cheese.
   */
  const playWin = useCallback(() => {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      const t = ac.currentTime + i * 0.17;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t);
      osc.stop(t + 0.40);
    });
  }, [enabled]);

  return { playSqueak, playWin };
}
