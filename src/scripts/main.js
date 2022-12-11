import { PerlinNoise } from './perlin-noise';
import * as THREE from './three';
import { OrbitControls } from './OrbitControls';

const GRID_SIZE = 5;
const RESOLUTION = 16;
const NUM_PIXELS = GRID_SIZE / RESOLUTION;
const COLOR_SCALE = 250;

let scene;
let camera;
let ambientLight;
let light;

let renderer;

const stoneMaterial = new THREE.MeshPhongMaterial({ color: 'grey' });
const grassMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
const waterMaterial = new THREE.MeshPhongMaterial({ color: 'blue' });
const snowMaterial = new THREE.MeshPhongMaterial({ color: 'white' });

let grid = [];

// var canvas = document.getElementById('myCanvas');
// canvas.width = canvas.height = 512;
// var ctx = canvas.getContext('2d');
// let pixel_size = canvas.width / RESOLUTION;
// let v = perlinNoise.perlin(x, y) * COLOR_SCALE;
// ctx.fillStyle = 'hsl(' + v + ',50%,50%)';
// ctx.fillRect((x / GRID_SIZE) * canvas.width, (y / GRID_SIZE) * canvas.height, pixel_size, pixel_size);

const shouldDrawBlock = (x, z, layer) => {
  const value = grid[x][z];
  // console.log(value);

  let neighbors = [];
  if (x > 0) {
    neighbors.push(grid[x - 1][z]);
  }
  if (x < grid.length - 1) {
    neighbors.push(grid[x + 1][z]);
  }
  if (z > 0) {
    neighbors.push(grid[x][z - 1]);
  }
  if (z < grid.length - 1) {
    neighbors.push(grid[x][z + 1]);
  }

  const visibleByNeighbors = value >= layer && neighbors.map((neighbor) => neighbor < layer).some((x) => x);

  return (
    visibleByNeighbors ||
    value === layer ||
    (x === 0 && value >= layer) ||
    (z === 0 && value >= layer) ||
    layer === 0 ||
    (x === grid.length - 1 && value >= layer) ||
    (z === grid.length - 1 && value >= layer)
  );
};

const createScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);
};

const clearScene = () => {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
};

const generateWorld = () => {
  grid = [];
  const perlinNoise = new PerlinNoise();

  for (let y = 0; y < GRID_SIZE; y += NUM_PIXELS / GRID_SIZE) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x += NUM_PIXELS / GRID_SIZE) {
      const value = Math.floor(perlinNoise.perlin(x, y) * 20);
      row.push(value);
    }
    grid.push(row);
  }
  const mins = grid.map((row) => Math.min(...row));
  const min = Math.min(...mins);

  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      row[j] += Math.abs(min) + 1;
    }
  }
};

const draw3DWorld = () => {
  let layer = 0;

  do {
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      for (let j = 0; j < row.length; j++) {
        if (shouldDrawBlock(i, j, layer)) {
          const geometry = new THREE.BoxGeometry(1, 1, 1);

          let material;
          if (layer > 20) {
            material = snowMaterial;
          } else if (layer > 0 && layer <= 5 && i !== 0 && j !== 0 && i !== grid.length - 1 && j !== grid.length - 1) {
            material = waterMaterial;
          } else if (row[j] === layer) {
            material = grassMaterial;
          } else {
            material = stoneMaterial;
          }

          const cube = new THREE.Mesh(geometry, material);
          cube.receiveShadow = true;
          cube.castShadow = true;

          cube.position.x = i;
          cube.position.z = j;
          cube.position.y = layer;

          scene.add(cube);
        }
      }
    }
    layer += 1;
  } while (layer < 30);
};

createScene();
generateWorld();
draw3DWorld();

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(90, 55, 99);
camera.zoom = 1;
camera.updateProjectionMatrix();

controls.update();

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.altKey) {
    console.log('refresh world');
  }
});

function animate() {
  requestAnimationFrame(animate);
  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  renderer.render(scene, camera);
}
animate();
