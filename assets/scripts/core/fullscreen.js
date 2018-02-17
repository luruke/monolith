import fscreen from 'fscreen';
import events from 'core/events';

class Fullscreen {
  constructor() {
    this.onChange = this.onChange.bind(this);
    this.isAvailable = fscreen.fullscreenEnabled;
    this.isFullScreen = false;
  }

  enter() {
    if (!this.isAvailable) {
      return;
    }

    fscreen.requestFullscreen(document.documentElement);
  }

  exit() {
    if (!this.isAvailable) {
      return;
    }

    fscreen.exitFullscreen();
  }

  bind() {
    if (!this.isAvailable) {
      return;
    }

    fscreen.addEventListener('fullscreenchange', this.onChange);
  }

  onChange() {
    this.isFullScreen = fscreen.fullscreenElement !== null;
    events.emit(this.isFullScreen ? events.FULLSCREEN_ENTER : events.FULLSCREEN_EXIT);
  }
}

export default new Fullscreen();
