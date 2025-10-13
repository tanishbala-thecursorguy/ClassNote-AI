import React, { useEffect, useRef, useState } from 'react';
import { LoginWorkflow } from './LoginWorkflow';

interface LoginWithBackgroundProps {
  onComplete: () => void;
}

export const LoginWithBackground = ({ onComplete }: LoginWithBackgroundProps) => {
  return (
    <div className="relative w-full h-screen bg-black">
      <LoginWorkflow onComplete={onComplete} />
    </div>
  );
};
