/**
 * scripts/scripts.js
 *
 * Main EDS entry point for the MMS site.
 * Follows the AEM boilerplate pattern:
 *   1. Eager  – decorate + load first section (LCP)
 *   2. Lazy   – load remaining sections, header, footer, lazy-styles
 *   3. Delayed – analytics, experimentation, non-critical third-parties
 *
 * DO NOT modify aem.js — import helpers from it.
 */

import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

/* ─── Helpers ─────────────────────────────────────────────── */

/**
 * Add a GTM noscript iframe to the body (pairs with head.html GTM snippet).
 */
function addGTMNoScript() {
  if (document.querySelector('#gtm-noscript')) return;
  const ns = document.createElement('noscript');
  ns.id = 'gtm-noscript';
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-PZ55C79'
    + '&gtm_auth=Ve_uTsQ4OZiV7zapcqfcig&gtm_preview=env-1&gtm_cookies_win=x';
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.cssText = 'display:none;visibility:hidden';
  ns.append(iframe);
  document.body.prepend(ns);
}

/**
 * Auto-link any path under /modals/ as a modal block (EDS pattern).
 */
function autoLinkModals() {
  document.querySelectorAll('a[href]').forEach((a) => {
    if (a.href.includes('/modals/')) {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const { openModal } = await import('../blocks/modal/modal.js');
        openModal(a.href);
      });
    }
  });
}

/* ─── Build auto-blocks ───────────────────────────────────── */

/**
 * Build an announcement-bar block from the first section if it
 * contains only a single <p> or <ul> (promo text authored without a table).
 * In practice the DA author should use an explicit table block — this is
 * a safety net.
 */
function buildAnnouncementBar(main) {
  const firstSection = main.querySelector('.section:first-child');
  if (!firstSection) return;
  const existing = firstSection.querySelector('.announcement-bar');
  if (existing) return;

  // Detect: section contains only short paragraphs and no other blocks
  const blocks = firstSection.querySelectorAll('[data-block-name]');
  if (blocks.length) return;

  const paras = [...firstSection.querySelectorAll('p')];
  const allShort = paras.length >= 1 && paras.length <= 3
    && paras.every((p) => p.textContent.length < 160);

  if (!allShort) return;

  const rows = paras.map((p) => [p.cloneNode(true)]);
  const bar = buildBlock('announcement-bar', rows);
  firstSection.prepend(bar);
}

/**
 * Build a hero block from the first section's default content when it
 * contains an image + heading + paragraphs (authored without a table).
 */
function buildHeroBlock(main) {
  const firstSection = main.querySelector('.section:first-child');
  if (!firstSection) return;
  if (firstSection.querySelector('.hero, [data-block-name="hero"]')) return;

  const img = firstSection.querySelector('img');
  const heading = firstSection.querySelector('h1');
  if (!img || !heading) return;

  const rows = [[img.closest('picture') || img, heading.parentElement]];
  const hero = buildBlock('hero', rows);
  firstSection.prepend(hero);
}

/* ─── Decorate page ───────────────────────────────────────── */

async function decoratePage(main) {
  decorateTemplateAndTheme();
  buildAnnouncementBar(main);
  buildHeroBlock(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateIcons(main);
}

/* ─── Phases ──────────────────────────────────────────────── */

/**
 * EAGER — runs before first paint.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decoratePage(doc.querySelector('main'));
  const section = doc.querySelector('main .section');
  if (section) {
    await loadSection(section, waitForFirstImage);
  }
  sampleRUM('cwv');
  addGTMNoScript();
}

/**
 * LAZY — runs after LCP.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  autoLinkModals();
}

/**
 * DELAYED — runs after everything else (analytics, experiments, etc).
 */
function loadDelayed() {
  window.setTimeout(() => {
    import('./delayed.js').catch(() => {
      // optional: delayed.js may not exist in all projects
    });
  }, 3000);
}

/* ─── Bootstrap ───────────────────────────────────────────── */

(async function init() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}());
