"use client";

import { useRef, useCallback, useState } from "react";

interface Options {
  onSeek: (ms: number) => void;
  progressMs: number;
  durationMs: number;
  playScratch: () => void;
}

export function useVinylScratch({ onSeek, progressMs, durationMs, playScratch }: Options) {
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngle = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const currentProgressRef = useRef(progressMs);
  const baseRotation = useRef(0);
  const [dragRotation, setDragRotation] = useState(0);

  currentProgressRef.current = progressMs;

  const getAngle = (clientX: number, clientY: number, center: { x: number; y: number }) => {
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Get the current visual rotation of the spinning element
  const getCurrentRotation = (el: HTMLElement): number => {
    // Look for the inner spinning vinyl div
    const vinyl = el.querySelector('[class*="vinyl"]') as HTMLElement | null;
    const target = vinyl || el;
    const transform = window.getComputedStyle(target).transform;
    if (!transform || transform === "none") return 0;
    const mat = transform.match(/matrix(([^)]+))/);
    if (!mat) return 0;
    const values = mat[1].split(",");
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI));
  };

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // Capture exact current rotation so record freezes in place
    const currentRot = getCurrentRotation(el);
    baseRotation.current = currentRot;
    setDragRotation(currentRot);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastAngle.current = getAngle(clientX, clientY, centerRef.current);
    isDraggingRef.current = true;
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
      baseRotation.current += delta;
      setDragRotation(baseRotation.current);

      const seekDeltaMs = (delta / 10) * 5000;
      const newProgress = Math.max(0, Math.min(durationMs, currentProgressRef.current + seekDeltaMs));
      currentProgressRef.current = newProgress;
      onSeek(newProgress);
    };

    const onUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      lastAngle.current = null;
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
