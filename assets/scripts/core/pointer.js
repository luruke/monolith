import viewport from './viewport';
import events from './events';
import raf from './raf';

class Vector2 {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

class Pointer {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.isTouching = false;
    this.distance = 0;

    // Starting position
    this.hold = new Vector2();

    // Previous "frame"
    this.last = new Vector2();

    // Difference from last frame
    this.delta = new Vector2();

    // Difference from the current to hold point
    this.move = new Vector2();

    // Normalized in the screen from -1 to 1
    this.normalized = new Vector2();

    this.bind();
  }

  bind() {
    window.addEventListener('touchstart', this.onStart.bind(this));
    window.addEventListener('touchmove', this.onMove.bind(this));
    window.addEventListener('touchend', this.onEnd.bind(this));
    window.addEventListener('touchcancel', this.onEnd.bind(this));

    window.addEventListener('mousedown', this.onStart.bind(this));
    window.addEventListener('mousemove', this.onMove.bind(this));
    window.addEventListener('mouseup', this.onEnd.bind(this));
    window.addEventListener('contextmenu', this.onEnd.bind(this));
  }

  static convertEvent(e) {
    const t = {
      x: 0,
      y: 0,
    };

    if (!e) {
      return t;
    }

    if (e.windowsPointer) {
      return e;
    }

    if (e.touches || e.changedTouches) {
      if (e.touches.length) {
        t.x = e.touches[0].pageX;
        t.y = e.touches[0].pageY;
      } else {
        t.x = e.changedTouches[0].pageX;
        t.y = e.changedTouches[0].pageY;
      }
    } else {
      t.x = e.pageX;
      t.y = e.pageY;
    }

    return t;
  }

  onStart(event) {
    const e = Pointer.convertEvent(event);

    this.isTouching = true;
    this.x = e.x;
    this.y = e.y;

    this.hold.set(e.x, e.y);
    this.last.set(e.x, e.y);
    this.delta.set(0, 0);
    this.move.set(0, 0);

    this.normalized.x = ((this.x / viewport.width) * 2) - 1;
    this.normalized.y = (-(this.y / viewport.height) * 2) + 1;
    this.distance = 0;
    events.emit(events.POINTER_START, this);
    this.timeDown = raf.time;
    this.timeMove = raf.time;
  }

  onMove(event) {
    const e = Pointer.convertEvent(event);

    if (this.isTouching) {
      this.move.x = e.x - this.hold.x;
      this.move.y = e.y - this.hold.y;
    }

    this.x = e.x;
    this.y = e.y;
    this.delta.x = e.x - this.last.x;
    this.delta.y = e.y - this.last.y;
    this.last.set(e.x, e.y);

    this.distance += this.delta.length();

    this.timeMove = raf.time;

    this.normalized.x = ((this.x / viewport.width) * 2) - 1;
    this.normalized.y = (-(this.y / viewport.height) * 2) + 1;

    // this._tmp.x = this.normalized.x;
    // this._tmp.y = this.normalized.y;
    // this._tmp.z = 0.5;
    // this._tmp.unproject(camera);
    // const dir = this._tmp.sub(camera.position).normalize();
    // const dist = -camera.position.z / dir.z;
    // this.world.copy(camera.position).add(dir.multiplyScalar(dist));

    events.emit(events.POINTER_MOVE, this);

    if (this.isTouching) {
      events.emit(events.POINTER_DRAG, this);
    }
  }

  onEnd() {
    this.isTouching = false;
    this.move.set(0, 0);

    const delta = this.timeDelta();

    if (delta > 100) {
      this.delta.set(0, 0);
    }

    events.emit(events.POINTER_END, this);
  }

  timeDelta() {
    return Math.max(0.001, raf.time - (this.timeMove || raf.time));
  }
}

export default new Pointer();
