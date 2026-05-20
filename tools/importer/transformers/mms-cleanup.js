/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mms.com site-wide cleanup.
 * Removes non-authorable content (headers, footers, cookie consent, tracking,
 * Klaviyo popups, Next.js artifacts) so only page-level authorable content remains.
 *
 * All selectors verified against captured DOM in migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // OneTrust cookie consent SDK (found at: <div id="onetrust-consent-sdk">)
    // Klaviyo email popup overlay (found at: .kl-private-reset-css-Xuajs1)
    // Tracking iframes from DoubleClick, Bing, TTD, Clinch
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.kl-private-reset-css-Xuajs1',
      'iframe[src*="doubleclick.net"]',
      'iframe[src*="adsrvr.org"]',
      'iframe[src*="clinch.co"]',
      'iframe.ot-text-resize',
      '#dynamic-react-root',
      'div[id^="batBeacon"]',
    ]);

    // Remove nested empty spans that can interfere with block parsing
    const nested = element.querySelectorAll('span > span:only-child');
    nested.forEach((span) => {
      if (span.textContent.trim() === '' && !span.querySelector('img')) {
        span.parentElement.remove();
      }
    });
  }

  if (hookName === H.after) {
    // Remove non-authorable site shell elements
    // Outer promotional header (found at: <header class="css-1gw6p47">)
    // Sticky navigation header (found at: <header class="css-ckckv9">)
    // Footer (found at: <footer class="css-11zhy3w">)
    // Next.js route announcer (found at: <next-route-announcer>)
    // Skip-to-content link inside header
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'next-route-announcer',
      'noscript',
      'link',
      'iframe',
    ]);

    // Remove the page title H1 outside main#content
    // Found at: <h1 class="css-1am6aje">Personalized Gifts, Favors and More | M&M'S</h1>
    const seoTitle = element.querySelector('h1.css-1am6aje');
    if (seoTitle && !seoTitle.closest('main#content')) {
      seoTitle.remove();
    }

    // Clean up hashed CSS class attributes (css-xxxxx, MuiGrid-xxx patterns)
    // Preserve class names that carry semantic meaning for block parsers
    element.querySelectorAll('*').forEach((el) => {
      // Remove tracking/analytics data attributes
      if (el.hasAttribute('data-testid')) el.removeAttribute('data-testid');
      if (el.hasAttribute('data-gtm')) el.removeAttribute('data-gtm');
      if (el.hasAttribute('data-track')) el.removeAttribute('data-track');
    });

    // Remove empty divs that are just MUI wrappers with no content
    element.querySelectorAll('div:empty').forEach((el) => {
      // Only remove if it has no meaningful attributes
      if (!el.id && !el.querySelector('*')) {
        el.remove();
      }
    });
  }
}
