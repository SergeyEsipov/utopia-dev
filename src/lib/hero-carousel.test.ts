import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  resolveHeroBackgroundLayers,
  resolveHeroBackgroundRenderLayers,
} from "./hero-background.ts";
import {
  HERO_CARD_WIDTH,
  HERO_DESTINATION_COUNT,
  HERO_LOOP_COPIES,
  HERO_START_DESTINATION_INDEX,
  buildHeroCarouselSlides,
  destinationProgressFromSlideIndex,
  getBackgroundMixFromRawSlideIndex,
  getRawSlideIndexFromScroll,
  getRawSlideIndexFromSlideCenters,
  getRawSlideIndexFromSlideElements,
  getScrollLeftForSlide,
  getScrollLeftForSlideElement,
  heroCarouselDestinations,
  heroCarouselSlides,
  normalizeLoopSlideIndex,
  normalizeSlideIndex,
  slideIndexForDestination,
  type HeroBackgroundMix,
} from "./hero-carousel.ts";

const BASE_LENGTH = heroCarouselSlides.length;
const START_SLIDE =
  BASE_LENGTH + slideIndexForDestination(HERO_START_DESTINATION_INDEX);

function destSlideIndex(destinationIndex: number): number {
  return slideIndexForDestination(destinationIndex);
}

function rawIndexFromScrollLeft(
  scrollLeft: number,
  trackClientWidth: number,
  paddingLeft: number,
): number {
  return getRawSlideIndexFromScroll(scrollLeft, trackClientWidth, paddingLeft);
}

describe("hero carousel structure", () => {
  it("has one slide per destination", () => {
    assert.equal(BASE_LENGTH, HERO_DESTINATION_COUNT);
    assert.equal(buildHeroCarouselSlides().length, 7);
    assert.deepEqual(
      heroCarouselSlides.map((slide) => slide.id),
      heroCarouselDestinations.map((dest) => dest.id),
    );
  });

  it("maps each slide to its destination background", () => {
    heroCarouselSlides.forEach((slide, index) => {
      assert.equal(slide.bgIndex, index);
      assert.equal(slide.label, heroCarouselDestinations[index].label);
    });
  });
});

describe("hero destination desktop media", () => {
  it("pairs every destination with a desktop poster and its matching video", () => {
    for (const dest of heroCarouselDestinations) {
      assert.match(
        dest.poster,
        /^\/assets\/desktop\/hero-bg-[a-z-]+\.jpg$/,
        `${dest.id} poster`,
      );
      assert.equal(
        dest.video,
        dest.poster.replace(/\.jpg$/, ".mp4"),
        `${dest.id} video must be the mp4 twin of its poster`,
      );
    }
  });

  it("references media files that exist in public/", () => {
    for (const dest of heroCarouselDestinations) {
      for (const asset of [dest.bg, dest.poster, dest.video]) {
        assert.ok(
          existsSync(join(process.cwd(), "public", asset)),
          `${dest.id}: missing ${asset}`,
        );
      }
    }
  });
});

describe("normalizeSlideIndex", () => {
  it("wraps loop copy indices back to base track", () => {
    assert.equal(normalizeSlideIndex(7), 0);
    assert.equal(normalizeSlideIndex(9), 2);
    assert.equal(normalizeSlideIndex(14), 0);
  });

  it("preserves fractional position within a loop copy", () => {
    assert.ok(Math.abs(normalizeSlideIndex(7.5) - 0.5) < 1e-9);
    assert.ok(Math.abs(normalizeSlideIndex(8.8) - 1.8) < 1e-9);
  });
});

describe("slideIndexForDestination", () => {
  it("maps each destination to its slide index", () => {
    for (let i = 0; i < heroCarouselDestinations.length; i++) {
      assert.equal(slideIndexForDestination(i), i);
    }
  });
});

describe("normalizeLoopSlideIndex", () => {
  it("keeps indices in the middle loop copy", () => {
    assert.equal(normalizeLoopSlideIndex(8), 8);
    assert.equal(normalizeLoopSlideIndex(13), 13);
  });

  it("rewinds from the first copy into the middle copy", () => {
    assert.equal(normalizeLoopSlideIndex(0), 7);
    assert.equal(normalizeLoopSlideIndex(6), 13);
  });

  it("rewinds from the third copy into the middle copy", () => {
    assert.equal(normalizeLoopSlideIndex(14), 7);
    assert.equal(normalizeLoopSlideIndex(20), 13);
  });
});

