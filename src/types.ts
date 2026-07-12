export type LoadingState = 'idle' | 'loading' | 'ready' | 'error';

export type CameraPosition = {
  x: number;
  y: number;
  z: number;
};

export type ViewerStats = {
  totalPoints: number;
  visibleTiles: number;
  totalTiles: number;
  camera: CameraPosition;
  status: LoadingState;
  message: string;
};

export type ViewerSettings = {
  pointSize: number;
  opacity: number;
  backgroundColor: string;
};

export type ViewerCommand =
  | 'rotate-left'
  | 'rotate-right'
  | 'rotate-up'
  | 'rotate-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
  | 'pan-down'
  | 'reset';
