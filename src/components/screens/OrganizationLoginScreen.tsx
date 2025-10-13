import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronLeftIcon, Building2Icon, Grid2x2PlusIcon, Check } from 'lucide-react';
import { Particles } from '../ui/particles';
import TypewriterText from '../ui/TypewriterText';
import { LoginWorkflow } from '../ui/LoginWorkflow';

interface OrganizationLoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
}

export function OrganizationLoginScreen({ onBack, onLogin }: OrganizationLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [showLoginWorkflow, setShowLoginWorkflow] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', { email, password });
    setShowLoginWorkflow(true);
  };

  const handleLoginWorkflowComplete = () => {
    console.log('Login workflow completed');
    onLogin();
  };

  // If login workflow is active, show it
  if (showLoginWorkflow) {
    return (
      <div className="relative w-full h-screen bg-black">
        <LoginWorkflow onComplete={handleLoginWorkflowComplete} />
      </div>
    );
  }

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
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4">
        <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10" onClick={onBack}>
          <ChevronLeftIcon className="me-1 size-4" />
          Back
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm">
          <div className="flex items-center gap-2 mb-4">
            <Grid2x2PlusIcon className="size-6 text-white" />
            <p className="text-xl font-semibold text-white">ClassNotes AI</p>
          </div>
          
          {/* Typewriter Effect Statement */}
          <div className="mb-6 text-center">
            <TypewriterText
              htmlContent="<i>Let </i><b><i>ClassNotes AI</i></b><i> Boost Your Academics</i>"
              className="text-gray-300 text-lg italic"
              speed={70}
              delay={500}
              loop={true}
              pauseTime={1500}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              type="button" 
              size="lg" 
              variant="outline" 
              className="w-full !bg-white !text-black hover:!bg-gray-100 !border-gray-200 disabled:!bg-gray-400 disabled:!text-gray-600" 
              onClick={handleLoginSubmit}
              disabled={!isAgreed}
            >
              <Building2Icon className="me-8 size-4 !text-black" />
              Login To Organisation
            </Button>
            <Button 
              type="button" 
              size="lg" 
              variant="outline" 
              className="w-full !bg-white !text-black hover:!bg-gray-100 !border-gray-200 disabled:!bg-gray-400 disabled:!text-gray-600" 
              onClick={handleLoginSubmit}
              disabled={!isAgreed}
            >
              <Building2Icon className="me-8 size-4 !text-black" />
              Register My Organisation
            </Button>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setIsAgreed(!isAgreed)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isAgreed 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-500 hover:border-blue-500'
                }`}
              >
                {isAgreed && <Check className="w-3 h-3" />}
              </button>
              <p className="text-gray-400 text-sm">
                By clicking on the above tick mark, you agree to our{' '}
                <button
                  onClick={() => console.log('Terms of Service clicked')}
                  className="bg-blue-900 text-blue-300 hover:bg-blue-800 hover:text-blue-200 px-2 py-1 rounded text-sm font-medium transition-colors border border-blue-700"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  onClick={() => console.log('Privacy Policy clicked')}
                  className="bg-blue-900 text-blue-300 hover:bg-blue-800 hover:text-blue-200 px-2 py-1 rounded text-sm font-medium transition-colors border border-blue-700"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