describe("getRawSlideIndexFromScroll", () => {
  const trackWidth = 378;
  const paddingLeft = (trackWidth - HERO_CARD_WIDTH) / 2;

  it("round-trips with getScrollLeftForSlide", () => {
    for (let slide = 0; slide < BASE_LENGTH * HERO_LOOP_COPIES; slide++) {
      const scrollLeft = getScrollLeftForSlide(slide, trackWidth, paddingLeft);
      const raw = getRawSlideIndexFromScroll(scrollLeft, trackWidth, paddingLeft);
      assert.ok(Math.abs(raw - slide) < 1e-5, `slide ${slide}`);
    }
  });
});

describe("desktop slide element scroll helpers", () => {
  const trackWidth = 1392;
  const paddingLeft = trackWidth / 2 - 295;
  const stride = 590 + 40;
  const slideOffsets = Array.from({ length: 21 }, (_, index) => {
    const offsetLeft = paddingLeft + index * stride;
    const offsetWidth = 590;
    return {
      offsetLeft,
      offsetWidth,
      centerX: offsetLeft + offsetWidth / 2,
    };
  });

  it("centers a slide from measured offsets", () => {
    const scrollLeft = getScrollLeftForSlideElement(
      trackWidth,
      slideOffsets[7].offsetLeft,
      slideOffsets[7].offsetWidth,
    );
    const raw = getRawSlideIndexFromSlideElements(
      scrollLeft,
      trackWidth,
      slideOffsets,
    );
    assert.ok(Math.abs(raw - 7) < 1e-5);
  });

  it("round-trips every slide in the middle loop copy", () => {
    for (let slide = BASE_LENGTH; slide < BASE_LENGTH * 2; slide++) {
      const scrollLeft = getScrollLeftForSlideElement(
        trackWidth,
        slideOffsets[slide].offsetLeft,
        slideOffsets[slide].offsetWidth,
      );
      const raw = getRawSlideIndexFromSlideElements(
        scrollLeft,
        trackWidth,
        slideOffsets,
      );
      assert.ok(Math.abs(raw - slide) < 1e-5, `slide ${slide}`);
    }
  });

  it("interpolates between slide centers", () => {
    const between = getRawSlideIndexFromSlideCenters(
      slideOffsets[7].centerX + stride / 2,
      slideOffsets.map((slide) => slide.centerX),
    );
    assert.ok(Math.abs(between - 7.5) < 1e-5);
  });
});

describe("destinationProgressFromSlideIndex", () => {
  it("returns destination index for centered cards", () => {
    for (let i = 0; i < heroCarouselDestinations.length; i++) {
      const progress = destinationProgressFromSlideIndex(destSlideIndex(i));
      assert.equal(progress, i);
      assert.equal(
        destinationProgressFromSlideIndex(BASE_LENGTH + destSlideIndex(i)),
        i,
      );
    }
  });
});

describe("getBackgroundMixFromRawSlideIndex at rest", () => {
  it("shows Roca on initial middle-copy slide", () => {
    assert.deepEqual(getBackgroundMixFromRawSlideIndex(START_SLIDE), {
      from: 0,
      to: 0,
      blend: 0,
    });
  });

  const destinations = [
    [0, "roca"],
    [1, "cabarete"],
    [2, "flora"],
    [3, "barcelona"],
    [4, "dubai"],
    [5, "cape-town"],
    [6, "jericoacoara"],
  ] as const;

  for (const [destIndex, id] of destinations) {
    it(`destination ${destIndex} (${id}) matches its card when centered`, () => {
      const slideIndex = destSlideIndex(destIndex);
      const mix = getBackgroundMixFromRawSlideIndex(slideIndex);
      assert.deepEqual(mix, { from: destIndex, to: destIndex, blend: 0 });
      assert.equal(heroCarouselDestinations[mix.from].id, id);
    });
  }

  const loopPairs = [
    [0, 0, 7],
    [1, 1, 8],
    [2, 2, 9],
    [3, 3, 10],
    [4, 4, 11],
    [5, 5, 12],
    [6, 6, 13],
  ] as const;

  for (const [destIndex, baseSlide, loopSlide] of loopPairs) {
    it(`loop copy slide ${loopSlide} maps to destination ${destIndex}`, () => {
      const base = getBackgroundMixFromRawSlideIndex(baseSlide);
      const loop = getBackgroundMixFromRawSlideIndex(loopSlide);
      assert.deepEqual(loop, base);
      assert.equal(base.from, destIndex);
    });
  }
});

