import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface CountUpProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function CountUp({ value, suffix = '', className = '', duration = 1.2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const from = prev.current;
    prev.current = value;

    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v) + suffix;
      },
    });

    return () => controls.stop();
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
