import imagesLoaded from "imagesloaded";

import Reveal from "./components/reveal.js";
import Slider from "./components/slider.js";
import Transition from "./components/transition.js";

imagesLoaded(document.body, () => {
  document.body.classList.remove("loading");
  init();
});

function init() {
  const transition = new Transition({ onClose: () => slider.start() });

  const reveal = new Reveal();

  const slider = new Slider({
    enabled: () => transition.state === "closed",
    onToggle: (changes) => reveal.toggle(changes),
  });

  const slides = [...document.querySelectorAll(".gallery__slide")];

  slides.forEach((slide, index) => {
    slide.setAttribute("tabindex", "0");
    slide.setAttribute("role", "button");

    const open = () => {
      if (transition.state !== "closed") return;

      slider.stop();
      transition.open(slide, index);
    };

    slide.addEventListener("click", open);

    slide.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  document
    .querySelector(".content__back")
    .addEventListener("click", () => transition.close());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") transition.close();
  });
}
