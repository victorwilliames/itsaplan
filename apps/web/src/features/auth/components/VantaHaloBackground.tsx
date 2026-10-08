// FORK (APPLANO): animated HALO background for the auth screens (fork-only).
'use client';

import { useEffect, useRef } from 'react';

export default function VantaHaloBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const THREE = await import('three');
      const { default: HALO } = await import('vanta/dist/vanta.halo.min');
      if (cancelled || !ref.current) return;
      effect = HALO({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        baseColor: 0x8600ff,
        backgroundColor: 0x0,
        amplitudeFactor: 2.6,
        xOffset: 0.08,
        yOffset: 0.28,
        size: 2.7,
      });
    })();

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}
