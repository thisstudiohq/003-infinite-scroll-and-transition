import { gsap } from "gsap";

export default function verticalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};

  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });

  const length = items.length;
  const startY = 0;
  const heights = [];
  const yPercents = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap =
    config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);

  gsap.set(items, {
    yPercent: (i, el) => {
      const h = (heights[i] = parseFloat(gsap.getProperty(el, "height", "px")));
      yPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "y", "px")) / h) * 100 +
          gsap.getProperty(el, "yPercent"),
      );
      return yPercents[i];
    },
  });
  gsap.set(items, { y: 0 });

  const totalHeight =
    items[length - 1].offsetTop +
    (yPercents[length - 1] / 100) * heights[length - 1] -
    startY +
    items[length - 1].offsetHeight *
      gsap.getProperty(items[length - 1], "scaleY") +
    (parseFloat(config.paddingBottom) || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curY = (yPercents[i] / 100) * heights[i];
    const distanceToStart = item.offsetTop + curY - startY;

    const distanceToLoop =
      distanceToStart + heights[i] * gsap.getProperty(item, "scaleY");

    tl.to(
      item,
      {
        yPercent: snap(((curY - distanceToLoop) / heights[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    ).fromTo(
      item,
      {
        yPercent: snap(
          ((curY - distanceToLoop + totalHeight) / heights[i]) * 100,
        ),
      },
      {
        yPercent: yPercents[i],
        duration: (totalHeight - distanceToLoop) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond,
    );
  }

  tl.progress(1, true).progress(0, true);

  return tl;
}
