import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveHeroBackgroundLayers,
  resolveHeroBackgroundRenderLayers,
} from "./hero-background.ts";
import {
  HERO_CARD_WIDTH,
  HERO_LOOP_COPIES,
  HERO_SIDE_BG_INDEX,
  HERO_START_DESTINATION_INDEX,
  buildHeroCarouselSlides,
  destinationProgressFromSlideIndex,
  getBackgroundMixFromRawSlideIndex,
  getRawSlideIndexFromScroll,
  getScrollLeftForSlide,
  heroCarouselDestinations,
  heroCarouselSlides,
  isSideSlideIndex,
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
  it("alternates side and destination slides", () => {
    assert.equal(heroCarouselSlides[0].bgIndex, HERO_SIDE_BG_INDEX);
    assert.equal(heroCarouselSlides[1].bgIndex, 0);
    assert.equal(heroCarouselSlides[2].bgIndex, HERO_SIDE_BG_INDEX);
    assert.equal(heroCarouselSlides[3].bgIndex, 1);
  });

  it("has one loop copy length of 15", () => {
    assert.equal(BASE_LENGTH, 15);
    assert.equal(buildHeroCarouselSlides().length, 15);
  });
});

describe("normalizeSlideIndex", () => {
  it("wraps loop copy indices back to base track", () => {
    assert.equal(normalizeSlideIndex(16), 1);
    assert.equal(normalizeSlideIndex(18), 3);
    assert.equal(normalizeSlideIndex(31), 1);
  });

  it("preserves fractional position within a loop copy", () => {
    assert.ok(Math.abs(normalizeSlideIndex(16.5) - 1.5) < 1e-9);
    assert.ok(Math.abs(normalizeSlideIndex(17.8) - 2.8) < 1e-9);
  });
});

describe("slideIndexForDestination", () => {
  it("maps each destination to an odd slide index", () => {
    for (let i = 0; i < heroCarouselDestinations.length; i++) {
      const slideIndex = slideIndexForDestination(i);
      assert.equal(slideIndex, i * 2 + 1);
      assert.equal(isSideSlideIndex(slideIndex), false);
    }
  });
});

