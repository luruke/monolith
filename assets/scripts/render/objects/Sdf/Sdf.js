import {
  Object3D,
  RawShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  Vector2,
  Vector3,
  Quaternion,
} from 'three';
import { TweenMax, Elastic, Power4 } from 'gsap';
import { viewport, events, gyro } from 'core';
import component from 'render/component';
import camera from 'render/camera';
import sound from 'render/sound';
import textures from './textures';
import settings from 'render/settings';

const vertexShader = require('./sdf.vert');
const fragmentShader = require('./sdf.frag');
const STEPS = 4;

export default class Sdf extends component(Object3D) {
  init() {
    this.name = 'Sdf';
    this.geometry = new PlaneBufferGeometry(1, 1, 1);
    this.material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      // wireframe: true,
      uniforms: {
        u_resolution: { value: new Vector2(viewport.width * settings.dpr, viewport.height * settings.dpr) },
        u_step: { value: 0 },
        u_time: { value: 0 },
        u_morph: { value: 0 },
        u_force: { value: 0 },
        u_mouse: { value: new Vector2() },
        u_mousevelocity: { value: new Vector2() },
        u_matcap: { value: textures.getNext() },
        u_matcap2: { value: textures.getNext() },
        u_matcapindex: { value: 0 },
        // u_cameraoffset: { value: new Vector2() },
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.scale.set(20, 20, 20);
    this.add(this.mesh);

    // Cursor
    this._tmp = new Vector3();
    this._tmp2 = new Vector3();
    this.mouse3d = new Vector3();

    // Parallax
    this.quat = new Quaternion();
    this.parallax = new Object3D();
    this.parallax.rotation.reorder('XYZ');

    this.onClick = this.onClick.bind(this);
    this.goBack = this.goBack.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);

    super.init();
  }

  bind() {
    super.bind();
    events.on(events.POINTER_MOVE, this.onPointerMove);
    events.on(events.POINTER_START, this.onPointerMove);
    document.addEventListener('mousedown', this.onClick);
    document.addEventListener('touchstart', this.onClick);
    document.addEventListener('touchstart', e => { e.preventDefault(); });
    document.addEventListener('touchmove', e => { e.preventDefault(); });
    document.addEventListener('touchend', e => { e.preventDefault(); });
  }

  onClick() {
    sound.nextPop();

    if (this.isLocked) {
      return;
    }

    if (this.goBackTimer) {
      window.clearTimeout(this.goBackTimer);
    }


    // TweenMax.killTweensOf(this.material.uniforms.u_morph);
    TweenMax.to(this.material.uniforms.u_morph, 2, {
      value: '+=.1',
      ease: Elastic.easeOut.config(1, 0.3),
    });

    TweenMax.to(this.material.uniforms.u_force, 0.2, {
      value: '+=.2',
      ease: Power4.easeOut,
    });

    this.goBackTimer = window.setTimeout(this.goBack, 500);
  }

  onPointerMove(pointer) {
    this._tmp.x = pointer.normalized.x;
    this._tmp.y = pointer.normalized.y;
    this._tmp.z = 0.5;
    this._tmp.unproject(camera);
    const dir = this._tmp.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;

    this._tmp2.copy(camera.position).add(dir.multiplyScalar(dist));

    TweenMax.to(this.mouse3d, 0.6, {
      x: this._tmp2.x,
      y: this._tmp2.y,
      z: this._tmp2.z,
      ease: Power4.easeOut,
    });

    // console.log(pointer.x, pointer.y);
    // this.material.uniforms.u_mouse.value.x = pointer.normalized.x;
    // this.material.uniforms.u_mouse.value.y = pointer.normalized.y;
  }

  goBack() {
    TweenMax.to(this.material.uniforms.u_morph, 1, {
      value: 0,
      ease: Elastic.easeOut.config(1, 0.3),
    });
  }

  goForward() {
    sound.nextPap();

    this.changeTexture();
    TweenMax.killTweensOf(this.material.uniforms.u_morph);
    TweenMax.to(this.material.uniforms.u_morph, 1, {
      value: 1,
      ease: Elastic.easeOut.config(1, 0.3),
      onComplete: () => {
        this.nextStep();
      },
    });
  }

  nextStep() {
    this.material.uniforms.u_step.value += 1;
    this.material.uniforms.u_morph.value = 0;
    this.isLocked = false;
    this.material.uniforms.u_step.value = this.material.uniforms.u_step.value % STEPS;
  }

  onResize(width, height) {
    this.material.uniforms.u_resolution.value.x = width * settings.dpr;
    this.material.uniforms.u_resolution.value.y = height * settings.dpr;
  }

  changeTexture() {
    // const newTexture = textures.getNext();

    TweenMax.to(this.material.uniforms.u_matcapindex, 0.3, {
      value: 1,
      ease: Power4.easeInOut,
      onComplete: () => {
        this.material.uniforms.u_matcapindex.value = 0;
        this.material.uniforms.u_matcap.value = this.material.uniforms.u_matcap2.value;
        this.material.uniforms.u_matcap2.value = textures.getNext();
      },
    });
  }

  onUpdate(delta) {
    if (!this.isLocked && this.material.uniforms.u_morph.value >= 0.60) {
      this.isLocked = true;
      window.clearTimeout(this.goBackTimer);
      this.goForward();
    }

    // console.log(this.velocity);
    // this.material.uniforms.u_mousevelocity.value.copy(this.velocity);

    this.material.uniforms.u_time.value += delta;

    this.material.uniforms.u_force.value *= 0.9;
    this.material.uniforms.u_force.value = Math.max(0, this.material.uniforms.u_force.value);

    this.material.uniforms.u_mouse.value.x = this.mouse3d.x;
    this.material.uniforms.u_mouse.value.y = this.mouse3d.y;
  }
}
