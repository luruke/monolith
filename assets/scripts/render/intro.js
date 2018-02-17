import { TimelineMax, Power4, Power0 } from 'gsap';

export default class Intro {
  constructor() {
    this.$p1 = document.querySelector('.p1');
    this.$p2 = document.querySelector('.p2');

    const tl = new TimelineMax({
      delay: 2,
      onComplete: () => {
        this.$p1.parentNode.removeChild(this.$p1);
        this.$p2.parentNode.removeChild(this.$p2);
      },
    });

    tl.to(this.$p1, 2, {
      ease: Power4.easeOut,
      autoAlpha: 1,
    });

    tl.to(this.$p1, 2, {
      ease: Power4.easeIn,
      autoAlpha: 0,
    });

    tl.to(this.$p2, 2, {
      ease: Power4.easeOut,
      autoAlpha: 1,
    });

    tl.to(this.$p2, 5, {
      xPercent: -50,
      ease: Power0.easeNone,
    }, '-=2');

    tl.to(this.$p2, 1, {
      ease: Power4.easeIn,
      autoAlpha: 0,
    }, '-=2');
  }
}
