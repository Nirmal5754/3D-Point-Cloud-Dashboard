import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CircleDot,
  Database,
  Layers3,
  Minus,
  Palette,
  Plus,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { formatCamera, formatNumber } from '../utils/format';
import type { ViewerCommand, ViewerSettings, ViewerStats } from '../types';

type SidebarProps = {
  settings: ViewerSettings;
  stats: ViewerStats;
  onSettingsChange: (settings: ViewerSettings) => void;
  onViewerCommand: (command: ViewerCommand) => void;
};

const backgrounds = ['#020617', '#0c1024', '#111827', '#050505'];

const panelClass =
  'rounded-lg border border-violet-300/15 bg-slate-900/75 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.2)] backdrop-blur-sm';
const iconButtonClass =
  'inline-flex min-h-[38px] min-w-0 items-center justify-center gap-2 rounded-lg border border-violet-300/25 bg-gradient-to-br from-pink-500/15 via-violet-500/15 to-cyan-500/15 px-2.5 font-bold text-slate-50 transition duration-150 hover:-translate-y-px hover:border-cyan-300/60 hover:from-pink-500/25 hover:via-violet-500/25 hover:to-cyan-500/25 active:translate-y-0';

export default function Sidebar({
  settings,
  stats,
  onSettingsChange,
  onViewerCommand,
}: SidebarProps) {
  const statusClass =
    stats.status === 'ready'
      ? 'text-emerald-300'
      : stats.status === 'loading'
        ? 'text-amber-300'
        : stats.status === 'error'
          ? 'text-rose-300'
          : 'text-violet-200';

  return (
    <aside className="order-2 flex min-h-0 flex-col gap-3.5 overflow-y-auto border-t border-violet-400/20 bg-[#080d1d]/95 p-4 lg:order-none lg:border-t-0 lg:border-r">
      <section className={panelClass}>
        <div className="mb-3.5 flex items-center gap-2 text-cyan-300">
          <Database size={18} />
          <h2 className="text-[0.98rem] font-bold text-slate-50">Dataset</h2>
        </div>
        <dl className="grid gap-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <dt className="text-sm text-slate-400">Total points</dt>
            <dd className="m-0 text-right text-sm font-extrabold text-slate-50">
              {formatNumber(stats.totalPoints)}
            </dd>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <dt className="text-sm text-slate-400">Loading status</dt>
            <dd className={`m-0 break-words text-right text-sm font-extrabold ${statusClass}`}>
              {stats.message}
            </dd>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <dt className="text-sm text-slate-400">Tile visibility</dt>
            <dd className="m-0 text-right text-sm font-extrabold text-slate-50">
              {stats.visibleTiles}/{stats.totalTiles}
            </dd>
          </div>
        </dl>
      </section>

      <section className={panelClass}>
        <div className="mb-3.5 flex items-center gap-2 text-pink-300">
          <CircleDot size={18} />
          <h2 className="text-[0.98rem] font-bold text-slate-50">Render Controls</h2>
        </div>

        <label className="grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2.5">
          <span className="text-sm text-slate-400">Point size</span>
          <strong className="text-sm text-slate-100">{settings.pointSize.toFixed(3)}</strong>
          <input
            className="col-span-2 w-full accent-fuchsia-400"
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={settings.pointSize}
            onChange={(event) =>
              onSettingsChange({ ...settings, pointSize: Number(event.target.value) })
            }
          />
        </label>

        <label className="mt-4 grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-2.5">
          <span className="text-sm text-slate-400">Opacity</span>
          <strong className="text-sm text-slate-100">{Math.round(settings.opacity * 100)}%</strong>
          <input
            className="col-span-2 w-full accent-cyan-400"
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={settings.opacity}
            onChange={(event) =>
              onSettingsChange({ ...settings, opacity: Number(event.target.value) })
            }
          />
        </label>

        <div className="mt-4 grid gap-2.5" aria-label="Background color">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Palette size={16} className="text-violet-300" />
            <span>Background</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {backgrounds.map((color) => (
              <button
                key={color}
                className={`h-[38px] w-[38px] cursor-pointer rounded-lg border-2 transition hover:-translate-y-px hover:border-cyan-300 ${
                  settings.backgroundColor === color
                    ? 'border-pink-300 shadow-[0_0_0_3px_rgba(217,70,239,0.2)]'
                    : 'border-violet-200/20'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Set background ${color}`}
                title={color}
                onClick={() => onSettingsChange({ ...settings, backgroundColor: color })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <div className="mb-3.5 flex items-center gap-2 text-violet-300">
          <Camera size={18} />
          <h2 className="text-[0.98rem] font-bold text-slate-50">Camera</h2>
        </div>
        <p className="mb-3 break-words rounded-lg border border-violet-200/15 bg-slate-950/65 px-3 py-2.5 font-mono text-sm text-slate-100">
          {formatCamera(stats.camera)}
        </p>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-cyan-300/35 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-violet-500/15 font-extrabold text-slate-50 transition hover:-translate-y-px hover:border-pink-300/70 hover:from-cyan-500/25 hover:via-blue-500/25 hover:to-pink-500/25 active:translate-y-0"
          onClick={() => onViewerCommand('reset')}
        >
          Reset view
        </button>
      </section>

      <section className={panelClass}>
        <div className="mb-3.5 flex items-center gap-2 text-blue-300">
          <Layers3 size={18} />
          <h2 className="text-[0.98rem] font-bold text-slate-50">Interactions</h2>
        </div>

        <div className="grid gap-2.5">
          <div className="text-sm font-extrabold text-slate-400">Rotate</div>
          <div className="grid grid-cols-2 gap-2">
            <button className={iconButtonClass} onClick={() => onViewerCommand('rotate-left')} title="Rotate left">
              <RotateCcw size={18} className="text-pink-300" /><span>Left</span>
            </button>
            <button className={iconButtonClass} onClick={() => onViewerCommand('rotate-right')} title="Rotate right">
              <RotateCw size={18} className="text-violet-300" /><span>Right</span>
            </button>
            <button className={iconButtonClass} onClick={() => onViewerCommand('rotate-up')} title="Rotate up">
              <ArrowUp size={18} className="text-cyan-300" /><span>Up</span>
            </button>
            <button className={iconButtonClass} onClick={() => onViewerCommand('rotate-down')} title="Rotate down">
              <ArrowDown size={18} className="text-blue-300" /><span>Down</span>
            </button>
          </div>
        </div>

        <div className="mt-3.5 grid gap-2.5">
          <div className="text-sm font-extrabold text-slate-400">Zoom</div>
          <div className="grid grid-cols-2 gap-2">
            <button className={iconButtonClass} onClick={() => onViewerCommand('zoom-in')} title="Zoom in">
              <Plus size={18} className="text-pink-300" /><span>In</span>
            </button>
            <button className={iconButtonClass} onClick={() => onViewerCommand('zoom-out')} title="Zoom out">
              <Minus size={18} className="text-cyan-300" /><span>Out</span>
            </button>
          </div>
        </div>

        <div className="mt-3.5 grid gap-2.5">
          <div className="text-sm font-extrabold text-slate-400">Pan</div>
          <div className="grid grid-cols-3 gap-2 justify-start">
            <span />
            <button className={`${iconButtonClass} w-[38px] px-0`} onClick={() => onViewerCommand('pan-up')} title="Pan up"><ArrowUp size={18} className="text-pink-300" /></button>
            <span />
            <button className={`${iconButtonClass} w-[38px] px-0`} onClick={() => onViewerCommand('pan-left')} title="Pan left"><ArrowLeft size={18} className="text-violet-300" /></button>
            <button className={`${iconButtonClass} w-[38px] px-0`} onClick={() => onViewerCommand('pan-down')} title="Pan down"><ArrowDown size={18} className="text-cyan-300" /></button>
            <button className={`${iconButtonClass} w-[38px] px-0`} onClick={() => onViewerCommand('pan-right')} title="Pan right"><ArrowRight size={18} className="text-blue-300" /></button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-3.5 gap-y-2.5 text-sm">
          <span className="text-slate-400">Drag</span><strong className="text-slate-100">Rotate</strong>
          <span className="text-slate-400">Wheel</span><strong className="text-slate-100">Zoom</strong>
          <span className="text-slate-400">Right drag</span><strong className="text-slate-100">Pan</strong>
        </div>
      </section>
    </aside>
  );
}
