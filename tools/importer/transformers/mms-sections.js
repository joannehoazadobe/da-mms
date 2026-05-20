/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mms.com section breaks and section metadata.
 * Inserts <hr> elements between sections and adds Section Metadata blocks
 * for sections that have a style property defined in page-templates.json.
 *
 * Runs only in afterTransform hook using payload.template.sections data.
 * Processes sections in reverse order to avoid index shifting.
 *
 * Note: mms.com uses CSS-in-JS (css-xxxxx) hashed class names that change
 * between builds. The selectors in page-templates.json are validated against
 * the captured DOM at import time. When the live page has different class
 * names, fallback strategies use stable attributes (IDs, MUI component
 * classes, structural selectors) to locate section boundaries.
 *
 * All section selectors come from page-templates.json which were validated
 * against captured DOM in migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

/**
 * Find a section element using the primary selector with fallback strategies.
 * CSS-in-JS hashed class names change between builds so we use multiple approaches.
 */
function findSection(element, section) {
  // Try primary selector from template
  let el = null;
  try {
    el = element.querySelector(section.selector);
  } catch (e) {
    // Invalid selector syntax on this browser, skip
  }
  if (el) return el;

  // Fallback strategies based on section ID patterns
  switch (section.id) {
    case 'section-hero':
    case 'section-intro':
    case 'section-heading':
      // First section is always stable via structural selector
      el = element.querySelector('main#content > div > section:first-child');
      if (!el) el = element.querySelector('main#content section:first-of-type');
      break;

    case 'section-marquee':
      // The marquee is a scrolling text div with MuiTypography-h1BigLightSerif spans
      // It lives inside or after the first content-container in the hero section
      el = element.querySelector('.MuiTypography-h1BigLightSerif');
      if (el) el = el.closest('div[class*="css-"]');
      break;

    case 'section-mission':
      // Section containing "our mission" heading
      // Uses MuiTypography-h2LightSerif for the mission statement text
      el = element.querySelector('.MuiTypography-h2LightSerif');
      if (el) el = el.closest('section');
      break;

    case 'section-occasions':
      // Contains the #featured-occasions-slides element
      el = element.querySelector('#featured-occasions-slides');
      if (el) el = el.closest('section');
      break;

    case 'section-products':
      // Contains product cards with id="product-ct..."
      el = element.querySelector("div[id^='product-ct']");
      if (!el) el = element.querySelector("div[id^='product-']");
      if (el) el = el.closest('section');
      break;

    case 'section-promo':
    case 'section-personalize':
      // The personalization CTA section - find by heading content
      const promoHeadings = element.querySelectorAll('h2');
      for (const h of promoHeadings) {
        if (h.textContent.toLowerCase().includes('personal')) {
          el = h.closest('section');
          break;
        }
      }
      break;

    case 'section-gallery':
      // Last section on the page
      const allSections = element.querySelectorAll('main#content section');
      if (allSections.length > 0) {
        el = allSections[allSections.length - 1];
      }
      break;

    case 'section-timeline':
      // Middle sections (not first, not last)
      el = element.querySelector('main#content section:not(:first-child):not(:last-child)');
      break;

    case 'section-closing':
      // Last section
      el = element.querySelector('main#content > div > section:last-child');
      break;

    case 'section-categories':
      // Second section
      el = element.querySelector('main#content > div > section:nth-child(2)');
      break;

    default:
      break;
  }

  return el;
}

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { template } = payload || {};
    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    const doc = element.ownerDocument || document;
    const sections = template.sections;

    // Track which elements we've already processed to avoid duplicates
    const processed = new Set();

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = findSection(element, section);

      if (!sectionEl || processed.has(sectionEl)) {
        continue;
      }
      processed.add(sectionEl);

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Insert section metadata after the section element content
        sectionEl.append(sectionMetadata);
      }

      // Insert <hr> before each section that is not the first
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
