import {
  BoxBufferGeometry,
  Object3D,
  RawShaderMaterial,
  Mesh,
} from 'three';
import component from 'render/component';

const vertexShader = require('./cube.vert');
const fragmentShader = require('./cube.frag');

export default class Cube extends component(Object3D) {
  init() {
    this.name = 'Cube';
    this.geometry = new BoxBufferGeometry(1, 1, 1);
    this.material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      wireframe: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.add(this.mesh);

    super.init();
  }

  onUpdate(delta) {
    this.mesh.rotation.x += delta * 0.1;
    this.mesh.rotation.y += delta * 0.2;
  }
}
