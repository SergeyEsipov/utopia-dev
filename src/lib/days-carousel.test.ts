import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysDesktopMetrics,
  daysMobileMetrics,
  daysSlides,
  daysTabletMetrics,
  daysWideMetrics,
  getDaysLayouts,
  getDaysStackedMetrics,
} from "./days-carousel.ts";

const STACKED = ["tablet", "desktop", "wide"] as const;

describe("days carousel metrics", () => {
  it("maps stacked breakpoints onto their Figma metrics", () => {
    assert.equal(getDaysStackedMetrics("tablet"), daysTabletMetrics);
    assert.equal(getDaysStackedMetrics("desktop"), daysDesktopMetrics);
    assert.equal(getDaysStackedMetrics("wide"), daysWideMetrics);
  });

  it("scales card sizes up from tablet to wide", () => {
    assert.deepEqual(
      [daysTabletMetrics.activeW, daysTabletMetrics.activeH],
      [426, 570],
    );
    assert.deepEqual(
      [daysWideMetrics.activeW, daysWideMetrics.activeH],
      [458, 612],
    );
    assert.deepEqual(
      [daysWideMetrics.inactiveW, daysWideMetrics.inactiveH],
      [360, 482],
    );
  });
});

describe("days carousel layouts", () => {
  it("keeps the active slide in the left slot on stacked layouts", () => {
    for (const breakpoint of STACKED) {
      const m = getDaysStackedMetrics(breakpoint);
      const layouts = getDaysLayouts(1, daysSlides.length, breakpoint);

      assert.deepEqual(layouts[1], { x: 0, active: true });
      assert.deepEqual(layouts[2], { x: m.activeW + m.gap, active: false });
      assert.deepEqual(layouts[0], {
        x: m.activeW + m.gap + m.inactiveW + m.gap,
        active: false,
      });
    }
  });

  it("parks the previous mobile card at the left peek slot", () => {
    const layouts = getDaysLayouts(1, daysSlides.length, "mobile");

    assert.deepEqual(layouts[0], {
      x: daysMobileMetrics.peekLeft,
      active: false,
    });
    assert.deepEqual(layouts[1], { x: 0, active: true });
    assert.deepEqual(layouts[2], {
      x: daysMobileMetrics.activeW + daysMobileMetrics.gap,
      active: false,
    });
  });
});
