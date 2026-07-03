'use client';
import { useEffect, useState } from 'react';
import { secureRandom } from '@/lib/utils';

export function DustMotes() {
  const [motes, setMotes] = useState<Array<{ id: number; left: string; size: number; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate static motes on mount to avoid hydration mismatch
    const generatedMotes = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${secureRandom() * 100}%`,
      size: secureRandom() * 2 + 1,
      delay: `${secureRandom() * 10}s`,
      duration: `${secureRandom() * 15 + 15}s`,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotes(generatedMotes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {motes.map((mote) => (
        <div
          key={mote.id}
          className="absolute -bottom-4 bg-white/30 rounded-full animate-float blur-[1px]"
          style={{
            left: mote.left,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            animationDelay: mote.delay,
            animationDuration: mote.duration,
          }}
        />
      ))}
    </div>
  );
}
