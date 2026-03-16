"use client";

import { useRef, useCallback, useState, useEffect } from "react";

interface Options {
  onSeek: (ms: number) => void;
  progressMs: number;
  durationMs: number;
  playScratch: () => void;
  isPlaying: boolean;
}

export function useVinylScratch({ onSeek, progressMs, durationMs, playScratch, isPlaying }: Options) {
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngle = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const currentProgressRef = useRef(progressMs);
  const [dragRotation, setDragRotation] = useState(0);
  const spinAngle = useRef(0);
  const lastTickTime = useRef<number>(Date.now());

  currentProgressRef.current = progressMs;

  // Track spin angle continuously so we know exact position when user clicks
  useEffect(() => {
    if (!isPlaying || isDraggingRef.current) return;
    const RPM = 33.3;
    const degsPerMs = (RPM * 360) / 60000;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickTime.current;
      lastTickTime.current = now;
      spinAngle.current = (spinAngle.current + degsPerMs * elapsed) % 360;
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

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

    // Start drag from exact current spin position
    setDragRotation(spinAngle.current);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastAngle.current = getAngle(clientX, clientY, centerRef.current);
    isDraggingRef.current = true;
    lastTickTime.current = Date.now();
    setIsDragging(true);
    playScratch();

    const onMove = (moveE: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !centerRef.current || lastAngle.current === null) return;

      const mx = "touches" in moveE ? (moveE as TouchEvent).touches[0].clientX : (moveE as MouseEvent).clientX;
      const my = "touches" in moveE ? (moveE as TouchEvent).touches[0].clientY : (moveE as MouseEvent).clientY;

      const newAngle = getAngle(mx, my, centerRef.current);
      let delta = newAngle - lastAngle.current;

      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      lastAngle.current = newAngle;
      spinAngle.current += delta;
      setDragRotation(spinAngle.current);

      const seekDeltaMs = (delta / 10) * 5000;
      const newProgress = Math.max(0, Math.min(durationMs, currentProgressRef.current + seekDeltaMs));
      currentProgressRef.current = newProgress;
      onSeek(newProgress);
    };

    const onUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      lastAngle.current = null;
      lastTickTime.current = Date.now();
      playScratch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [onSeek, durationMs, playScratch]);

  return { onMouseDown, isDragging, dragRotation };
}
