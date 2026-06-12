"use client";

import { useCallback, useRef } from "react";

export function useAudioFeedback() {
  const audioCtx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx.current;
  }, []);

  const playBeep = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      try {
        const ctx = getCtx();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch {
        // Audio not available
      }
    },
    [getCtx]
  );

  const playSuccess = useCallback(() => {
    const ctx = getCtx();
    const now = ctx.currentTime;
    try {
      // Ascending double beep
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(660, now);
      osc2.frequency.setValueAtTime(880, now + 0.12);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.28);
    } catch { /* ignore */ }
  }, [getCtx]);

  const playLate = useCallback(() => {
    // Single medium tone
    playBeep(440, 0.2, "triangle");
  }, [playBeep]);

  const playError = useCallback(() => {
    // Low descending buzz
    playBeep(200, 0.35, "sawtooth");
  }, [playBeep]);

  return { playSuccess, playLate, playError };
}
