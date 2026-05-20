/**
 * Footer block.
 *
 * Loads the footer fragment from /en-us/footer (or the path set in page metadata
 * as "footer") and renders it into the footer section.
 *
 * DA document structure (/en-us/footer):
 *
 *   ## help
 *   - [shipping information](/en-us/shipping-information)
 *   - [terms & conditions](/en-us/terms-and-conditions)
 *   ...
 *
 *   ## about us
 *   - [our stores](/en-us/explore/mms-stores)
 *   ...
 *
 *   ## connect with us
 *   - [Instagram icon link](https://www.instagram.com/mmschocolate/)
 *   ...
 *
 *   Legal row:
 *   [Privacy Statement] · [Cookies Notice] · ...
 *
 *   © 2026 MMS.COM. Mars Incorporated and its affiliates.
 */

import { getMetadata, decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  const footerPath = getMetadata('footer') || '/en-us/footer';

  let footerHtml = '';
  try {
    const resp = await fetch(`${footerPath}.plain.html`);
    if (resp.ok) footerHtml = await resp.text();
  } catch {
    // footer unavailable
  }

  if (!footerHtml) return;

  const wrapper = document.createElement('div');
  wrapper.classList.add('footer-content');
  wrapper.innerHTML = footerHtml;

  // ── Email signup is handled by the newsletter block on the page ──
  // ── Just render the link columns + legal ────────────────────────

  // Promote H2s into section headings
  wrapper.querySelectorAll('h2').forEach((h2) => {
    h2.classList.add('footer-section-heading');
  });

  // Style all ULs as footer link lists
  wrapper.querySelectorAll('ul').forEach((ul) => {
    ul.classList.add('footer-links');
  });

  // Social icons list — detect by checking if first link has an icon child
  wrapper.querySelectorAll('.footer-links').forEach((ul) => {
    const firstLink = ul.querySelector('a');
    if (firstLink?.querySelector('.icon') || firstLink?.querySelector('img')) {
      ul.classList.add('footer-social');
    }
  });

  await decorateIcons(wrapper);

  // ── Legal / copyright ────────────────────────────────────────────
  // The last <p> in the footer doc is the copyright line
  wrapper.querySelectorAll('p:last-of-type').forEach((p) => {
    if (p.textContent.includes('©')) p.classList.add('footer-copyright');
  });

  block.append(wrapper);
}
