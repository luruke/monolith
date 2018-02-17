import {
  Vector3,
} from 'three';
import { events } from 'core';

export default class VelocityTracker {
  constructor(vector) {
    this.vector = vector;
    this.last = new Vector3();
    this.velocity = new Vector3();
    this.onUpdate = this.onUpdate.bind(this);

    this.init();
  }

  init() {
    this.bind();
  }

  destroy() {
    this.unbind();
  }

  bind() {
    events.on(events.RAF, this.onUpdate);
  }

  unbind() {
    events.off(events.RAF, this.onUpdate);
  }

  onUpdate(delta) {
    this.velocity.copy(this.vector).sub(this.last);
    this.last.copy(this.vector);
    this.velocity.multiplyScalar(delta);
  }
}
