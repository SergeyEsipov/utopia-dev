import { OPENING_SLIDES } from "./data.js?v=20260622-2300";
import { applyVideoPoster, clearVideoSource, ensureVideoSource } from "./lazy-media.js?v=20260622-2300";

const SLIDE_COUNT = OPENING_SLIDES.length;

const SWIPE_MIN_X = 28;
const SWIPE_LOCK_X = 8;
const SWIPE_LOCK_Y = 8;
const EDGE_RESISTANCE = 0.32;

function appendSlideVideo(slideEl, slide) {
  const video = document.createElement("video");
  video.className = "opening__bg-media";
  video.dataset.src = slide.video;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = false;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
  video.preload = "metadata";
  if (slide.fullBleed) {
    video.classList.add("opening__bg-media--bleed");
  } else {
    video.style.width = `${slide.mediaWidth}px`;
    video.style.left = slide.mediaLeft;
  }
  if (slide.poster) {
    video.dataset.poster = slide.poster;
    applyVideoPoster(video);
  }
  slideEl.appendChild(video);
  return video;
}

function appendSlideImage(slideEl, slide) {
  const img = document.createElement("img");
  img.className = "opening__bg-media";
  img.alt = "";
  img.decoding = "async";
  img.loading = "lazy";
  img.src = slide.image;
  if (slide.fullBleed) {
    img.classList.add("opening__bg-media--bleed");
  } else {
    img.style.width = `${slide.mediaWidth}px`;
    img.style.left = slide.mediaLeft;
  }
  slideEl.appendChild(img);
  return img;
}

function appendSlideMedia(slideEl, slide) {
  if (slide.image) return appendSlideImage(slideEl, slide);
  if (slide.video) return appendSlideVideo(slideEl, slide);
  return null;
}

function preloadSlideVideo(slides, slideIndex) {
  if (slideIndex < 0 || slideIndex >= SLIDE_COUNT) return;
  const video = slides[slideIndex]?.querySelector("video.opening__bg-media");
  const slide = OPENING_SLIDES[slideIndex];
  if (video && slide?.video) ensureVideoSource(video, slide.video);
}

function playActiveVideo(section, slides, index) {
  const activeSlide = slides[index];
  const activeVideo = activeSlide?.querySelector("video.opening__bg-media");

  slides.forEach((slideEl, i) => {
    const video = slideEl.querySelector("video.opening__bg-media");
    if (!video || video === activeVideo) return;
    if (Math.abs(i - index) > 1) clearVideoSource(video);
  });

  if (!activeVideo) return;

  const slide = OPENING_SLIDES[index];
  ensureVideoSource(activeVideo, slide?.video);

  const tryPlay = () => {
    const promise = activeVideo.play();
    if (promise?.catch) promise.catch(() => {});
  };

  if (activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    tryPlay();
    return;
  }

  activeVideo.addEventListener("loadeddata", tryPlay, { once: true });
}

function syncPill(pillLabel, index) {
  const label = OPENING_SLIDES[index]?.label;
  if (pillLabel && label) pillLabel.textContent = label;
}

