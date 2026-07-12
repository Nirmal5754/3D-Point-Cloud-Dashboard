import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { POINT_CLOUD_URLS, TILE_SIZE } from '../constants';
import type { ViewerCommand, ViewerSettings, ViewerStats } from '../types';

type PointCloudViewerProps = {
  settings: ViewerSettings;
  command: { id: number; action: ViewerCommand } | null;
  onStatsChange: (stats: ViewerStats) => void;
};

type SceneState = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  tiles: THREE.Points[];
  material: THREE.PointsMaterial;
  animationId: number;
  initialCamera: THREE.Vector3;
  initialTarget: THREE.Vector3;
};

const emptyStats: ViewerStats = {
  totalPoints: 0,
  visibleTiles: 0,
  totalTiles: 0,
  camera: { x: 0, y: 0, z: 0 },
  status: 'idle',
  message: 'Idle',
};

function splitIntoTiles(source: THREE.BufferGeometry, material: THREE.PointsMaterial) {
  const position = source.getAttribute('position') as THREE.BufferAttribute;
  const color = source.getAttribute('color') as THREE.BufferAttribute | undefined;
  const totalPoints = position.count;
  const tiles: THREE.Points[] = [];

  for (let start = 0; start < totalPoints; start += TILE_SIZE) {
    const end = Math.min(start + TILE_SIZE, totalPoints);
    const count = end - start;
    const geometry = new THREE.BufferGeometry();
    const positions = position.array.subarray(start * 3, end * 3) as Float32Array;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    if (color) {
      const colors = color.array.subarray(start * 3, end * 3) as Float32Array;
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    geometry.computeBoundingSphere();
    tiles.push(new THREE.Points(geometry, material));
  }

  source.dispose();
  return { tiles, totalPoints };
}

async function fetchFirstAvailable(urls: string[], onProgress: (message: string) => void) {
  const errors: string[] = [];

  for (const url of urls) {
    try {
      onProgress(`Loading ${url.includes('/data/') ? 'local dataset' : 'remote dataset'}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const total = Number(response.headers.get('content-length')) || 0;
      if (!response.body || total === 0) {
        return await response.arrayBuffer();
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      let lastPercent = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          const percent = Math.round((received / total) * 100);
          if (percent === 100 || percent - lastPercent >= 5) {
            lastPercent = percent;
            onProgress(`Downloading ${percent}%`);
          }
        }
      }

      const buffer = new Uint8Array(received);
      let offset = 0;
      chunks.forEach((chunk) => {
        buffer.set(chunk, offset);
        offset += chunk.length;
      });
      return buffer.buffer;
    } catch (error) {
      errors.push(`${url}: ${(error as Error).message}`);
    }
  }

  throw new Error(`Unable to load point cloud. ${errors.join(' | ')}`);
}

function fitCameraToTiles(state: SceneState) {
  const bounds = new THREE.Box3();
  state.tiles.forEach((tile) => bounds.expandByObject(tile));

  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxDimension * 1.35;

  state.controls.target.copy(center);
  state.camera.position.set(center.x + distance, center.y + distance * 0.65, center.z + distance);
  state.camera.near = Math.max(0.01, distance / 10000);
  state.camera.far = distance * 12;
  state.camera.updateProjectionMatrix();
  state.controls.update();

  state.initialCamera.copy(state.camera.position);
  state.initialTarget.copy(state.controls.target);

}

function countVisibleTiles(state: SceneState) {
  const projection = new THREE.Matrix4().multiplyMatrices(
    state.camera.projectionMatrix,
    state.camera.matrixWorldInverse,
  );
  const frustum = new THREE.Frustum().setFromProjectionMatrix(projection);

  return state.tiles.reduce((visible, tile) => {
    const sphere = tile.geometry.boundingSphere;
    if (!sphere) return visible;
    const worldSphere = sphere.clone().applyMatrix4(tile.matrixWorld);
    return frustum.intersectsSphere(worldSphere) ? visible + 1 : visible;
  }, 0);
}

function rotateCamera(state: SceneState, thetaDelta: number, phiDelta: number) {
  const offset = state.camera.position.clone().sub(state.controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  spherical.theta += thetaDelta;
  spherical.phi = THREE.MathUtils.clamp(spherical.phi + phiDelta, 0.08, Math.PI - 0.08);
  state.camera.position.copy(state.controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
  state.controls.update();
}

function zoomCamera(state: SceneState, scale: number) {
  const offset = state.camera.position.clone().sub(state.controls.target);
  const nextDistance = THREE.MathUtils.clamp(offset.length() * scale, 0.2, 100000);
  offset.setLength(nextDistance);
  state.camera.position.copy(state.controls.target).add(offset);
  state.controls.update();
}

function panCamera(state: SceneState, xDirection: number, yDirection: number) {
  const distance = state.camera.position.distanceTo(state.controls.target);
  const panAmount = distance * 0.08;
  const forward = state.controls.target.clone().sub(state.camera.position).normalize();
  const right = new THREE.Vector3().crossVectors(forward, state.camera.up).normalize();
  const up = state.camera.up.clone().normalize();
  const pan = right.multiplyScalar(xDirection * panAmount).add(up.multiplyScalar(yDirection * panAmount));

  state.camera.position.add(pan);
  state.controls.target.add(pan);
  state.controls.update();
}

function resetCamera(state: SceneState) {
  state.camera.position.copy(state.initialCamera);
  state.controls.target.copy(state.initialTarget);
  state.controls.update();
}

function runCommand(state: SceneState, action: ViewerCommand) {
  const rotateStep = THREE.MathUtils.degToRad(12);

  switch (action) {
    case 'rotate-left':
      rotateCamera(state, -rotateStep, 0);
      break;
    case 'rotate-right':
      rotateCamera(state, rotateStep, 0);
      break;
    case 'rotate-up':
      rotateCamera(state, 0, -rotateStep);
      break;
    case 'rotate-down':
      rotateCamera(state, 0, rotateStep);
      break;
    case 'zoom-in':
      zoomCamera(state, 0.78);
      break;
    case 'zoom-out':
      zoomCamera(state, 1.28);
      break;
    case 'pan-left':
      panCamera(state, -1, 0);
      break;
    case 'pan-right':
      panCamera(state, 1, 0);
      break;
    case 'pan-up':
      panCamera(state, 0, 1);
      break;
    case 'pan-down':
      panCamera(state, 0, -1);
      break;
    case 'reset':
      resetCamera(state);
      break;
  }
}

export default function PointCloudViewer({
  settings,
  command,
  onStatsChange,
}: PointCloudViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<SceneState | null>(null);
  const totalsRef = useRef({ totalPoints: 0, totalTiles: 0 });
  const loadingRef = useRef(emptyStats);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 10000);
    const controls = new OrbitControls(camera, renderer.domElement);
    const material = new THREE.PointsMaterial({
      size: settings.pointSize,
      opacity: settings.opacity,
      transparent: settings.opacity < 1,
      depthWrite: settings.opacity >= 1,
      color: 0xffffff,
      vertexColors: false,
      sizeAttenuation: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.sortObjects = false;
    renderer.setClearColor(settings.backgroundColor);
    container.appendChild(renderer.domElement);

    camera.position.set(18, 14, 18);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    const state: SceneState = {
      camera,
      controls,
      scene,
      renderer,
      tiles: [],
      material,
      animationId: 0,
      initialCamera: camera.position.clone(),
      initialTarget: controls.target.clone(),
    };
    stateRef.current = state;
    let lastStatsAt = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const publishStats = (message = loadingRef.current.message, force = false) => {
      const now = performance.now();
      if (!force && now - lastStatsAt < 250) return;
      lastStatsAt = now;

      const visibleTiles = countVisibleTiles(state);
      onStatsChange({
        totalPoints: totalsRef.current.totalPoints,
        visibleTiles,
        totalTiles: totalsRef.current.totalTiles,
        camera: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        },
        status: loadingRef.current.status,
        message,
      });
    };

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      publishStats();
      state.animationId = window.requestAnimationFrame(animate);
    };

    resize();
    loadingRef.current = { ...emptyStats, status: 'loading', message: 'Loading point cloud' };
    onStatsChange(loadingRef.current);
    animate();

    fetchFirstAvailable(POINT_CLOUD_URLS, (message) => {
      loadingRef.current = { ...loadingRef.current, message };
      publishStats(message);
    })
      .then((buffer) => {
        const loader = new PLYLoader();
        const geometry = loader.parse(buffer);
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();

        material.vertexColors = Boolean(geometry.getAttribute('color'));
        material.needsUpdate = true;

        const { tiles, totalPoints } = splitIntoTiles(geometry, material);
        tiles.forEach((tile) => scene.add(tile));
        state.tiles = tiles;
        totalsRef.current = { totalPoints, totalTiles: tiles.length };
        fitCameraToTiles(state);
        loadingRef.current = {
          ...loadingRef.current,
          status: 'ready',
          message: 'Dataset ready',
        };
        publishStats('Dataset ready', true);
      })
      .catch((error: Error) => {
        loadingRef.current = {
          ...loadingRef.current,
          status: 'error',
          message: error.message,
        };
        publishStats(error.message, true);
      });

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(state.animationId);
      controls.dispose();
      material.dispose();
      state.tiles.forEach((tile) => {
        tile.geometry.dispose();
        scene.remove(tile);
      });
      renderer.dispose();
      renderer.domElement.remove();
      stateRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    state.material.size = settings.pointSize;
    state.material.opacity = settings.opacity;
    state.material.transparent = settings.opacity < 1;
    state.material.depthWrite = settings.opacity >= 1;
    state.material.needsUpdate = true;
    state.renderer.setClearColor(settings.backgroundColor);
  }, [settings]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state || !command) return;
    runCommand(state, command.action);
  }, [command]);

  return <div ref={containerRef} className="h-full w-full [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full" />;
}
