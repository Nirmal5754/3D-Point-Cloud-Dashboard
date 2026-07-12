# 3D Point Cloud Dashboard

A high-performance React, TypeScript, and Vite-based web application designed to smoothly visualize massive 3D spatial infrastructure datasets[cite: 11, 22]. This project was built as a technical assessment solution for the Front-End Developer (React) position[cite: 21, 22].

---

## 🛠️ Step-by-Step Local Setup Instructions

Follow these instructions to clone, install, and execute the project on your local machine:

### 1. Prerequisites

Ensure you have **Node.js** installed on your machine (version 18.0.0 or higher is recommended).

### 2. Navigate to the Project Root

Open your terminal or command prompt and change directories into the project root folder:

```bash
cd company_task
```

3. Install Dependencies Run the package manager installation to download all required libraries, including React, Three.js, and Tailwind CSS:  
```bash
npm install
 ```
4. Run the Local Development ServerExecute the Vite build tool system to launch the application locally:  
```bash 
npm run dev 
```
5. Open the Application UI
Once the terminal outputs the local address, open your web browser and navigate to:
http://localhost:5173




🚀 Intelligent Dataset Loading & Remote Fallback Architecture
To manage heavy 3D engineering files responsibly without bloating repository histories or exceeding upload constraints, the architecture utilizes a dual-layered, fail-safe network asset system:

Local Same-Origin Target: The dashboard automatically attempts to locate the dataset locally under public/data/Road_Design_Charholi.ply.

Automated Asynchronous Streaming Proxy: If the dataset isn't bundled locally, the system activates an asynchronous stream reader (fetchFirstAvailable). It automatically pulls the 3D asset from the official remote repository (https://edu.3dbharat.com/storage/road/Road Design Charholi.ply) via a Vite proxy rewrite, managing raw array binary chunking seamlessly while evading browser CORS constraints.

📈 Key Performance & Architecture FeaturesTile-Based Chunk Rendering: To maintain stable frame rates, the parsed PLY structure is segmented into independent micro-geometries capped at 65,000 points per tile (TILE_SIZE), preventing CPU bottlenecks.Dynamic Camera Frustum Culling: An optimization routine computes camera projection matrices on animation loops, evaluating structural bounding spheres against the active viewpoint frustum to track visible versus loaded rendering tiles in real time.Telemetry Control Panel: The UI features a real-time sidebar displaying live point counts, active tile visibility ratios, downloading progress states, and continuous coordinate tracking ($x, y, z$) of the camera target.Interactive Viewport Tools:Full canvas mouse navigation driven by OrbitControls (Left-click drag to orbit, scroll to zoom, right-drag to pan).Custom sidebar buttons tracking exact camera action vectors (ViewerCommand) for fixed programmatic panning, directional rotations, standard zooming, and baseline view resets.Live Material Adjustments: Immediate operational sliders adjusting hardware-accelerated point size dimensions, transparent viewport opacity blending layers, and clean UI canvas background color matching toggles.

💻 Technical Stack
Core Framework: React 18 (Strict Mode enabled)

Language Layer: TypeScript (Strict type checks, explicit interfaces)

Styles & Animation: Tailwind CSS (v4 architecture with custom 3D hardware-accelerated loader keyframes)

3D Visualizations: Three.js Core WebGL Engine, OrbitControls, PLYLoader

Build Optimization: Vite Asset Bundler 

