/**
 * Header / Navigation block — MMS mega-menu.
 *
 * DA content structure (/en-us/nav document):
 *
 *   - [Logo image or text] linked to /
 *   - [Personalize CTA] linked to /en-us/configurator   ← becomes sticky CTA
 *
 *   Then one list item per top-level nav entry. Each list item may contain
 *   a nested unordered list for the dropdown panel, and optionally a promo
 *   image block (last <li> with an image inside).
 *
 *   Example nav document structure:
 *
 *   - shop
 *     - chocolate [/shop/chocolate-c.html]
 *       - gifts [/shop/gifts-c.html]
 *       - party favors [/shop/party-favors-c.html]
 *       ...
 *     - shop by price [/shop/by-price-c.html]
 *       - under $30 [/shop/under-30-c.html]
 *       ...
 *     - NEW - flavor vote [/shop/flavor-vote-c.html]
 *     - [promo image] father's day [perfect picks for every dad][/holidays/fathers-day]
 *   - celebrate
 *     ...
 *
 * The block reads the authored list structure and converts it to
 * an accessible mega-menu.
 */

import { getMetadata } from '../../scripts/aem.js';

const MQ_DESKTOP = window.matchMedia('(min-width: 1024px)');

/**
 * Close all open nav panels.
 * @param {HTMLElement} nav
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((el) => {
    el.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.nav-panel[aria-hidden="false"]').forEach((panel) => {
    panel.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Toggle a top-level nav item open/closed.
 * @param {HTMLElement} btn  – the <button> toggle element
 * @param {HTMLElement} nav
 */
function togglePanel(btn, nav) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  closeAllPanels(nav);
  if (!expanded) {
    btn.setAttribute('aria-expanded', 'true');
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) panel.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Build a column group from a sub-list inside a top-level item.
 * Each direct <li> with its own nested <ul> becomes a column.
 * Direct <li>s without a nested <ul> are collected into a standalone list.
 * @param {HTMLUListElement} ul
 * @returns {HTMLElement}  – panel container
 */
function buildPanel(ul, panelId) {
  const panel = document.createElement('div');
  panel.classList.add('nav-panel');
  panel.id = panelId;
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'region');

  const cols = document.createElement('div');
  cols.classList.add('nav-panel-columns');

  const standaloneLinks = [];
  const promoEl = document.createElement('div');
  promoEl.classList.add('nav-panel-promo');
  let hasPromo = false;

  [...ul.children].forEach((li) => {
    const subUl = li.querySelector(':scope > ul');
    const img = li.querySelector('img');
    const link = li.querySelector('a');

    // Promo tile: a list item that contains an image
    if (img && !subUl) {
      hasPromo = true;
      if (link) {
        const promoLink = document.createElement('a');
        promoLink.href = link.href;
        promoLink.classList.add('nav-panel-promo-link');
        promoLink.innerHTML = li.innerHTML;
        promoEl.append(promoLink);
      } else {
        promoEl.innerHTML = li.innerHTML;
      }
      return;
    }

    // Column with sub-links
    if (subUl) {
      const col = document.createElement('div');
      col.classList.add('nav-panel-col');

      if (link) {
        const colHeading = document.createElement('a');
        colHeading.href = link.href;
        colHeading.classList.add('nav-panel-col-heading');
        colHeading.textContent = link.textContent;
        col.append(colHeading);
      }

      const colList = document.createElement('ul');
      colList.classList.add('nav-panel-col-list');
      [...subUl.children].forEach((subLi) => {
        const cloned = document.createElement('li');
        cloned.innerHTML = subLi.innerHTML;
        colList.append(cloned);
      });
      col.append(colList);
      cols.append(col);
      return;
    }

    // Flat link (no sub-list, no image) — collect as standalone
    standaloneLinks.push(li);
  });

  // Standalone links get their own column
  if (standaloneLinks.length) {
    const col = document.createElement('div');
    col.classList.add('nav-panel-col', 'nav-panel-col-standalone');
    const list = document.createElement('ul');
    list.classList.add('nav-panel-col-list');
    standaloneLinks.forEach((li) => {
      const cloned = document.createElement('li');
      cloned.innerHTML = li.innerHTML;
      list.append(cloned);
    });
    col.append(list);
    cols.append(col);
  }

  panel.append(cols);
  if (hasPromo) panel.append(promoEl);
  return panel;
}

/**
 * Decorate the nav section into a mega-menu.
 * @param {HTMLElement} nav  – the raw nav element loaded from /en-us/nav
 */
