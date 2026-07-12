import type { CameraPosition } from '../types';

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatCamera(position: CameraPosition) {
  return `${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`;
}
