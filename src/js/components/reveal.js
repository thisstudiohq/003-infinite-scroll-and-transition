import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default class Reveal {
  constructor() {
    this.items = new Map();

    gsap.utils.toArray(".gallery__slide").forEach((slide) => {
      const wrapper = slide.querySelector(".gallery__img-wrapper");

      const chars = new SplitText(slide.querySelector("figcaption"), {
        type: "chars",
      }).chars;

      gsap.set(wrapper, { autoAlpha: 0 });
      gsap.set(chars, { autoAlpha: 0 });

      this.items.set(slide, { wrapper, chars });
    });
  }

  toggle(changes, immediate = false) {
    changes
      .filter((change) => change.visible)
      .sort((a, b) => a.top - b.top)
      .forEach((change, i) => this.show(change.el, i * 0.12, immediate));

    changes
      .filter((change) => !change.visible)
      .forEach((change) => this.hide(change.el));
  }

  show(slide, delay, immediate = false) {
    const { wrapper, chars } = this.items.get(slide);

    if (immediate) {
      gsap.set([wrapper, ...chars], { autoAlpha: 1, overwrite: true });
      return;
    }

    gsap.to(wrapper, {
      autoAlpha: 1,
      duration: 1,
      ease: "power2.out",
      delay,
      overwrite: true,
    });

    gsap.to(chars, {
      autoAlpha: 1,
      duration: 0.4,
      ease: "none",
      stagger: 0.025,
      delay: delay + 0.2,
      overwrite: true,
    });
  }

  hide(slide) {
    const { wrapper, chars } = this.items.get(slide);

    gsap.set(wrapper, { autoAlpha: 0, overwrite: true });
    gsap.set(chars, { autoAlpha: 0, overwrite: true });
  }
}
