import component from 'render/component';

class Canvas extends component(() => {}) {
  init() {
    this.element = document.querySelector('#world');
  }

  onResize(width, height) {
    this.element.width = width;
    this.element.height = height;
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
  }
}

export default new Canvas();