function decorateNav(nav) {
  const topList = nav.querySelector(':scope > ul');
  if (!topList) return;

  const navItems = document.createElement('ul');
  navItems.classList.add('nav-items');
  navItems.setAttribute('role', 'menubar');

  [...topList.children].forEach((li, i) => {
    const subUl = li.querySelector(':scope > ul');
    const link = li.querySelector(':scope > a');
    const text = link?.textContent?.trim() || li.childNodes[0]?.textContent?.trim() || '';

    const item = document.createElement('li');
    item.classList.add('nav-item');
    item.setAttribute('role', 'none');

    if (subUl) {
      const panelId = `nav-panel-${i}`;

      const btn = document.createElement('button');
      btn.classList.add('nav-item-toggle');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('role', 'menuitem');
      btn.setAttribute('type', 'button');

      // Icon images (e.g. shop icon / shop icon hover) authored as images
      const icons = li.querySelectorAll(':scope > img');
      icons.forEach((img) => {
        img.classList.add('nav-item-icon');
        btn.append(img);
      });

      const label = document.createElement('span');
      label.textContent = text;
      btn.append(label);

      const panel = buildPanel(subUl, panelId);

      btn.addEventListener('click', () => togglePanel(btn, nav));

      item.append(btn, panel);
    } else if (link) {
      // Standalone link item (e.g. "flavor vote" or the "personalize CTA")
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = text;
      a.classList.add('nav-item-link');
      a.setAttribute('role', 'menuitem');
      item.append(a);
    } else {
      const span = document.createElement('span');
      span.textContent = text;
      span.classList.add('nav-item-link');
      item.append(span);
    }

    navItems.append(item);
  });

  topList.replaceWith(navItems);
}

/**
 * Toggle mobile hamburger menu.
 */
function toggleMobileMenu(hamburger, navWrapper) {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navWrapper.toggleAttribute('data-open', !expanded);
  document.body.toggleAttribute('data-nav-open', !expanded);
}

export default async function decorate(block) {
  // Load nav document from metadata or default path
  const navPath = getMetadata('nav') || '/en-us/nav';

  let navHtml = '';
  try {
    const resp = await fetch(`${navPath}.plain.html`);
    if (resp.ok) navHtml = await resp.text();
  } catch {
    // nav unavailable; render minimal fallback
  }

  block.innerHTML = '';

  // ── Brand bar (logo + configurator CTA) ──────────────────────────
  const brandBar = document.createElement('div');
  brandBar.classList.add('nav-brand');

  const logoLink = document.createElement('a');
  logoLink.href = '/';
  logoLink.classList.add('nav-logo');
  logoLink.setAttribute('aria-label', "M&M'S Home");
  // Logo image is served from Amplience; swap src via CSS custom property or inline:
  const logoImg = document.createElement('img');
  logoImg.src = '/icons/mms-logo.svg'; // place mms-logo.svg in /icons/
  logoImg.alt = "M&M'S";
  logoImg.width = 80;
  logoImg.height = 40;
  logoImg.loading = 'eager';
  logoLink.append(logoImg);

  const ctaLink = document.createElement('a');
  ctaLink.href = '/en-us/configurator';
  ctaLink.classList.add('nav-cta', 'button', 'primary');
  ctaLink.textContent = "personalize your M&M'S";

  const hamburger = document.createElement('button');
  hamburger.classList.add('nav-hamburger');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('type', 'button');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  brandBar.append(logoLink, ctaLink, hamburger);

  // ── Main nav ──────────────────────────────────────────────────────
  const navWrapper = document.createElement('nav');
  navWrapper.classList.add('nav-wrapper');
  navWrapper.setAttribute('aria-label', 'Main');

  if (navHtml) {
    navWrapper.innerHTML = navHtml;
    decorateNav(navWrapper);
  }

  // ── Assemble ──────────────────────────────────────────────────────
  block.append(brandBar, navWrapper);

  // Mobile toggle
  hamburger.addEventListener('click', () => toggleMobileMenu(hamburger, navWrapper));

  // Close panels on outside click
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) closeAllPanels(navWrapper);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels(navWrapper);
      hamburger.setAttribute('aria-expanded', 'false');
      navWrapper.removeAttribute('data-open');
      document.body.removeAttribute('data-nav-open');
    }
  });

  // On desktop, close mobile state when viewport widens
  MQ_DESKTOP.addEventListener('change', (e) => {
    if (e.matches) {
      hamburger.setAttribute('aria-expanded', 'false');
      navWrapper.removeAttribute('data-open');
      document.body.removeAttribute('data-nav-open');
    }
  });
}
