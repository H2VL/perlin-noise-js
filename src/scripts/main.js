import { PerlinNoise } from './perlin-noise';
import * as THREE from './three';
import { OrbitControls } from './OrbitControls';
import Stats from 'stats.js';

// stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.right = '0';
stats.dom.style.left = '';
document.body.appendChild(stats.dom);

let gridSize = 4;
let resolution = 32;
let numPixels = gridSize / resolution;
let perlinNoiseIntensity = 50;
// let colorScale = 250;
let minLayer;
let maxLayer;
let waterLayer = 20;
let snowLayer = 50;

let grid = [];

// input configs
const gridSizeInput = document.getElementById('grid-size-input');
gridSizeInput.value = gridSize;
gridSizeInput.addEventListener('change', (e) => {
  gridSize = Number(e.target.value);
  numPixels = gridSize / resolution;
});

const resolutionInput = document.getElementById('resolution-input');
resolutionInput.value = resolution;
resolutionInput.addEventListener('change', (e) => {
  resolution = Number(e.target.value);
  numPixels = gridSize / resolution;
});

const perlinNoiseIntensityInput = document.getElementById('perlin-noise-intensity-input');
perlinNoiseIntensityInput.value = perlinNoiseIntensity;
perlinNoiseIntensityInput.addEventListener('change', (e) => {
  perlinNoiseIntensity = Number(e.target.value);
});

const waterLayerInput = document.getElementById('water-layer-input');
waterLayerInput.value = waterLayer;
waterLayerInput.addEventListener('change', (e) => {
  waterLayer = Number(e.target.value);
});

const snowLayerInput = document.getElementById('snow-layer-input');
snowLayerInput.value = snowLayer;
snowLayerInput.addEventListener('change', (e) => {
  snowLayer = Number(e.target.value);
});

const threejsWrapper = document.getElementById('threejs');

let scene;
let camera;
let ambientLight;
let light;
let renderer;

// geometries
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

// materials
const stoneMaterial = new THREE.MeshPhongMaterial({ color: 'grey' });
const grassMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
const dirtMaterial = new THREE.MeshPhongMaterial({ color: 0x795548 });
const waterMaterial = new THREE.MeshPhongMaterial({ color: 'blue' });
const snowMaterial = new THREE.MeshPhongMaterial({ color: 'white' });

// var canvas = document.getElementById('myCanvas');
// canvas.width = canvas.height = 512;
// var ctx = canvas.getContext('2d');
// let pixel_size = canvas.width / RESOLUTION;
// let v = perlinNoise.perlin(x, y) * COLOR_SCALE;
// ctx.fillStyle = 'hsl(' + v + ',50%,50%)';
// ctx.fillRect((x / GRID_SIZE) * canvas.width, (y / GRID_SIZE) * canvas.height, pixel_size, pixel_size);

const clearScene = () => {
  let i = 0;
  do {
    if (scene.children[i].isMesh) {
      scene.remove(scene.children[i]);
    } else {
      i++;
    }
  } while (i < scene.children.length);
};

const generateGrid = () => {
  grid = [];
  const perlinNoise = new PerlinNoise();

  for (let y = 0; y < gridSize; y += numPixels / gridSize) {
    const row = [];
    for (let x = 0; x < gridSize; x += numPixels / gridSize) {
      const value = Math.floor(perlinNoise.perlin(x, y) * perlinNoiseIntensity);
      row.push(value);
    }
    grid.push(row);
  }

  minLayer = Math.min(...grid.map((row) => Math.min(...row)));
  maxLayer = Math.max(...grid.map((row) => Math.max(...row)));
};

const draw3DWorld = () => {
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      const value = row[j] + Math.abs(minLayer);

      let material;
      if (value >= snowLayer) {
        material = snowMaterial;
      } else if (value <= waterLayer) {
        material = waterMaterial;
      } else {
        material = [dirtMaterial, dirtMaterial, grassMaterial, dirtMaterial, dirtMaterial, dirtMaterial];
      }

      // let geometry = new THREE.BoxGeometry(1, row[j], 1);
      const cube = new THREE.Mesh(blockGeometry, material);

      cube.position.x = i;
      cube.position.z = j;

      // if the value is under the water level, increase it to the water layer
      const scale = value <= waterLayer ? waterLayer : value;

      cube.scale.set(1, scale, 1);
      cube.position.y = Math.abs(scale / 2);

      cube.receiveShadow = true;
      cube.castShadow = true;

      scene.add(cube);
    }
  }
};

const reset = () => {
  clearScene();
  generateGrid();
  draw3DWorld();
};

// create scene
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, threejsWrapper.offsetWidth / threejsWrapper.offsetHeight, 0.1, 1000);

ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
scene.add(light);

generateGrid();
draw3DWorld();

// renderer
renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(threejsWrapper.offsetWidth, threejsWrapper.offsetHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
//Lower resolution
threejsWrapper.appendChild(renderer.domElement);

// camera
camera.position.set(200, 75, 200);
camera.zoom = 1;
camera.updateProjectionMatrix();

// controls
const controls = new OrbitControls(camera, renderer.domElement);
//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {
  stats.begin();

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  renderer.render(scene, camera);

  console.log('Number of Triangles :', renderer.info.render.triangles);
  // console.log('Number of Geometries :', renderer.info.memory.geometries);

  stats.end();

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// reset on Alt + Space keys
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.code === 'Space') {
    reset();
  }
});

document.getElementById('generate-world-btn').addEventListener('click', () => reset());
