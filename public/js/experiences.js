import { queryAdaptive } from "./adaptive.js";

export function initExperiences() {
  const section = queryAdaptive(".days.adapt-mobile", ".days.adapt-desktop");
  const stage = section?.querySelector(".days__stage");
  const track = section?.querySelector(".days__track");
  const progress = section?.querySelector(".days__progress");
  const progressFill = section?.querySelector(".days__progress-fill");
  const caption = section?.querySelector(".days__caption");
  const metaCopy = section?.querySelector(".days__meta-copy");
  if (!stage || !track || !progress || !progressFill) return;

  const slides = [...track.querySelectorAll(".days__card")];
  const progressItems = [...progress.querySelectorAll(".days__progress-item")];
  const hitPrev = stage.querySelector(".days__hit--prev");
  const hitNext = stage.querySelector(".days__hit--next");

  if (slides.length === 0) return;

  const desktopMq = window.matchMedia("(min-width: 900px)");
  const isDesktopFinal = section?.classList.contains("days--final");

  function useDesktopLayout() {
    return isDesktopFinal && desktopMq.matches;
  }

  /** Figma 614:2836 — mobile; 1006:2387 — desktop final */
  const CARD_RATIO = 346 / 314;
  const CARD_SIZE_BOOST = 287 / 260;
  const DESIGN_STAGE_W = 412 * CARD_RATIO;
  const DESIGN_ACTIVE_W = 287 * CARD_RATIO;
  const DESIGN_ACTIVE_H = 383 * CARD_RATIO;
  const DESIGN_INACTIVE_W = 207.03 * CARD_SIZE_BOOST * CARD_RATIO;
  const DESIGN_INACTIVE_H = 278.08 * CARD_SIZE_BOOST * CARD_RATIO;
  const DESIGN_INACTIVE_Y = 0;
  const DESIGN_GAP = 14 * CARD_RATIO;
  const PEEK_LEFT = -136 * CARD_SIZE_BOOST * CARD_RATIO;
  const VISIBLE_NEXT_X_MAX = 292 * CARD_SIZE_BOOST * CARD_RATIO;

  const DESKTOP_ACTIVE_W = 386;
  const DESKTOP_ACTIVE_H = 516;
  const DESKTOP_INACTIVE_W = 308.8;
  const DESKTOP_INACTIVE_H = 412.8;
  const DESKTOP_GAP = 20;
  const DESKTOP_STAGE_W =
    DESKTOP_ACTIVE_W +
    DESKTOP_GAP +
    DESKTOP_INACTIVE_W +
    DESKTOP_GAP +
    DESKTOP_INACTIVE_W;
  /** Figma 1006:2391 — active left, then +20 gap between card edges */
  const DESKTOP_SLOT_X = [
    0,
    DESKTOP_ACTIVE_W + DESKTOP_GAP,
    DESKTOP_ACTIVE_W + DESKTOP_GAP + DESKTOP_INACTIVE_W + DESKTOP_GAP,
  ];
  const DESKTOP_INACTIVE_Y = 51.6;
  const DESKTOP_INACTIVE_OPACITY = 1;

  function getMetrics() {
    if (useDesktopLayout()) {
      return {
        stageW: DESKTOP_STAGE_W,
        activeW: DESKTOP_ACTIVE_W,
        activeH: DESKTOP_ACTIVE_H,
        inactiveW: DESKTOP_INACTIVE_W,
        inactiveH: DESKTOP_INACTIVE_H,
        inactiveY: DESKTOP_INACTIVE_Y,
        gap: DESKTOP_GAP,
        peekLeft: -Infinity,
        visibleMax: Infinity,
        inactiveOpacity: DESKTOP_INACTIVE_OPACITY,
        fixedPositions: true,
      };
    }

    return {
      stageW: DESIGN_STAGE_W,
      activeW: DESIGN_ACTIVE_W,
      activeH: DESIGN_ACTIVE_H,
      inactiveW: DESIGN_INACTIVE_W,
      inactiveH: DESIGN_INACTIVE_H,
      inactiveY: DESIGN_INACTIVE_Y,
      gap: DESIGN_GAP,
      peekLeft: PEEK_LEFT,
      visibleMax: VISIBLE_NEXT_X_MAX,
      inactiveOpacity: 1,
      fixedPositions: false,
    };
  }

  function getLayouts(m) {
    if (m.fixedPositions) {
      return [0, 1, 2].map((activeIndex) => getDesktopLayout(activeIndex));
    }

    return [
      [
        { x: 0, active: true },
        { x: m.activeW + m.gap, active: false },
        { x: m.activeW + m.gap + m.inactiveW + m.gap, active: false },
      ],
      [
        { x: m.peekLeft, active: false },
        { x: 0, active: true },
        { x: m.activeW + m.gap, active: false },
      ],
      [
        { x: m.activeW + m.gap, active: false },
        { x: m.peekLeft, active: false },
        { x: 0, active: true },
      ],
    ];
  }

  function getWrapLayouts(m) {
    return {
      forward: [
        { x: 0, active: true },
        { x: m.activeW + m.gap, active: false },
        { x: m.peekLeft, active: false },
      ],
      backward: [
        { x: m.activeW + m.gap, active: false },
        { x: m.peekLeft, active: false },
        { x: 0, active: true },
      ],
    };
  }

  const SWIPE_THRESHOLD = 40;
  const AUTOPLAY_MS = 5000;
  const count = slides.length;

  function getDesktopLayout(activeIndex) {
    return Array.from({ length: count }, (_, slideIndex) => {
      const rel = (slideIndex - activeIndex + count) % count;
      return {
        x: DESKTOP_SLOT_X[rel],
        active: rel === 0,
      };
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = 0;
  let isWrapping = false;
  let dragging = false;
  let dragX = 0;
  let startX = 0;
  let moved = false;
  let suppressHitClick = false;
  let sectionVisible = false;
  let autoplayEnabled = !reducedMotion.matches;
  let onAutoplayEnd = null;

  progress.style.setProperty("--days-autoplay-ms", `${AUTOPLAY_MS}ms`);

  function layoutScale(m) {
    if (m.fixedPositions) {
      // Figma 1006:2387 — exact px at desktop; carousel may bleed past column
      return 1;
    }
    const w = Math.round(stage.getBoundingClientRect().width) || m.stageW;
    return Math.min(1, w / m.stageW);
  }

  function applyCard(card, slot, scale, m) {
    const isActive = slot.active;
    const w = (isActive ? m.activeW : m.inactiveW) * scale;
    const h = (isActive ? m.activeH : m.inactiveH) * scale;
    const left = slot.x * scale;

    card.style.width = `${w}px`;
    card.style.height = `${h}px`;
    card.style.left = `${left}px`;
    card.style.transform = isActive
      ? "translate3d(0, 0, 0)"
      : `translate3d(0, ${m.inactiveY * scale}px, 0)`;
    card.classList.toggle("is-active", isActive);

    let baseOpacity = 1;
    if (slot.x <= m.peekLeft || slot.x > m.visibleMax) {
      baseOpacity = 0;
    } else if (!isActive && !m.fixedPositions && slot.x < 0) {
      baseOpacity = 0;
    } else if (!isActive) {
      baseOpacity = m.inactiveOpacity;
    }

    card.dataset.baseOpacity = String(baseOpacity);
    card.style.opacity = String(baseOpacity);
  }

  function applyDragOffset() {
    track.style.transform = "translate3d(0, 0, 0)";
  }

  function applyDragOpacity(m) {
    slides.forEach((card) => {
      card.style.opacity = card.dataset.baseOpacity || "1";
    });

    if (!dragging || dragX === 0) return;

    const dragProgress = Math.min(Math.abs(dragX) / 120, 1);
    const leavingIndex = active;
    const leavingBase = Number(slides[leavingIndex].dataset.baseOpacity) || 1;
    const leavingOpacity = m.fixedPositions
      ? Math.max(0.22, leavingBase * (1 - dragProgress * 0.92))
      : leavingBase * (1 - dragProgress);

    slides[leavingIndex].style.opacity = String(leavingOpacity);
  }

  function syncLayoutMetrics(scale, m) {
    const h = m.activeH * scale;
    stage.style.height = `${h}px`;
    track.style.height = `${h}px`;
    stage.style.width = m.fixedPositions ? `${Math.round(m.stageW * scale)}px` : "";
    track.style.width = m.fixedPositions ? `${Math.round(m.stageW * scale)}px` : "";
    stage.style.setProperty("--days-scale", String(scale));
    const carousel = stage.closest(".days__carousel");
    carousel?.style.setProperty("--days-scale", String(scale));
    if (m.fixedPositions) {
      carousel?.style.setProperty("width", `${Math.round(m.stageW * scale)}px`);
      section?.style.setProperty("--days-active-x", "0px");
    } else {
      carousel?.style.removeProperty("width");
      section?.style.removeProperty("--days-active-x");
    }
  }

  function syncProgressUI() {
    const title = slides[active]?.dataset.metaTitle || slides[active]?.dataset.label || "";
    const copy = slides[active]?.dataset.metaCopy || "";

    if (caption) caption.textContent = title;
    if (metaCopy) metaCopy.textContent = copy;

    progress.dataset.active = String(active);
    progressItems.forEach((item, i) => {
      const isActive = i === active;
      item.classList.toggle("is-active", isActive);

      if (isActive) {
        const trackEl = item.querySelector(".days__progress-track");
        if (trackEl && progressFill.parentElement !== trackEl) {
          trackEl.appendChild(progressFill);
        }
      }
    });

    progress.setAttribute(
      "aria-label",
      title ? `${title}, carousel autoplay` : "Carousel autoplay",
    );
    progress.setAttribute("aria-valuenow", "0");
  }

  function stopAutoplay() {
    if (onAutoplayEnd) {
      progressFill.removeEventListener("animationend", onAutoplayEnd);
      onAutoplayEnd = null;
    }
    progressFill.classList.remove("is-running");
    progressFill.style.animation = "none";
    progressFill.style.width = "0";
    void progressFill.offsetWidth;
    progressFill.style.animation = "";
    progress.setAttribute("aria-valuenow", "0");
  }

  function pauseAutoplay() {
    if (!progressFill.classList.contains("is-running")) return;
    progressFill.style.animationPlayState = "paused";
  }

  function startAutoplay() {
    stopAutoplay();
    syncProgressUI();

    if (!autoplayEnabled || !sectionVisible || dragging || isWrapping || count <= 1) {
      if (!autoplayEnabled) {
        progressFill.style.width = "100%";
        progress.setAttribute("aria-valuenow", "100");
      }
      return;
    }

    progressFill.style.animationPlayState = "running";
    progressFill.classList.add("is-running");

    onAutoplayEnd = (event) => {
      if (event.target !== progressFill) return;
      stopAutoplay();
      goTo(active + 1);
    };

    progressFill.addEventListener("animationend", onAutoplayEnd);
  }

  function setInstant(on) {
    stage.classList.toggle("is-instant", on);
  }

  function markLeaving(fromIndex) {
    clearLeaving();
    const card = slides[fromIndex];
    if (!card) return;

    card.classList.add("is-leaving");

    const onLeaveEnd = (e) => {
      if (e.target !== card) return;
      if (e.propertyName !== "left" && e.propertyName !== "transform") return;
      card.classList.remove("is-leaving");
      card.removeEventListener("transitionend", onLeaveEnd);
    };

    card.addEventListener("transitionend", onLeaveEnd);
  }

  function clearLeaving() {
    slides.forEach((card) => card.classList.remove("is-leaving"));
  }

  function slideDirection(from, to) {
    const delta = (to - from + count) % count;
    if (delta === 0) return 0;
    return delta <= count / 2 ? 1 : -1;
  }

  function applyLayout(layout, activeIndex) {
    const m = getMetrics();
    const scale = layoutScale(m);
    syncLayoutMetrics(scale, m);

    slides.forEach((card, i) => {
      applyCard(card, layout[i], scale, m);
      card.classList.remove("is-prev", "is-next");

      const rel = (i - activeIndex + count) % count;
      if (rel === count - 1) card.classList.add("is-prev");
      if (rel === 1) card.classList.add("is-next");
    });

    applyDragOffset();
    applyDragOpacity(m);
  }

  function layoutCards() {
    const m = getMetrics();
    applyLayout(getLayouts(m)[active], active);
  }

  function afterWrapTransition(done) {
    let pending = slides.length;
    const handler = (e) => {
      if (e.propertyName !== "left") return;
      pending -= 1;
      if (pending > 0) return;
      slides.forEach((card) => card.removeEventListener("transitionend", handler));
      done();
    };
    slides.forEach((card) => card.addEventListener("transitionend", handler));
  }

  function finishWrap(nextIndex) {
    setInstant(true);
    clearLeaving();
    active = nextIndex;
    layoutCards();
    syncProgressUI();
    void stage.offsetHeight;
    setInstant(false);
    isWrapping = false;
    startAutoplay();
  }

  function runWrapForward(nextIndex) {
    const m = getMetrics();
    if (m.fixedPositions) {
      stopAutoplay();
      markLeaving(active);
      active = nextIndex;
      layoutCards();
      syncProgressUI();
      startAutoplay();
      return;
    }

    stopAutoplay();
    isWrapping = true;
    markLeaving(active);
    applyLayout(getWrapLayouts(m).forward, nextIndex);
    afterWrapTransition(() => finishWrap(nextIndex));
  }

  function runWrapBackward(nextIndex) {
    const m = getMetrics();
    if (m.fixedPositions) {
      stopAutoplay();
      markLeaving(active);
      active = nextIndex;
      layoutCards();
      syncProgressUI();
      startAutoplay();
      return;
    }

    stopAutoplay();
    isWrapping = true;
    markLeaving(active);
    applyLayout(getWrapLayouts(m).backward, nextIndex);
    afterWrapTransition(() => finishWrap(nextIndex));
  }

  function goTo(index) {
    if (isWrapping) return;

    const next = ((index % count) + count) % count;
    if (next === active) {
      startAutoplay();
      return;
    }

    stopAutoplay();

    const dir = slideDirection(active, next);
    const from = active;
    dragX = 0;

    if (dir === 1 && active === count - 1 && next === 0) {
      runWrapForward(next);
      return;
    }
    if (dir === -1 && active === 0 && next === count - 1) {
      runWrapBackward(next);
      return;
    }

    markLeaving(from);
    active = next;
    layoutCards();
    syncProgressUI();
    startAutoplay();
  }

  function endDrag(pointerId) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");

    if (stage.hasPointerCapture(pointerId)) {
      stage.releasePointerCapture(pointerId);
    }

    const dx = dragX;
    dragX = 0;
    applyDragOffset();

    if (moved && Math.abs(dx) >= SWIPE_THRESHOLD) {
      suppressHitClick = true;
      goTo(dx < 0 ? active + 1 : active - 1);
      return;
    }

    layoutCards();
    startAutoplay();
  }

  hitPrev?.addEventListener("click", (e) => {
    if (suppressHitClick) {
      suppressHitClick = false;
      return;
    }
    e.stopPropagation();
    goTo(active - 1);
  });

  hitNext?.addEventListener("click", (e) => {
    if (suppressHitClick) {
      suppressHitClick = false;
      return;
    }
    e.stopPropagation();
    goTo(active + 1);
  });

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    dragX = 0;
    stage.classList.add("is-dragging");
    pauseAutoplay();
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    dragX = dx;
    applyDragOffset();
    applyDragOpacity(getMetrics());
  });

  stage.addEventListener("pointerup", (e) => {
    if (e.button !== 0) return;
    endDrag(e.pointerId);
  });

  stage.addEventListener("pointercancel", (e) => {
    endDrag(e.pointerId);
  });

  window.addEventListener("resize", () => {
    layoutCards();
    syncProgressUI();
    startAutoplay();
  }, { passive: true });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      layoutCards();
      syncProgressUI();
      startAutoplay();
    });
    ro.observe(stage);
  }

  if (section) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        sectionVisible = entries.some((entry) => entry.isIntersecting);
        if (sectionVisible) startAutoplay();
        else stopAutoplay();
      },
      { threshold: 0.35 },
    );
    sectionObserver.observe(section);
  } else {
    sectionVisible = true;
  }

  reducedMotion.addEventListener("change", (event) => {
    autoplayEnabled = !event.matches;
    if (autoplayEnabled) startAutoplay();
    else stopAutoplay();
  });

  desktopMq.addEventListener("change", () => {
    layoutCards();
    syncProgressUI();
    startAutoplay();
  });

  layoutCards();
  syncProgressUI();
  startAutoplay();
}
