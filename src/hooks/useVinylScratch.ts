"use client";

import { useRef, useCallback, useState } from "react";

interface Options {
  onSeek: (ms: number) => void;
  progressMs: number;
  durationMs: number;
  playScratch: () => void;
}

export function useVinylScratch({ onSeek, progressMs, durationMs, playScratch }: Options) {
  const isDragging = useRef(false);
  const lastAngle = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const currentProgressRef = useRef(progressMs);
  const [dragRotation, setDragRotation] = useState(0);
  const dragRotationRef = useRef(0);

  // Keep progress ref in sync
  currentProgressRef.current = progressMs;

  const getAngle = (clientX: number, clientY: number, center: { x: number; y: number }) => {
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastAngle.current = getAngle(clientX, clientY, centerRef.current);
    dragRotationRef.current = 0;
    isDragging.current = true;
    playScratch();

    const onMove = (moveE: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !centerRef.current || lastAngle.current === null) return;

      const mx = "touches" in moveE ? moveE.touches[0].clientX : (moveE as MouseEvent).clientX;
      const my = "touches" in moveE ? moveE.touches[0].clientY : (moveE as MouseEvent).clientY;

      const newAngle = getAngle(mx, my, centerRef.current);
      let delta = newAngle - lastAngle.current;

      // Handle wraparound at 180/-180
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      lastAngle.current = newAngle;
      dragRotationRef.current += delta;
      setDragRotation(dragRotationRef.current);

      // 10 degrees = 5 seconds
      const seekDeltaMs = (delta / 10) * 5000;
      const newProgress = Math.max(0, Math.min(durationMs, currentProgressRef.current + seekDeltaMs));
      currentProgressRef.current = newProgress;
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
  }, [onSeek, durationMs, playScratch]);

  return { onMouseDown, isDragging, dragRotation };
}