describe("getBackgroundMixFromRawSlideIndex while scrolling", () => {
  it("crossfades directly between adjacent destinations", () => {
    const mix = getBackgroundMixFromRawSlideIndex(7.5);
    assert.equal(mix.from, 0);
    assert.equal(mix.to, 1);
    assert.ok(mix.blend > 0);
    assert.ok(mix.blend < 1);
  });

  it("wraps from the last destination into the first", () => {
    const mix = getBackgroundMixFromRawSlideIndex(6.5);
    assert.equal(mix.from, 6);
    assert.equal(mix.to, 0);
    assert.ok(mix.blend > 0);
    assert.ok(mix.blend < 1);
  });
});

describe("getScrollLeftForSlide", () => {
  const trackWidth = 378;
  const paddingLeft = (trackWidth - HERO_CARD_WIDTH) / 2;

  it("centers the requested slide in the viewport", () => {
    for (const slideIndex of [7, 8, 9, 10]) {
      const scrollLeft = getScrollLeftForSlide(
        slideIndex,
        trackWidth,
        paddingLeft,
      );
      const rawIndex = rawIndexFromScrollLeft(
        scrollLeft,
        trackWidth,
        paddingLeft,
      );
      assert.ok(Math.abs(rawIndex - slideIndex) < 1e-5);
    }
  });

  it("increases monotonically for consecutive slides", () => {
    const a = getScrollLeftForSlide(7, trackWidth, paddingLeft);
    const b = getScrollLeftForSlide(8, trackWidth, paddingLeft);
    const c = getScrollLeftForSlide(9, trackWidth, paddingLeft);
    assert.ok(b > a);
    assert.ok(c > b);
    assert.equal(b - a, c - b);
  });
});

describe("resolveHeroBackgroundLayers", () => {
  it("renders one layer at rest", () => {
    const layers = resolveHeroBackgroundLayers({ from: 2, to: 2, blend: 0 });
    assert.equal(layers.mode, "single");
    assert.deepEqual(layers.indices, [2]);
    assert.deepEqual(layers.opacities, [1]);
  });

  it("renders two layers only during crossfade", () => {
    const layers = resolveHeroBackgroundLayers({
      from: 0,
      to: 1,
      blend: 0.4,
    });
    assert.equal(layers.mode, "crossfade");
    assert.deepEqual(layers.indices, [0, 1]);
    assert.equal(layers.opacities[0], 1);
    assert.ok(Math.abs(layers.opacities[1] - 0.4) < 1e-9);
  });
});

describe("resolveHeroBackgroundRenderLayers", () => {
  it("keeps every destination layer mounted in stable order", () => {
    const layers = resolveHeroBackgroundRenderLayers(
      { from: 0, to: 1, blend: 0.4 },
      heroCarouselDestinations.length,
    );

    assert.deepEqual(
      layers.map((layer) => layer.index),
      heroCarouselDestinations.map((_, index) => index),
    );
  });

  it("places the target image above the base image during crossfade", () => {
    const layers = resolveHeroBackgroundRenderLayers(
      { from: 0, to: 1, blend: 0.4 },
      heroCarouselDestinations.length,
    );

    assert.equal(layers[0].opacity, 1);
    assert.equal(layers[0].zIndex, 1);
    assert.equal(layers[1].opacity, 0.4);
    assert.equal(layers[1].zIndex, 2);
    assert.equal(layers[2].opacity, 0);
    assert.equal(layers[2].zIndex, 0);
  });
});

describe("full swipe Roca to Cabarete journey", () => {
  it("crossfades directly from Roca to Cabarete", () => {
    const trackWidth = 378;
    const paddingLeft = (trackWidth - HERO_CARD_WIDTH) / 2;
    const rocaSlide = 7;
    const cabareteSlide = 8;

    const steps: HeroBackgroundMix[] = [];
    for (let slide = rocaSlide; slide <= cabareteSlide; slide += 0.25) {
      const scrollLeft = getScrollLeftForSlide(slide, trackWidth, paddingLeft);
      const raw = rawIndexFromScrollLeft(scrollLeft, trackWidth, paddingLeft);
      steps.push(getBackgroundMixFromRawSlideIndex(raw));
    }

    assert.deepEqual(steps[0], { from: 0, to: 0, blend: 0 });
    assert.deepEqual(steps[steps.length - 1], { from: 1, to: 1, blend: 0 });

    const mid = steps[Math.floor(steps.length / 2)];
    assert.equal(mid.from, 0);
    assert.equal(mid.to, 1);
    assert.ok(mid.blend > 0);
    assert.ok(mid.blend < 1);
  });
});
