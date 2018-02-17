import { PerspectiveCamera } from 'three';
import { viewport } from 'core';
import component from 'render/component';

class Camera extends component(PerspectiveCamera) {
  constructor() {
    super(45, viewport.ratio, 0.01, 1000);
  }

  init() {
    this.name = 'Camera';
    this.position.set(0, 0, 2.3);

    super.init();
  }

  onResize(width, height, ratio) {
    this.aspect = ratio;
    this.updateProjectionMatrix();
  }
}

export default new Camera();
