import { WebGLRenderer } from 'three';
import settings from 'render/settings';
import component from 'render/component';
import canvas from 'render/canvas';

class Renderer extends component(WebGLRenderer) {
  constructor() {
    super({
      canvas: canvas.element,
      powerPreference: 'high-performance',
      antialias: false, //!settings.postprocessing && settings.antialias,
    });

    this.setPixelRatio(settings.dpr);
    this.bind();
  }

  onResize(width, height) {
    this.setSize(width, height);
  }
}

export default new Renderer();
