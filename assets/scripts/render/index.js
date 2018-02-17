import scene from 'render/scene';
import camera from 'render/camera';
import renderer from 'render/renderer';
import component from 'render/component';

export default class Render extends component(() => {}) {
  init() {
    super.init();
  }

  onUpdate() {
    renderer.render(scene, camera);
  }
}
