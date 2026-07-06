import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  OPENING_SLIDE_COUNT,
  OPENING_START_INDEX,
  normalizeOpeningLoopIndex,
  normalizeOpeningSlideIndex,
} from "./opening-carousel.ts";

describe("opening carousel loop", () => {
  it("starts in the middle copy", () => {
    assert.equal(OPENING_START_INDEX, OPENING_SLIDE_COUNT);
    assert.equal(normalizeOpeningSlideIndex(OPENING_START_INDEX), 0);
  });

  it("wraps forward from last slide into the next copy", () => {
    const lastInCopy = OPENING_START_INDEX + OPENING_SLIDE_COUNT - 1;
    const next = lastInCopy + 1;
    assert.equal(normalizeOpeningSlideIndex(next), 0);
    assert.equal(normalizeOpeningLoopIndex(next), OPENING_START_INDEX);
  });

  it("wraps backward from first slide into the previous copy", () => {
    const prev = OPENING_START_INDEX - 1;
    assert.equal(normalizeOpeningSlideIndex(prev), OPENING_SLIDE_COUNT - 1);
    assert.equal(
      normalizeOpeningLoopIndex(prev),
      OPENING_START_INDEX + OPENING_SLIDE_COUNT - 1,
    );
  });
});
