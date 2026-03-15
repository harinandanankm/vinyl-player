"use client";

import { useEffect, useRef } from "react";
import styles from "./EQBars.module.css";

export function EQBars({ active }: { active: boolean }) {
  const barsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const bars = barsRef.current?.querySelectorAll<HTMLSpanElement>(`.${styles.bar}`);
    if (!bars) return;

    if (active) {
      intervalRef.current = setInterval(() => {
        bars.forEach((bar) => {
          bar.style.height = `${4 + Math.random() * 28}px`;
        });
      }, 110);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      bars.forEach((bar) => { bar.style.height = "4px"; });
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  return (
    <div className={styles.eq} ref={barsRef} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className={styles.bar}
          style={{ height: "4px", opacity: active ? 0.7 : 0.2 }}
        />
      ))}
    </div>
  );
}
