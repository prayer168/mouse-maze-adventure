import { useRef, useCallback } from 'react';

/**
 * Web Audio sound effects — no external files required.
 *
 *   playSqueak()  short cute squeak on each move
 *   playCheer()   full celebration: crowd noise + fanfare + sparkles
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

  // ── Movement squeak ────────────────────────────────────────────
  const playSqueak = useCallback(() => {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;

    const now   = ac.currentTime;
    const pitch = 640 + Math.random() * 160; // slight variation per move

    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.52, now + 0.11);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.start(now);
    osc.stop(now + 0.14);
  }, [enabled]);

  // ── Full cheering celebration ──────────────────────────────────
  const playCheer = useCallback(() => {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;
    const now = ac.currentTime;

    // 1. Crowd noise burst — filtered white noise that swells and fades
    try {
      const bufSize = Math.floor(ac.sampleRate * 1.2);
      const buf     = ac.createBuffer(1, bufSize, ac.sampleRate);
      const data    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

      const src = ac.createBufferSource();
      src.buffer = buf;

      const bpf = ac.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 1400;
      bpf.Q.value = 0.4;

      const ng = ac.createGain();
      ng.gain.setValueAtTime(0, now);
      ng.gain.linearRampToValueAtTime(0.40, now + 0.07);
      ng.gain.setValueAtTime(0.38, now + 0.35);
      ng.gain.linearRampToValueAtTime(0, now + 1.0);

      src.connect(bpf);
      bpf.connect(ng);
      ng.connect(ac.destination);
      src.start(now);
      src.stop(now + 1.1);
    } catch { /* AudioContext may not support noise buffer */ }

    // 2. Triumphant fanfare — C E G C (arpeggio then long final note)
    const fanNotes = [523.25, 659.25, 783.99, 523.25, 1046.50];
    const fanDurs  = [0.11,   0.11,   0.11,   0.09,   0.55  ];
    let t = now + 0.06;
    fanNotes.forEach((freq, i) => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + fanDurs[i] + 0.06);
      osc.start(t);
      osc.stop(t + fanDurs[i] + 0.09);
      t += fanDurs[i];
    });

    // 3. Sparkle pings — random high-frequency sine pops scattered over 1.2 s
    for (let i = 0; i < 8; i++) {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      const ping = now + 0.25 + Math.random() * 1.0;
      osc.type = 'sine';
      osc.frequency.value = 2200 + Math.random() * 3200;
      gain.gain.setValueAtTime(0.11, ping);
      gain.gain.exponentialRampToValueAtTime(0.001, ping + 0.14);
      osc.start(ping);
      osc.stop(ping + 0.16);
    }
  }, [enabled]);

  return { playSqueak, playCheer };
}
