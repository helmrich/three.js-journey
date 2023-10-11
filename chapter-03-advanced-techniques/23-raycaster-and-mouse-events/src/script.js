import * as dat from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const gltfLoader = new GLTFLoader();

let model = null;
gltfLoader.load(
  '/models/Duck/glTF-Binary/Duck.glb',
  (gltf) => {
    model = gltf.scene;
    model.position.y = -1.2;
    scene.add(model);
  },
  (event) => {
    console.log('Loading model...');
  },
  (error) => {
    console.log('Error when loading model...');
  },
);

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
);
object3.position.x = 2;

scene.add(object1, object2, object3);

// Update object matrices before raycasting so
// that we have the object coordinates after
// rendering the objects and not before rendering
// which would be at the world origin
object1.updateMatrixWorld();
object2.updateMatrixWorld();
object3.updateMatrixWorld();

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();
// raycaster.set(rayOrigin, rayDirection);

// const intersect = raycaster.intersectObject(object2);
// console.log(intersect);

// const intersects = raycaster.intersectObjects([object1, object2, object3]);
// console.log(intersects);

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
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener('click', () => {
  if (currentIntersect) {
    if (currentIntersect.object === object1) {
      console.log('Clicked on object 1');
    } else if (currentIntersect.object === object2) {
      console.log('Clicked on object 2');
    } else if (currentIntersect.object === object3) {
      console.log('Clicked on object 3');
    }
  }
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
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

// "Witness" variable that checks the current intersecting
// object and is used to simulate/handle events like mouseenter,
// mouseleave or click
let currentIntersect = null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

  // Cast a ray from the mouse pointer position
  raycaster.setFromCamera(mouse, camera);

  // Spheres intersections
  const objectsToTest = [object1, object2, object3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  console.log(intersects);

  for (const object of objectsToTest) {
    object.material.color.set('#ff0000');
  }

  for (const intersect of intersects) {
    intersect.object.material.color.set('#0000ff');
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      console.log('mouse enter');
    }

    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log('mouse leave');
    }

    currentIntersect = null;
  }

  // Duck model intersections
  if (model) {
    const modelIntersects = raycaster.intersectObject(model);
    if (modelIntersects.length > 0) {
      model.scale.set(1.2, 1.2, 1.2);
    } else {
      model.scale.set(1, 1, 1);
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
