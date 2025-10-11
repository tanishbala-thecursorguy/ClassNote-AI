import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, Building2Icon, Grid2x2PlusIcon } from 'lucide-react';
import { Particles } from '@/components/ui/particles';

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
			<div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4">
				<Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10" onClick={onBack}>
					<ChevronLeftIcon className="me-1 size-4" />
					Back
				</Button>

				<div className="mx-auto space-y-4 sm:w-sm">
					<div className="flex items-center gap-2">
						<Grid2x2PlusIcon className="size-6 text-white" />
						<p className="text-xl font-semibold text-white">ClassNote AI</p>
					</div>
					<div className="flex flex-col space-y-1">
						<h1 className="font-heading text-2xl font-bold tracking-wide text-white">
							Login to Organisation
						</h1>
						<p className="text-gray-400 text-base">
							Register My Organisation
						</p>
					</div>
					<div className="space-y-2">
						<Button type="button" size="lg" variant="outline" className="w-full !bg-white !text-black hover:!bg-gray-100 !border-gray-200" onClick={onLogin}>
							<Building2Icon className="me-8 size-4 !text-black" />
							Login To Organisation
						</Button>
						<Button type="button" size="lg" variant="outline" className="w-full !bg-white !text-black hover:!bg-gray-100 !border-gray-200" onClick={onLogin}>
							<Building2Icon className="me-8 size-4 !text-black" />
							Register My Organisation
						</Button>
					</div>
					<p className="text-gray-400 mt-8 text-sm">
						By clicking continue, you agree to our{' '}
						<a
							href="#"
							className="hover:text-blue-400 underline underline-offset-4"
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href="#"
							className="hover:text-blue-400 underline underline-offset-4"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
