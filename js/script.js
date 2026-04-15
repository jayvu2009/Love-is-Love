"use strict";

/* Shared State */
const header = document.getElementById("site-header");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const sections = Array.from(document.querySelectorAll(".section[data-section]"));
const navList = document.querySelector(".main-nav ul");
const revealTargets = Array.from(
  document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale")
);
const staggerGroups = Array.from(document.querySelectorAll(".stagger-group"));
const storiesCarousel = document.querySelector(".stories-carousel");

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = reduceMotionQuery.matches;

/* Hero Load Animation */
window.addEventListener("DOMContentLoaded", () => {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });
});

/* Navigation State + Section Highlight */
function setStickyHeaderState() {
  const isScrolled = window.scrollY > 50;
  header.classList.toggle("is-sticky", isScrolled);
  positionNavActivePill();
}

let navActivePill = null;

function createNavActivePill() {
  if (!navList) return;

  navActivePill = document.createElement("span");
  navActivePill.className = "nav-active-pill";
  navActivePill.setAttribute("aria-hidden", "true");
  navList.prepend(navActivePill);
}

function positionNavActivePill() {
  if (!navList || !navActivePill) return;

  const activeLink = navLinks.find((link) => link.classList.contains("is-active"));
  if (!activeLink) {
    navActivePill.style.opacity = "0";
    return;
  }

  const listRect = navList.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const x = linkRect.left - listRect.left;
  const y = linkRect.top - listRect.top;

  navActivePill.style.width = `${linkRect.width}px`;
  navActivePill.style.height = `${linkRect.height}px`;
  navActivePill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  navActivePill.style.opacity = "1";
}

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const linkTarget = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("is-active", linkTarget === sectionId);
  });
  positionNavActivePill();
}

function findCurrentSectionOnScroll() {
  const trigger = window.scrollY + window.innerHeight * 0.35;
  let current = sections[0]?.dataset.section || "home";

  sections.forEach((section) => {
    if (section.offsetTop <= trigger) {
      current = section.dataset.section || current;
    }
  });

  setActiveNav(current);
}

function handleScroll() {
  setStickyHeaderState();
  findCurrentSectionOnScroll();
}

createNavActivePill();
setStickyHeaderState();
findCurrentSectionOnScroll();
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", positionNavActivePill);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) {
      setActiveNav(targetId);
    }
  });
});

/* =========================
   Stagger Utility
========================= */
function applyStaggerDelays() {
  staggerGroups.forEach((group) => {
    const step = Number.parseFloat(group.dataset.staggerStep || "0.12");
    const items = Array.from(group.querySelectorAll(".stagger-item"));

    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${(index * step).toFixed(2)}s`);
    });
  });
}

applyStaggerDelays();

/* Stories Center Carousel */
const carouselTrack = document.getElementById("stories-track");
const prevButton = document.getElementById("stories-prev");
const nextButton = document.getElementById("stories-next");
const storyCards = carouselTrack ? Array.from(carouselTrack.querySelectorAll(".story-card")) : [];

let centerIndex = 0;

function getWrappedIndex(index) {
  return (index + storyCards.length) % storyCards.length;
}

function renderCarousel() {
  if (!storyCards.length) return;

  const leftIndex = getWrappedIndex(centerIndex - 1);
  const rightIndex = getWrappedIndex(centerIndex + 1);

  storyCards.forEach((card, index) => {
    card.classList.remove("is-left", "is-center", "is-right");
    card.setAttribute("aria-hidden", "true");

    if (index === centerIndex) {
      card.classList.add("is-center");
      card.setAttribute("aria-hidden", "false");
      return;
    }

    if (index === leftIndex) {
      card.classList.add("is-left");
      card.setAttribute("aria-hidden", "false");
      return;
    }

    if (index === rightIndex) {
      card.classList.add("is-right");
      card.setAttribute("aria-hidden", "false");
    }
  });
}

function moveCarousel(direction) {
  centerIndex = getWrappedIndex(centerIndex + direction);
  renderCarousel();
}

if (prevButton && nextButton && storyCards.length) {
  prevButton.addEventListener("click", () => moveCarousel(-1));
  nextButton.addEventListener("click", () => moveCarousel(1));
  renderCarousel();
}

/* Scroll Reveal Observer (Play Once) */
function revealImmediately() {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
  if (storiesCarousel) storiesCarousel.classList.add("is-visible");
}

function initRevealObserver() {
  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    revealImmediately();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.05,
      rootMargin: "0px 0px 120px 0px",
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
  if (storiesCarousel) observer.observe(storiesCarousel);
}

initRevealObserver();


// thank you for the help of Bao Tran (my partner) in this project, he helped me a lot in the development of this project, and I really appreciate his help and support. 