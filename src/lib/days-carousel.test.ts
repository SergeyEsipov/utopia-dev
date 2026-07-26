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
    // 386x516 / 326x436 is what BOTH sources specify for the 768 tier: Figma
    // 24.07 `154:5280` (stage 1078 = 386 + 20 + 326 + 20 + 326) and prototype
    // desktop_v9's stacked metrics. Do not "restore" the old 426x570.
    assert.deepEqual(
      [daysTabletMetrics.activeW, daysTabletMetrics.activeH],
      [386, 516],
    );
    assert.deepEqual(
      [daysTabletMetrics.inactiveW, daysTabletMetrics.inactiveH],
      [326, 436],
    );
    // Prototype v9 ultra tier = 1.35x the desktop metrics. Figma 24.07 has no
    // frame above 1440, so the prototype is the only source here.
    assert.deepEqual(
      [daysWideMetrics.activeW, daysWideMetrics.activeH],
      [521, 697],
    );
    assert.deepEqual(
      [daysWideMetrics.inactiveW, daysWideMetrics.inactiveH],
      [417, 557],
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
