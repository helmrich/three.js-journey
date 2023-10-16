import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    // 16 in order to prevent weird bugs when the delta would,
    // be 0 16 ms is a usual average delta value for screens
    // with a 60 Hz refresh rate
    this.delta = 16;

    // Waiting a frame and not calling the tick function
    // immediately in order to prevent the delta from
    // becoming 0
    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.trigger('tick');

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
