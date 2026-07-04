import { initViewport } from "./viewport.js";
import { initHero } from "./hero.js";
import { initLocations } from "./locations.js";
import { initOpening } from "./opening.js?v=20260622-2300";
import { initExperiences } from "./experiences.js";
import { initComingSoonLinks } from "./coming-soon.js";
import { initDestinationsNav } from "./destinations-nav.js";
import { initMenu } from "./menu.js";
import { initParallax } from "./parallax.js";
import { initReveal } from "./reveal.js";
import { initCardImages } from "./lazy-media.js";

document.addEventListener("DOMContentLoaded", () => {
  initViewport();
  initCardImages();
  const parallax = initParallax();

  initReveal();
  initHero(parallax);
  initLocations();
  initComingSoonLinks();
  initOpening();
  initExperiences();
  initDestinationsNav();
  initMenu();
});