export function initOpening() {
  const section = document.querySelector(".opening");
  if (!section) return;

  const slidesRoot = section.querySelector(".opening__slides");
  const swipeSurface = section.querySelector(".opening__media") || section.querySelector(".opening__sticky");
  const prevBtn = section.querySelector(".opening__nav-btn--prev");
  const nextBtn = section.querySelector(".opening__nav-btn--next");
  const pillLabel = section.querySelector(".opening__location-pill .ecosystem__location-pill__label");
  if (!slidesRoot || !swipeSurface) return;

  let index = 0;
  let unlockedPlayback = false;
  let sectionVisible = false;
  let stageWidth = slidesRoot.getBoundingClientRect().width || 1;

  const track = document.createElement("div");
  track.className = "opening__track";
  slidesRoot.appendChild(track);

  OPENING_SLIDES.forEach((slide, i) => {
    const slideEl = document.createElement("div");
    slideEl.className = "opening__slide";
    slideEl.setAttribute("role", "group");
    slideEl.setAttribute("aria-hidden", i === 0 ? "false" : "true");

    const inner = document.createElement("div");
    inner.className = `opening__bg-slide opening__bg-slide--${i}`;
    if (slide.video || slide.image) appendSlideMedia(inner, slide);
    slideEl.appendChild(inner);
    track.appendChild(slideEl);
  });

  const slides = [...track.querySelectorAll(".opening__slide")];

  function refreshStageWidth() {
    stageWidth = slidesRoot.getBoundingClientRect().width || stageWidth || 1;
  }

  function syncSlideStates() {
    slides.forEach((el, i) => {
      const active = i === index;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function syncTrackPosition(dragPx = 0) {
    const resist = (value) => {
      if (index === 0 && value > 0) return value * EDGE_RESISTANCE;
      if (index === SLIDE_COUNT - 1 && value < 0) return value * EDGE_RESISTANCE;
      return value;
    };

    track.style.transform = `translate3d(calc(-${index * 100}% + ${resist(dragPx)}px), 0, 0)`;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      sectionVisible = entries.some((entry) => entry.isIntersecting);
      if (sectionVisible && unlockedPlayback) playActiveVideo(section, slides, index);
      if (!sectionVisible) {
        section.querySelectorAll("video.opening__bg-media").forEach(clearVideoSource);
      }
    },
    { rootMargin: "200px", threshold: 0.08 },
  );
  sectionObserver.observe(section);

  function render(dragPx = 0) {
    syncSlideStates();
    syncTrackPosition(dragPx);
    syncPill(pillLabel, index);
    preloadSlideVideo(slides, index);
    if (sectionVisible && unlockedPlayback) playActiveVideo(section, slides, index);
  }

  function stepForward() {
    index = (index + 1) % SLIDE_COUNT;
    track.classList.remove("is-dragging");
    render();
  }

  function stepBackward() {
    index = (index - 1 + SLIDE_COUNT) % SLIDE_COUNT;
    track.classList.remove("is-dragging");
    render();
  }

  const unlock = () => {
    if (unlockedPlayback) return;
    unlockedPlayback = true;
    if (sectionVisible) playActiveVideo(section, slides, index);
  };

  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    unlock();
    stepBackward();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    unlock();
    stepForward();
  });

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let gestureLocked = false;
  let horizontalGesture = false;

  swipeSurface.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    refreshStageWidth();
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    gestureLocked = false;
    horizontalGesture = false;
    track.classList.add("is-dragging");

    if (swipeSurface.hasPointerCapture && !swipeSurface.hasPointerCapture(e.pointerId)) {
      swipeSurface.setPointerCapture(e.pointerId);
    }
  });

  swipeSurface.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!gestureLocked && (absX > SWIPE_LOCK_X || absY > SWIPE_LOCK_Y)) {
      gestureLocked = true;
      horizontalGesture = absX > absY * 1.1;
    }

    if (!horizontalGesture) return;

    e.preventDefault();
    syncTrackPosition(dx);

    const previewIndex = dx < 0 ? index + 1 : index - 1;
    preloadSlideVideo(slides, previewIndex);
  });

  function endSwipe(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    track.classList.remove("is-dragging");

    if (horizontalGesture && absX >= SWIPE_MIN_X && absX > absY) {
      unlock();
      if (dx < 0) stepForward();
      else stepBackward();
    } else {
      syncTrackPosition(0);
    }

    if (swipeSurface?.hasPointerCapture?.(e.pointerId)) {
      swipeSurface.releasePointerCapture(e.pointerId);
    }

    dragging = false;
    gestureLocked = false;
    horizontalGesture = false;
    pointerId = null;
  }

  swipeSurface.addEventListener("pointerup", endSwipe);
  swipeSurface.addEventListener("pointercancel", endSwipe);

  window.addEventListener(
    "resize",
    () => {
      refreshStageWidth();
      syncTrackPosition(0);
    },
    { passive: true },
  );

  swipeSurface.addEventListener("touchstart", unlock, { passive: true, once: true });
  swipeSurface.addEventListener("click", unlock, { once: true });

  render();
}
