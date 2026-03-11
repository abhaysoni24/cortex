'use client';

import { signIn } from 'next-auth/react';
import { Brain } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <div className="w-full max-w-sm border-2 border-border-default bg-bg-surface p-8">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-accent-500 bg-bg-base">
            <Brain className="h-7 w-7 text-accent-500" />
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-accent-500">
            [CORTEX]
          </h1>
          <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
            Personal Work Operating System
          </p>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px w-full bg-border-default" />

        {/* Sign in button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full border-2 border-accent-500 bg-accent-500 px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-accent-400"
        >
          Sign In With Google
        </button>

        <p className="mt-4 text-center font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
          Connects Gmail + Calendar automatically
        </p>
      </div>
    </div>
  );
}
