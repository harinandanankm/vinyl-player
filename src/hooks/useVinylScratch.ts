"use client";

import { useRef, useCallback, useState } from "react";

interface Options {
  onSeek: (ms: number) => void;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  playScratch: () => void;
}

export function useVinylScratch({ onSeek, progressMs, durationMs, isPlaying, playScratch }: Options) {
  const isDragging = useRef(false);
  const [dragRotation, setDragRotation] = useState(0);
  const lastAngle = useRef<number | null>(null);
  const accumulatedDeg = useRef(0);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const manualRotation = useRef(0);

  const getAngle = (e: MouseEvent | TouchEvent, center: { x: number; y: number }) => {
    const point = "touches" in e ? e.touches[0] : e;
    const dx = point.clientX - center.x;
    const dy = point.clientY - center.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const nativeE = "touches" in e ? e.nativeEvent : e.nativeEvent;
    lastAngle.current = getAngle(nativeE, centerRef.current);
    accumulatedDeg.current = 0;
    isDragging.current = true;
    playScratch();

    const onMove = (moveE: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !centerRef.current || lastAngle.current === null) return;
      const newAngle = getAngle(moveE, centerRef.current);
      let delta = newAngle - lastAngle.current;

      // Handle wraparound
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      lastAngle.current = newAngle;
      accumulatedDeg.current += delta;
      manualRotation.current += delta;
      setDragRotation(r => r + delta);

      // 360 degrees = 10 seconds of seek
      const seekDeltaMs = (delta / 360) * 15000;
      const newProgress = Math.max(0, Math.min(durationMs, progressMs + seekDeltaMs));
      onSeek(newProgress);
    };

    const onUp = () => {
      isDragging.current = false;
      lastAngle.current = null;
      setDragRotation(0);
      playScratch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }, [onSeek, progressMs, durationMs, playScratch]);

  return { onMouseDown, isDragging, dragRotation };
}
