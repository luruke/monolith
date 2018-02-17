import events from 'core/events';
import debounce from 'utils/debounce';

class Viewport {
  constructor() {
    this.width = Viewport.calculateWidth();
    this.height = Viewport.calculateHeight();
    this.ratio = this.width / this.height;

    this.bind();
  }

  bind() {
    this.onResize = this.onResize.bind(this);
    this.onResize = debounce(this.onResize, 50);

    window.addEventListener('resize', this.onResize);
  }

  static calculateWidth() {
    return window.innerWidth;
  }

  static calculateHeight() {
    return window.innerHeight;
  }

  onResize() {
    this.width = Viewport.calculateWidth();
    this.height = Viewport.calculateHeight();
    this.ratio = this.width / this.height;

    events.emit(events.RESIZE, this.width, this.height, this.ratio);
  }
}

export default new Viewport();