describe("normalizeLoopSlideIndex", () => {
  it("keeps indices in the middle loop copy", () => {
    assert.equal(normalizeLoopSlideIndex(16), 16);
    assert.equal(normalizeLoopSlideIndex(29), 29);
  });

  it("rewinds from the first copy into the middle copy", () => {
    assert.equal(normalizeLoopSlideIndex(1), 16);
    assert.equal(normalizeLoopSlideIndex(14), 29);
  });

  it("rewinds from the third copy into the middle copy", () => {
    assert.equal(normalizeLoopSlideIndex(30), 15);
    assert.equal(normalizeLoopSlideIndex(44), 29);
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
    [0, 1, 16],
    [1, 3, 18],
    [2, 5, 20],
    [3, 7, 22],
    [4, 9, 24],
    [5, 11, 26],
    [6, 13, 28],
  ] as const;

  for (const [destIndex, baseSlide, loopSlide] of loopPairs) {
    it(`loop copy slide ${loopSlide} maps to destination ${destIndex}`, () => {
      const base = getBackgroundMixFromRawSlideIndex(baseSlide);
      const loop = getBackgroundMixFromRawSlideIndex(loopSlide);
      assert.deepEqual(loop, base);
      assert.equal(base.from, destIndex);
    });
  }

  it("never shows Jericoacoara bg when centered on Roca loop copy", () => {
    const mix = getBackgroundMixFromRawSlideIndex(16);
    assert.notEqual(mix.from, 6);
    assert.notEqual(mix.to, 6);
    assert.equal(mix.from, 0);
  });

  it("shows Jericoacoara as a single image on side slides at rest", () => {
    const sideIndices = [0, 2, 4, 6, 8, 10, 12, 14];
    for (const sideIndex of sideIndices) {
      const mix = getBackgroundMixFromRawSlideIndex(sideIndex);
      assert.deepEqual(mix, {
        from: HERO_SIDE_BG_INDEX,
        to: HERO_SIDE_BG_INDEX,
        blend: 0,
      });
    }
  });

  it("maps side slides to their own background instead of adjacent destinations", () => {
    assert.deepEqual(getBackgroundMixFromRawSlideIndex(2), {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });
    assert.deepEqual(getBackgroundMixFromRawSlideIndex(4), {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });
  });
});

describe("getBackgroundMixFromRawSlideIndex while scrolling", () => {
  it("eases into crossfade from the start of slide transition", () => {
    const early = getBackgroundMixFromRawSlideIndex(16.15);
    assert.equal(early.from, 0);
    assert.equal(early.to, HERO_SIDE_BG_INDEX);
    assert.ok(early.blend > 0);
    assert.ok(early.blend < 0.35);

    const mid = getBackgroundMixFromRawSlideIndex(17);
    assert.deepEqual(mid, {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });
  });

  it("crossfades from destination backgrounds into side backgrounds", () => {
    const mix = getBackgroundMixFromRawSlideIndex(16.5);
    assert.equal(mix.from, 0);
    assert.equal(mix.to, HERO_SIDE_BG_INDEX);
    assert.ok(mix.blend > 0);
    assert.ok(mix.blend < 1);
  });

  it("snaps to the side background near the side slide center", () => {
    assert.equal(isSideSlideIndex(17), true);
    const scrolling = getBackgroundMixFromRawSlideIndex(17.02);
    const snapped = getBackgroundMixFromRawSlideIndex(17);
    assert.deepEqual(scrolling, {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });
    assert.deepEqual(snapped, {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });
  });

  it("crossfades from the side background into the next destination", () => {
    const mix = getBackgroundMixFromRawSlideIndex(17.5);
    assert.equal(mix.from, HERO_SIDE_BG_INDEX);
    assert.equal(mix.to, 1);
    assert.ok(mix.blend > 0);
    assert.ok(mix.blend < 1);
  });
});

describe("getScrollLeftForSlide", () => {
  const trackWidth = 378;
  const paddingLeft = (trackWidth - HERO_CARD_WIDTH) / 2;

  it("centers the requested slide in the viewport", () => {
    for (const slideIndex of [16, 17, 18, 19]) {
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
    const a = getScrollLeftForSlide(16, trackWidth, paddingLeft);
    const b = getScrollLeftForSlide(17, trackWidth, paddingLeft);
    const c = getScrollLeftForSlide(18, trackWidth, paddingLeft);
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
  it("passes through the Jericoacoara side background while scrolling", () => {
    const trackWidth = 378;
    const paddingLeft = (trackWidth - HERO_CARD_WIDTH) / 2;
    const rocaSlide = 16;
    const cabareteSlide = 18;

    const steps: HeroBackgroundMix[] = [];
    for (let slide = rocaSlide; slide <= cabareteSlide; slide += 0.25) {
      const scrollLeft = getScrollLeftForSlide(slide, trackWidth, paddingLeft);
      const raw = rawIndexFromScrollLeft(scrollLeft, trackWidth, paddingLeft);
      steps.push(getBackgroundMixFromRawSlideIndex(raw));
    }

    assert.deepEqual(steps[0], { from: 0, to: 0, blend: 0 });
    assert.deepEqual(steps[steps.length - 1], { from: 1, to: 1, blend: 0 });

    const mid = steps[Math.floor(steps.length / 2)];
    assert.deepEqual(mid, {
      from: HERO_SIDE_BG_INDEX,
      to: HERO_SIDE_BG_INDEX,
      blend: 0,
    });

    assert.equal(steps[1].from, 0);
    assert.equal(steps[1].to, HERO_SIDE_BG_INDEX);
    assert.equal(steps[steps.length - 2].from, HERO_SIDE_BG_INDEX);
    assert.equal(steps[steps.length - 2].to, 1);
  });
});
