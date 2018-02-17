import { Scene } from 'three';
import component from 'render/component';
import Cube from 'render/objects/Cube/Cube';
import Sdf from 'render/objects/Sdf/Sdf';

class World extends component(Scene) {
  init() {
    super.init();

    this.add(new Sdf());
  }
}

export default new World();
