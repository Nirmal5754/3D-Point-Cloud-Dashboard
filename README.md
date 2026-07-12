# 3D Point Cloud Dashboard

React + TypeScript + Vite dashboard for visualizing the provided 3D Bharat road point cloud dataset.

## Features

- Header, sidebar, and full-screen 3D viewer layout
- Loads the provided PLY dataset from `public/data/Road_Design_Charholi.ply`
- Falls back to the provided remote URL through a Vite dev proxy at `/point-cloud/...`
- Three.js tile-based point rendering for large point clouds
- Mouse rotate, wheel zoom, and right-drag pan through OrbitControls
- Sidebar camera controls for rotate, zoom, pan, and reset view
- Controls for point size, opacity, and background color
- Live point count, tile visibility, loading status, and camera position
- Responsive desktop and mobile layout

## Tech Stack

- React.js
- TypeScript
- Vite
- Three.js
- CSS

## Setup

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Production Build

```bash
npm run build
```

The compiled output is generated in the `dist` folder.

## Notes

The local dataset file should be placed at `public/data/Road_Design_Charholi.ply`. This keeps the browser request same-origin and avoids CORS errors. If you deploy the static build without bundling the dataset, configure the same proxy/rewrite on the hosting platform.
