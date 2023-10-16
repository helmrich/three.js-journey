import Experience from '../Experience';
import Environment from './Environment';
import Floor from './Floor';
import Fox from './Fox';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Note: It depends on the project/case where the
    // resources should be awaited, e.g. it would also
    // make sense to wait for the ready event in the
    // Experience and only render the world when the
    // resources are ready, or partially load different
    // parts of the experience before other parts using
    // multiple Resources instances so that the experience
    // loads faster, etc.
    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor();
      this.fox = new Fox();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }
  }
}
