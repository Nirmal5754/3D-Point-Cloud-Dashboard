import { useMemo, useState } from 'react';
import Header from './components/Header';
import PointCloudViewer from './components/PointCloudViewer';
import Sidebar from './components/Sidebar';
import { INITIAL_SETTINGS } from './constants';
import type { ViewerCommand, ViewerSettings, ViewerStats } from './types';

const initialStats: ViewerStats = {
  totalPoints: 0,
  visibleTiles: 0,
  totalTiles: 0,
  camera: { x: 0, y: 0, z: 0 },
  status: 'idle',
  message: 'Idle',
};

function App() {
  const [settings, setSettings] = useState<ViewerSettings>(INITIAL_SETTINGS);
  const [stats, setStats] = useState<ViewerStats>(initialStats);
  const [viewerCommand, setViewerCommand] = useState<{ id: number; action: ViewerCommand } | null>(
    null,
  );

  const runViewerCommand = (action: ViewerCommand) => {
    setViewerCommand((current) => ({ id: (current?.id ?? 0) + 1, action }));
  };

  const statusText = useMemo(() => {
    if (stats.status === 'ready') return 'Ready';
    if (stats.status === 'loading') return 'Loading';
    if (stats.status === 'error') return 'Dataset error';
    return 'Idle';
  }, [stats.status]);

  return (
    <main className="grid h-full w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#050816] text-slate-100">
      <Header statusText={statusText} status={stats.status} />
      <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <Sidebar
          settings={settings}
          stats={stats}
          onSettingsChange={setSettings}
          onViewerCommand={runViewerCommand}
        />
        <section className="relative min-h-[58vh] min-w-0 overflow-hidden lg:min-h-0" aria-label="3D point cloud viewer">
          <PointCloudViewer
            settings={settings}
            command={viewerCommand}
            onStatsChange={setStats}
          />
          {stats.status !== 'ready' && (
            <div
              className={`absolute inset-0 z-10 grid place-items-center content-center gap-5 bg-slate-950/80 p-6 backdrop-blur-sm ${
                stats.status === 'error' ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              <div className="relative grid h-28 w-28 place-items-center [perspective:520px]" aria-hidden="true">
                <div className="animate-loader-cube relative h-[58px] w-[58px] [transform-style:preserve-3d]">
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-pink-500/90 to-violet-500/85 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:translateZ(29px)]" />
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-cyan-400/85 to-emerald-400/80 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:rotateY(180deg)_translateZ(29px)]" />
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-blue-400/85 to-indigo-500/80 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:rotateY(90deg)_translateZ(29px)]" />
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-orange-400/85 to-pink-500/80 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:rotateY(-90deg)_translateZ(29px)]" />
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-emerald-400/90 to-cyan-400/80 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:rotateX(90deg)_translateZ(29px)]" />
                  <span className="absolute inset-0 border border-white/35 bg-gradient-to-br from-violet-500/80 to-orange-400/80 shadow-[inset_0_0_18px_rgba(255,255,255,0.16)] [transform:rotateX(-90deg)_translateZ(29px)]" />
                </div>
                <div className="animate-loader-orbit absolute h-[104px] w-[104px] rounded-full border border-cyan-300/40 border-r-emerald-300/85 border-t-pink-400/90 [transform:rotateX(68deg)]" />
              </div>
              <div className="grid gap-1.5 text-center">
                <strong className="text-base text-slate-50">
                  {stats.status === 'error' ? 'Dataset load failed' : 'Building point cloud'}
                </strong>
                <span className="text-sm font-bold text-current">{stats.message}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
