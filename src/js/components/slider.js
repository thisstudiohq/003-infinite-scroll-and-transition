import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import verticalLoop from "./vertical-loop";

gsap.registerPlugin(Observer);

export default class Slider {
  constructor({ enabled = () => true, onToggle } = {}) {
    this.enabled = enabled;

    this.onToggle = onToggle;

    this.createLoop();
    this.createParallax();
    this.createScrub();
    this.createObserver();

    this.resize();
  }

  createLoop() {
    const gallery = document.querySelector(".gallery");

    const gap = parseFloat(getComputedStyle(gallery).rowGap);

    this.loop = verticalLoop(".gallery__slide", {
      repeat: -1,
      paused: true,
      paddingBottom: gap,
    });

    this.wrap = gsap.utils.wrap(0, this.loop.duration());
  }

  createParallax() {
    const speeds = [1.3, 0.8, 1.15, 0.7, 1.25, 0.85];

    this.parallax = gsap.utils.toArray(".gallery__slide").map((slide, i) => ({
      el: slide,
      factor: speeds[i % speeds.length] - 1,
      offset: 0,
      visible: false,
    }));

    this.applyParallax();
  }

  applyParallax(immediate = false) {
    const changes = [];

    this.parallax.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      const loopTop = rect.top - item.offset;

      item.offset = item.factor * (loopTop + rect.height);
      gsap.set(item.el, { y: item.offset });

      const top = loopTop + item.offset;
      const visible = top < window.innerHeight && top + rect.height > 0;

      if (visible !== item.visible) {
        item.visible = visible;
        changes.push({ el: item.el, visible, top });
      }
    });

    if (changes.length) this.onToggle?.(changes, immediate);
  }

  createScrub() {
    this.playhead = { time: 0 };

    this.scrub = gsap.to(this.playhead, {
      time: 0,
      duration: 0.75,
      ease: "power3.out",
      paused: true,
      onUpdate: () => {
        this.loop.time(this.wrap(this.playhead.time));
        this.applyParallax();
      },
    });
  }

  createObserver() {
    this.observer = Observer.create({
      target: window,
      type: "wheel,touch",
      preventDefault: true,
      onChange: (self) => {
        this.scroll(self);
      },
    });
  }

  resize() {
    let id;

    window.addEventListener("resize", () => {
      clearTimeout(id);
      id = setTimeout(() => {
        this.rebuild();
      }, 200);
    });
  }

  scroll({ deltaX, deltaY }) {
    if (!this.enabled()) return;

    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    this.scrub.vars.time += delta / 100;
    this.scrub.invalidate().restart();
  }

  freeze() {
    this.scrub.pause();

    this.scrub.vars.time = this.playhead.time;
    this.scrub.invalidate();
  }

  stop() {
    this.observer.disable();

    this.freeze();
  }

  start() {
    this.observer.enable();
  }

  rebuild() {
    const progress = this.loop.progress();

    this.freeze();
    this.loop.kill();
    gsap.set(".gallery__slide", { clearProps: "transform" });

    this.createLoop();
    this.loop.progress(progress, true);

    this.parallax.forEach((item) => (item.offset = 0));
    this.applyParallax(true);

    this.playhead.time = this.loop.time();
    this.scrub.vars.time = this.playhead.time;
    this.scrub.invalidate();
  }
}
