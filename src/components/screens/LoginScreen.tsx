import React from 'react';
import { Particles } from '../ui/particles';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
}

export function LoginScreen({ onBack, onLogin }: LoginScreenProps) {
  return (
    <div className="relative md:h-screen md:overflow-hidden w-full bg-black">
      <Particles
        color="#666666"
        quantity={120}
        ease={20}
        className="absolute inset-0"
      />
      <div
        aria-hidden
        className="absolute inset-0 isolate -z-10 contain-strict"
      >
        <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(255,255,255,0.06)_0,hsla(0,0%,55%,0.02)_50%,rgba(255,255,255,0.01)_80%)] absolute top-0 left-0 h-80 w-56 -translate-y-44 -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-80 w-24 translate-x-2 -translate-y-1/2 -rotate-45 rounded-full" />
        <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-80 w-24 -translate-y-44 -rotate-45 rounded-full" />
      </div>
      {/* All text and buttons removed - only animations remain */}
    </div>
  );
}