import { events, viewport } from 'core';

export default superclass => class extends superclass {
  constructor(...args) {
    super(...args);
    this.args = args;
    this.onUpdate = this.onUpdate.bind(this);
    this.onResize = this.onResize.bind(this);

    this.init();
  }

  init() {
    this.bind();
    this.onResize(viewport.width, viewport.height, viewport.ratio);
  }

  destroy() {
    this.unbind();
  }

  bind() {
    events.on(events.RAF, this.onUpdate);
    events.on(events.RESIZE, this.onResize);
  }

  unbind() {
    events.off(events.RAF, this.onUpdate);
    events.off(events.RESIZE, this.onResize);
  }

  /* eslint-disable */
  onResize(width, height, ratio) { }
  onUpdate(delta) { }
  /* eslint-enable */
};
