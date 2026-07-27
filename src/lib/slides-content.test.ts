import { test } from "node:test";
import assert from "node:assert/strict";

import {
  framingDefaults,
  getDestinationsFraming,
  privateWorldFraming,
  resolveFraming,
} from "./slides-content.ts";
import { heroCarouselDestinations } from "./hero-carousel.ts";
import { ecosystemCategoryData, ecosystemSlides } from "./ecosystem-carousel.ts";
import { openingCopy, openingSlides } from "./opening-carousel.ts";
import { daysSlides } from "./days-carousel.ts";

/* The JSON is the content contract a CMS will have to satisfy, so these lock
   the shape rather than the copy: a slider that silently loses its slides, or
   grows a duplicate id, breaks index-based carousel maths in ways that are
   invisible until something is rendering the wrong photo. */

test("every slider is populated from the JSON", () => {
  assert.equal(heroCarouselDestinations.length, 7);
  assert.equal(ecosystemCategoryData.length, 3);
  assert.equal(ecosystemSlides.length, 9);
  assert.equal(openingSlides.length, 3);
  assert.equal(daysSlides.length, 3);
  assert.equal(openingCopy.eyebrow, "Opening in 2027");
});

test("slide ids are unique within each slider", () => {
  const unique = (ids: string[]) => new Set(ids).size === ids.length;

  assert.ok(unique(heroCarouselDestinations.map((d) => d.id)));
  assert.ok(unique(ecosystemSlides.map((s) => s.id)));
  assert.ok(unique(openingSlides.map((s) => s.id)));
  assert.ok(unique(daysSlides.map((s) => s.id)));
  assert.ok(unique(ecosystemCategoryData.map((c) => c.id)));
});

test("every slide carries the media its component reads", () => {
  for (const dest of heroCarouselDestinations) {
    assert.match(dest.bg, /^\/assets\//);
    assert.match(dest.poster, /^\/assets\//);
    assert.match(dest.video, /\.mp4$/);
  }
  for (const slide of ecosystemSlides) {
    assert.match(slide.bg, /^\/assets\/.*\.jpg$/);
  }
  for (const slide of openingSlides) {
    assert.match(slide.video, /\.mp4$/);
    assert.match(slide.poster, /^\/assets\//);
  }
});

test("framing composes defaults, then slider, then slide", () => {
  assert.deepEqual(resolveFraming(), framingDefaults);

  assert.equal(
    resolveFraming(privateWorldFraming).objectPosition,
    "center 35%",
    "the slider-wide value has to beat the file default",
  );

  assert.deepEqual(
    resolveFraming(privateWorldFraming, { scale: 1.2 }),
    { ...framingDefaults, objectPosition: "center 35%", scale: 1.2 },
    "a slide override has to beat both",
  );
});

test("destinations framing differs per variant, matching v8 and v9", () => {
  assert.equal(getDestinationsFraming("rounded").objectPosition, "50% 50%");
  assert.equal(getDestinationsFraming("sharp").objectPosition, "50% 100%");
});

test("private-world cards ship the framing their CSS reads", () => {
  for (const slide of daysSlides) {
    assert.equal(slide.framing.objectPosition, "center 35%");
    assert.equal(typeof slide.framing.scale, "number");
    assert.ok(slide.framing.transformOrigin.length > 0);
  }
});
