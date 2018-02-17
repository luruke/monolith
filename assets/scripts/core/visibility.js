import events from 'core/events';

class Visibility {
  constructor() {
    this.isVisible = true;

    this._hidden = 'hidden';
    this._visibilityChange = 'visibilityChange';
    this.setNames();
    this.bind();
  }

  bind() {
    this.onChange = this.onChange.bind(this);
    document.addEventListener(this._visibilityChange, this.onChange);
  }

  setNames() {
    // From https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    if (typeof document.hidden !== 'undefined') {
      this._hidden = 'hidden';
      this._visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      this._hidden = 'msHidden';
      this._visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      this._hidden = 'webkitHidden';
      this._visibilityChange = 'webkitvisibilitychange';
    }
  }

  onChange() {
    this.isVisible = !document[this._hidden];
    events.emit(this.isVisible ? events.VISIBILITY_VISIBLE : events.VISIBILITY_HIDDEN);
  }
}

export default new Visibility();
