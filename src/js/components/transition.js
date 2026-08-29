import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Flip, SplitText);

export default class Transition {
  constructor({ onClose } = {}) {
    this.onClose = onClose;

    this.content = document.querySelector(".content");

    this.preview = document.querySelector(".content__preview-img");
    this.previewImg = this.preview.querySelector("img");

    this.groups = gsap.utils.toArray(".content__group");
    this.slides = gsap.utils.toArray(".gallery__slide");

    this.activeSlide = null;
    this.tl = null;
    this.split = null;
    this.state = "closed";
    this.preview.dataset.flipId = "preview";
  }

  async open(slide, index) {
    if (this.state !== "closed") return;
    this.state = "opening";
    this.activeSlide = slide;

    await this.fillContent(slide, index);

    if (this.state !== "opening") return;

    const { wrapper, caption, others } = this.parts();
    wrapper.dataset.flipId = "preview";

    const state = Flip.getState(wrapper);

    gsap.set(this.content, { display: "block" });
    gsap.killTweensOf(wrapper);
    gsap.set(wrapper, { autoAlpha: 0 });

    this.split = new SplitText(".content__back, .content__group.active > *", {
      type: "lines,chars",
      charsClass: "char",
    });

    this.tl = gsap
      .timeline({
        onComplete: () => (this.state = "open"),

        onReverseComplete: () => this.reset(),
      })

      .to(others, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
      .to(caption, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)

      .add(
        Flip.from(state, {
          targets: this.preview,
          duration: 1.2,
          ease: "power4.inOut",
          absolute: true,
        }),
        0,
      )
      .to(
        this.previewImg,
        { scale: 1, duration: 1.2, ease: "power4.inOut" },
        0,
      );

    this.split.lines.forEach((line, i) => {
      this.tl.fromTo(
        line.querySelectorAll(".char"),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.01,
        },
        0.8 + i * 0.06,
      );
    });
  }

  close() {
    if (this.state === "opening") {
      this.state = "closing";

      if (!this.tl) {
        this.reset();
        return;
      }

      this.tl.reverse();
      return;
    }

    if (this.state !== "open") return;
    this.state = "closing";

    const { wrapper, caption, others } = this.parts();

    this.tl = gsap
      .timeline({ onComplete: () => this.reset() })
      .to(
        this.split.lines,
        { autoAlpha: 0, duration: 0.4, stagger: 0.04, ease: "power1.out" },
        0,
      )

      .add(
        Flip.fit(this.preview, wrapper, {
          duration: 1,
          ease: "power3.inOut",
          absolute: true,
        }),
        0,
      )
      .to(this.previewImg, { scale: 1.2, duration: 1, ease: "power3.inOut" }, 0)

      .to(others, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.5)
      .to(caption, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.6);
  }

  async fillContent(slide, index) {
    const img = slide.querySelector(".gallery__img");

    this.previewImg.src = img.src;
    this.previewImg.alt = img.alt;

    this.groups.forEach((group) =>
      group.classList.toggle("active", Number(group.dataset.index) === index),
    );

    try {
      await this.previewImg.decode();
    } catch {}
  }

  parts() {
    const slide = this.activeSlide;

    return {
      wrapper: slide.querySelector(".gallery__img-wrapper"),

      caption: slide.querySelector("figcaption"),

      others: this.slides.filter((s) => s !== slide),
    };
  }

  reset() {
    const { wrapper } = this.parts();

    delete wrapper.dataset.flipId;

    this.split?.revert();
    this.split = null;

    gsap.set(this.content, { display: "none" });
    gsap.set(this.preview, { clearProps: "all" });
    gsap.set(this.previewImg, { clearProps: "all" });
    gsap.set(wrapper, { clearProps: "all" });

    this.activeSlide = null;
    this.tl = null;
    this.state = "closed";

    this.onClose?.();
  }
}
