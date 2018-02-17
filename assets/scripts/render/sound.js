import { Howl, Howler } from 'howler';

const pops = [
  'assets/sounds/Mouth Pop_01.mp3',
  'assets/sounds/Mouth Pop_02.mp3',
  'assets/sounds/Mouth Pop_03.mp3',
  'assets/sounds/Mouth Pop_04.mp3',
  'assets/sounds/Mouth Pop_05.mp3',
  'assets/sounds/Mouth Pop_06.mp3',
];

const paps = [
  'assets/sounds/Pop_Open_MidPitch_01.mp3',
  'assets/sounds/Pop_Open_MidPitch_02.mp3',
];

class Sound {
  constructor() {
    this.pops = [];
    this.currentPop = 0;
    pops.forEach(src => {
      this.pops.push(new Howl({ src, volume: 0.4 }));
    });

    this.paps = [];
    this.currentPaps = 0;
    paps.forEach(src => {
      this.paps.push(new Howl({ src }));
    });
  }

  nextPop() {
    this.pops[this.currentPop++ % this.pops.length].play();
  }

  nextPap() {
    this.paps[this.currentPaps++ % this.paps.length].play();
  }
}

export default new Sound();
