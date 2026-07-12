import { Activity } from 'lucide-react';
import type { LoadingState } from '../types';

type HeaderProps = {
  statusText: string;
  status: LoadingState;
};

export default function Header({ statusText, status }: HeaderProps) {
  return (
    <header className="flex min-h-[76px] flex-col items-start justify-between gap-3 border-b border-violet-400/20 bg-[#090d20]/95 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg border border-white/15 bg-gradient-to-br from-pink-500/25 via-violet-500/20 to-cyan-400/25 shadow-[0_0_22px_rgba(139,92,246,0.28)] [perspective:180px]">
          <div className="animate-brand-cube relative h-[21px] w-[21px] [transform-style:preserve-3d]" aria-hidden="true">
            <span className="absolute inset-0 rounded border border-white/45 bg-gradient-to-br from-pink-500 to-violet-500 [transform:translateZ(10px)]" />
            <span className="absolute inset-0 rounded border border-white/45 bg-gradient-to-br from-cyan-400 to-emerald-400 [transform:rotateX(90deg)_translateZ(10px)]" />
            <span className="absolute inset-0 rounded border border-white/45 bg-gradient-to-br from-orange-400 to-blue-500 [transform:rotateY(90deg)_translateZ(10px)]" />
          </div>
        </div>
        <h1 className="break-words text-[1.2rem] font-bold leading-tight text-slate-50 sm:text-[1.35rem]">
          Point Cloud Dashboard
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div
          className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3 text-sm font-bold whitespace-nowrap ${
            status === 'ready'
              ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300'
              : status === 'loading'
                ? 'border-amber-300/35 bg-amber-300/10 text-amber-300'
                : status === 'error'
                  ? 'border-rose-400/35 bg-rose-400/10 text-rose-300'
                  : 'border-violet-300/25 bg-violet-400/10 text-violet-200'
          }`}
          aria-label="Loading status"
        >
          <Activity size={16} className={status === 'loading' ? 'animate-pulse' : undefined} />
          <span>{statusText}</span>
        </div>
      </div>
    </header>
  );
}
