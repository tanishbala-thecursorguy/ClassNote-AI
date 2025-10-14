import React from 'react';
import { DottedSurface } from "./dotted-surface";
import { cn } from '../../lib/utils';

interface DottedSurfaceDemoProps {
  onContinue: () => void;
}

export function DottedSurfaceDemo({ onContinue }: DottedSurfaceDemoProps) {
  const handleClick = () => {
    console.log('DottedSurface welcome screen clicked - going to dashboard');
    onContinue();
  };

  return (
    <DottedSurface className="size-full">
      <div className="absolute inset-0 flex items-center justify-center" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_50%)]',
            'blur-[30px]',
          )}
        />
        <div className="text-center z-10">
          <h1 className="font-mono text-4xl font-semibold text-white mb-4">
            Welcome to ClassNotes AI
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Click anywhere to enter your dashboard
          </p>
        </div>
      </div>
    </DottedSurface>
  );
}