import EventEmitter from 'eventemitter3';

// https://nodejs.org/api/events.html
class Events extends EventEmitter {
  emit(...args) {
    const [name, ...params] = args;

    if (this.logBlacklist && this.logBlacklist.indexOf(name) === -1) {
      console.info(name, params);
    }

    super.emit(...args);
  }
}

const instance = new Events();

instance.logBlacklist = [];

// Fire at window resize -> [width, height, ratio, delta?]
instance.RESIZE = Symbol('resize');
// instance.CANVAS_RESIZE = Symbol('canvasResize');

// Fire at each rAF -> [delta, now]
instance.RAF = Symbol('raf');
instance.logBlacklist.push(instance.RAF);

// instance.LOADER_START = Symbol('loaderStart');
// // instance.logBlacklist.push(instance.LOADER_START);
// // Fire when an asset is loaded -> [percentage 0-1]
// instance.LOADER_PROGRESS = Symbol('loaderProgress');
// instance.LOADER_FINISH = Symbol('loaderFinish');
// instance.logBlacklist.push(instance.LOADER_PROGRESS);
// instance.logBlacklist.push(instance.LOADER_FINISH);


instance.FULLSCREEN_ENTER = Symbol('fullscreenEnter');
instance.FULLSCREEN_EXIT = Symbol('fullscreenExit');
instance.VISIBILITY_VISIBLE = Symbol('visibilityVisible');
instance.VISIBILITY_HIDDEN = Symbol('visibilityHidden');

// // Touch / mouse -> [pointer instance]
instance.POINTER_START = Symbol('pointerStart');
instance.POINTER_MOVE = Symbol('pointerMove');
instance.POINTER_DRAG = Symbol('pointerDrag');
instance.POINTER_END = Symbol('pointerEnd');
instance.logBlacklist.push(instance.POINTER_START);
instance.logBlacklist.push(instance.POINTER_MOVE);
instance.logBlacklist.push(instance.POINTER_DRAG);
instance.logBlacklist.push(instance.POINTER_END);

export default instance;
