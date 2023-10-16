import * as THREE from 'three';
import Camera from './Camera';
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';
import Renderer from './Renderer';
import World from './World/World';
import Resources from './Utils/Resources';
import sources from './sources';
import Debug from './Utils/Debug';

// Singleton
let instance = null;

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) {
      return instance;
    }

    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    // Events
    this.sizes.on('resize', () => {
      this.resize();
    });

    this.time.on('tick', () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  // Note: For simplicity sake only this central destroy
  // method exists. Another way would be to have a destroy
  // method for every class that handles the destruction logic
  // for the corresponding class
  destroy() {
    this.sizes.off('resize');
    this.time.off('tick');

    // Note: See this page for information on how to
    // properly dispose of objects in Three.js:
    // https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects

    // Traverse whole scene
    this.scene.traverse((child) => {
      // Check if it's a mesh and dispose of the mesh's geometry
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        // Loop over material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function and if there is,
          // dispose of the material properties
          if (value && typeof value.dispose === 'function') {
            value.dispose();
          }
        }
      }
    });

    // Dispose of camera controls
    this.camera.controls.dispose();

    // Dispose of renderer
    this.renderer.instance.dispose();

    // Destroy debug UI
    if (this.debug.active) {
      this.debug.ui.destroy();
    }
  }
}
