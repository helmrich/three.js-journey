import * as dat from 'lil-gui';
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/**
 * Loaders
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const global = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
// Wood cabinet
const woodCabinetAmbientRoughnessMetalnessTexture = textureLoader.load(
  '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg',
);
const woodCabinetNormalTexture = textureLoader.load(
  '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png',
);
const woodCabinetColorTexture = textureLoader.load(
  '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg',
);
woodCabinetColorTexture.colorSpace = THREE.SRGBColorSpace;

// Castle brick
const castleBrickAmbientRoughnessMetalnessTexture = textureLoader.load(
  '/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg',
);
const castleBrickNormalTexture = textureLoader.load(
  '/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png',
);
const castleBrickColorTexture = textureLoader.load(
  '/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg',
);
castleBrickColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      // Env map intensity
      child.material.envMapIntensity = global.envMapIntensity;

      // Shadows
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
// Global intensity
global.envMapIntensity = 1;
gui
  .add(global, 'envMapIntensity')
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = environmentMap;
  scene.environment = environmentMap;
});

/**
 * Directional Light
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2);
directionalLight.position.set(-4, 6.5, 2.5);
scene.add(directionalLight);

gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('lightIntensity');
gui
  .add(directionalLight.position, 'x')
  .min(-10)
  .max(10)
  .step(0.001)
  .name('lightX');
gui
  .add(directionalLight.position, 'y')
  .min(-10)
  .max(10)
  .step(0.001)
  .name('lightY');
gui
  .add(directionalLight.position, 'z')
  .min(-10)
  .max(10)
  .step(0.001)
  .name('lightZ');

// Shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(512, 512);
directionalLight.shadow.bias = -0.004;
directionalLight.shadow.normalBias = 0.027;

gui.add(directionalLight, 'castShadow');
gui.add(directionalLight.shadow, 'normalBias').min(-0.05).max(0.05).step(0.001);
gui.add(directionalLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001);

// Helper
// const directionalLightHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera,
// );
// scene.add(directionalLightHelper);

// Target
directionalLight.target.position.set(0, 4, 0);
directionalLight.target.updateWorldMatrix();

/**
 * Floor and Wall
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    aoMap: woodCabinetAmbientRoughnessMetalnessTexture,
    roughnessMap: woodCabinetAmbientRoughnessMetalnessTexture,
    metalnessMap: woodCabinetAmbientRoughnessMetalnessTexture,
    map: woodCabinetColorTexture,
    normalMap: woodCabinetNormalTexture,
    side: THREE.DoubleSide,
  }),
);
floor.position.y = -0.001;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    aoMap: castleBrickAmbientRoughnessMetalnessTexture,
    roughnessMap: castleBrickAmbientRoughnessMetalnessTexture,
    metalnessMap: castleBrickAmbientRoughnessMetalnessTexture,
    map: castleBrickColorTexture,
    normalMap: castleBrickNormalTexture,
    side: THREE.DoubleSide,
  }),
);
wall.position.y = 4;
wall.position.z = -4;
scene.add(wall);

/**
 * Models
 */
// Helmet
// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
//   gltf.scene.scale.set(10, 10, 10);
//   scene.add(gltf.scene);

//   updateAllMaterials();
// });

// Hamburger
gltfLoader.load('/models/hamburger.glb', (gltf) => {
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(0, 2.5, 0);
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(4, 5, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tone mapping
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

gui.add(renderer, 'toneMapping', {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

// Physically accurate lighting
renderer.useLegacyLights = false;
gui.add(renderer, 'useLegacyLights');

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();