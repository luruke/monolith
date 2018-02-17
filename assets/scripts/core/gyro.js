class Sensor {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;
    // this.heading = 0;
    this.tilt = 0;
    this.yaw = 0;
    this.roll = 0;
    this.rotationRate = {
      alpha: 0,
      beta: 0,
      gamma: 0,
    };

    this.toRadians = window.Modernizr.ios ? Math.PI / 180 : 1;

    this.updateOrientation = this.updateOrientation.bind(this);
    this.updateMotion = this.updateMotion.bind(this);
    this.bind();
  }

  bind() {
    window.addEventListener('devicemotion', this.updateMotion);
    window.addEventListener('deviceorientation', this.updateOrientation);
  }

  destroy() {
    window.removeEventListener('devicemotion', this.updateMotion);
    window.removeEventListener('deviceorientation', this.updateOrientation);
  }

  updateMotion(e) {
    switch (window.orientation) {
      case 0:
        this.x = -e.accelerationIncludingGravity.x;
        this.y = e.accelerationIncludingGravity.y;
        this.z = e.accelerationIncludingGravity.z;
        if (e.rotationRate) {
          this.rotationRate.alpha = e.rotationRate.beta * this.toRadians;
          this.rotationRate.beta = -e.rotationRate.alpha * this.toRadians;
          this.rotationRate.gamma = e.rotationRate.gamma * this.toRadians;
        }
        break;
      case 180:
        this.x = e.accelerationIncludingGravity.x;
        this.y = -e.accelerationIncludingGravity.y;
        this.z = e.accelerationIncludingGravity.z;
        if (e.rotationRate) {
          this.rotationRate.alpha = -e.rotationRate.beta * this.toRadians;
          this.rotationRate.beta = e.rotationRate.alpha * this.toRadians;
          this.rotationRate.gamma = e.rotationRate.gamma * this.toRadians;
        }
        break;
      case 90:
        this.x = e.accelerationIncludingGravity.y;
        this.y = e.accelerationIncludingGravity.x;
        this.z = e.accelerationIncludingGravity.z;
        if (e.rotationRate) {
          this.rotationRate.alpha = e.rotationRate.alpha * this.toRadians;
          this.rotationRate.beta = e.rotationRate.beta * this.toRadians;
          this.rotationRate.gamma = e.rotationRate.gamma * this.toRadians;
        }
        break;
      case -90:
        this.x = -e.accelerationIncludingGravity.y;
        this.y = -e.accelerationIncludingGravity.x;
        this.z = e.accelerationIncludingGravity.z;
        if (e.rotationRate) {
          this.rotationRate.alpha = -e.rotationRate.alpha * this.toRadians;
          this.rotationRate.beta = -e.rotationRate.beta * this.toRadians;
          this.rotationRate.gamma = e.rotationRate.gamma * this.toRadians;
        }
        break;
      default:
        break;
    }

    if (window.Modernizr.android) {
      this.x *= -1;
      this.y *= -1;
      this.z *= -1;

      if (window.Modernizr.firefox) {
        this.rotationRate.alpha *= 0.03;
        this.rotationRate.beta *= 0.03;
        this.rotationRate.gamma *= 0.03;
      }
    }
  }

  updateOrientation(e) {
    // for (const key in e) {
    //   if (key.toLowerCase().includes('heading')) {
    //     this.heading = e[key];
    //   }
    // }

    switch (window.orientation) {
      case 0:
        this.alpha = e.beta * this.toRadians;
        this.beta = -e.alpha * this.toRadians;
        this.gamma = e.gamma * this.toRadians;
        break;
      case 180:
        this.alpha = -e.beta * this.toRadians;
        this.beta = e.alpha * this.toRadians;
        this.gamma = e.gamma * this.toRadians;
        break;
      case 90:
        this.alpha = e.alpha * this.toRadians;
        this.beta = e.beta * this.toRadians;
        this.gamma = e.gamma * this.toRadians;
        break;
      case -90:
        this.alpha = -e.alpha * this.toRadians;
        this.beta = -e.beta * this.toRadians;
        this.gamma = e.gamma * this.toRadians;
        break;
      default:
        break;
    }

    this.tilt = e.beta * this.toRadians;
    this.yaw = e.alpha * this.toRadians;
    this.roll = -e.gamma * this.toRadians;

    // if (window.Modernizr.android) {
    //   this.heading = this.compassHeading(e.alpha, e.beta, e.gammma);
    // }
  }

  compassHeading(alpha, beta, gamma) {
    var degtorad = Math.PI / 180;
    var _x = beta ? beta * degtorad : 0;
    var _y = gamma ? gamma * degtorad : 0;
    var _z = alpha ? alpha * degtorad : 0;
    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);
    var Vx = -cZ * sY - sZ * sX * cY;
    var Vy = -sZ * sY + cZ * sX * cY;
    var compassHeading = Math.atan(Vx / Vy);
    if (Vy < 0) {
      compassHeading += Math.PI
    } else if (Vx < 0) {
      compassHeading += 2 * Math.PI
    }
    return compassHeading * (180 / Math.PI)
  }
}

export default new Sensor();
