import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from '@/lib/utils';

interface DottedSurfaceDemoProps {
  onContinue: () => void;
}

export function DottedSurfaceDemo({ onContinue }: DottedSurfaceDemoProps) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <DottedSurface className="size-full" />
      <div className="absolute inset-0 flex items-center justify-center">
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
            Click anywhere to continue to your dashboard
          </p>
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
