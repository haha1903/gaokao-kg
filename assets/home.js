const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactLayout = window.matchMedia('(max-width: 620px)');
const hero = document.querySelector('.hero');
const heroArt = document.querySelector('.hero-art');
const chapterNav = document.querySelector('.section-index');
const chapterLinks = [...chapterNav.querySelectorAll('a')];
const chapters = chapterLinks.map(link => document.querySelector(link.hash));
const subjectArt = document.querySelector('.subject-art');
const learningSteps = document.querySelector('.learning-steps');
const steps = [...learningSteps.children];
const connections = [...document.querySelectorAll('.connection-lines path')];
const nodes = [...document.querySelectorAll('.connection-node')];
const clamp = value => Math.max(0, Math.min(1, value));
let frame = 0;
let revealObserver;

function prepareReveals() {
  revealObserver?.disconnect();
  document.querySelectorAll('.will-reveal').forEach(element => element.classList.remove('will-reveal'));
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;

  // Reveal once per setup; keep focused content and visible anchor landings readable.
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('will-reveal');
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
  document.querySelectorAll('[data-reveal]').forEach(element => {
    if (element.getBoundingClientRect().top < innerHeight || element.matches(':focus-within')) return;
    revealObserver.observe(element);
    element.classList.add('will-reveal');
  });
}

function renderScroll() {
  frame = 0;
  const reducedMotion = motionPreference.matches;
  const height = innerHeight;
  const y = scrollY;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);

  // Read layout before writing styles. Native scrolling schedules at most one update per frame.
  const heroBounds = hero.getBoundingClientRect();
  const orbitBounds = subjectArt.getBoundingClientRect();
  const chapterBounds = chapters.map(chapter => chapter.getBoundingClientRect());
  const stepsTop = learningSteps.getBoundingClientRect().top;
  const markers = steps.map(step => {
    const number = step.querySelector('.step-number');
    return step.offsetTop + number.offsetTop + number.offsetHeight / 2;
  });
  const milestones = markers.map(marker => Math.min(maxScroll, y + stepsTop + marker - height * .58));
  const learningProgress = clamp((y - milestones[0]) / Math.max(1, milestones.at(-1) - milestones[0]));
  const currentStep = milestones.reduce((active, milestone, index) => y >= milestone ? index : active, 0);
  let currentChapter = chapterBounds.reduce((active, bounds, index) => bounds.top <= height * .5 ? index : active, -1);
  if (y >= maxScroll - 2) currentChapter = chapters.length - 1;

  chapterNav.style.setProperty('--page-progress', clamp(y / maxScroll));
  chapterLinks.forEach((link, index) => {
    if (index === currentChapter) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  steps.forEach((step, index) => {
    step.classList.toggle('is-current', index === currentStep);
    step.classList.toggle('is-past', index < currentStep);
    nodes[index].classList.toggle('is-current', index === currentStep);
  });
  learningSteps.style.setProperty('--track-start', `${markers[0]}px`);
  learningSteps.style.setProperty('--track-length', `${markers.at(-1) - markers[0]}px`);

  if (reducedMotion) {
    heroArt.style.removeProperty('transform');
    for (const name of ['--orbit-angle', '--orbit-scale', '--orbit-dash']) subjectArt.style.removeProperty(name);
    learningSteps.style.removeProperty('--learning-progress');
    connections.forEach(path => path.style.removeProperty('--connection-dash'));
    return;
  }

  const heroProgress = clamp(-heroBounds.top / (heroBounds.height * .85));
  const orbitProgress = clamp((height * .9 - orbitBounds.top) / (height * .65));
  const sideways = compactLayout.matches ? 0 : -70;
  const downward = compactLayout.matches ? 18 : 65;
  heroArt.style.transform = `translate3d(${heroProgress * sideways}px, ${heroProgress * downward}px, 0) rotate(${-5 * heroProgress}deg) scale(${1 - .07 * heroProgress})`;
  subjectArt.style.setProperty('--orbit-angle', `${-24 + 48 * orbitProgress}deg`);
  subjectArt.style.setProperty('--orbit-scale', .82 + .18 * orbitProgress);
  subjectArt.style.setProperty('--orbit-dash', 1 - orbitProgress);
  learningSteps.style.setProperty('--learning-progress', learningProgress);
  connections.forEach((path, index) => path.style.setProperty('--connection-dash', 1 - clamp(learningProgress * 3 - index)));
}

function scheduleScroll() {
  if (!frame) frame = requestAnimationFrame(renderScroll);
}

prepareReveals();
renderScroll();
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
window.addEventListener('pageshow', scheduleScroll);
window.addEventListener('load', scheduleScroll);
motionPreference.addEventListener('change', () => {
  prepareReveals();
  scheduleScroll();
});
// Keyboard users can reach below-the-fold links without waiting for an entrance animation.
document.addEventListener('focusin', event => event.target.closest('[data-reveal]')?.classList.remove('will-reveal'));
