import { PerlinNoise } from './perlin-noise';

const GRID_SIZE = 4;
const RESOLUTION = 8;
const COLOR_SCALE = 250;

var canvas = document.getElementById('myCanvas');
canvas.width = canvas.height = 512;
var ctx = canvas.getContext('2d');

let pixel_size = canvas.width / RESOLUTION;
let num_pixels = GRID_SIZE / RESOLUTION;

const perlinNoise = new PerlinNoise();

for (let y = 0; y < GRID_SIZE; y += num_pixels / GRID_SIZE) {
  for (let x = 0; x < GRID_SIZE; x += num_pixels / GRID_SIZE) {
    let v = perlinNoise.perlin(x, y) * COLOR_SCALE;
    ctx.fillStyle = 'hsl(' + v + ',50%,50%)';
    ctx.fillRect((x / GRID_SIZE) * canvas.width, (y / GRID_SIZE) * canvas.height, pixel_size, pixel_size);
  }
}
