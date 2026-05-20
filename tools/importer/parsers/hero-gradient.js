/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-gradient
 * Base block: hero
 * Source: https://www.mms.com/en-us
 * Generated: 2026-05-19
 *
 * Structure:
 *   Row 1 (optional): Product/hero image
 *   Row 2: Eyebrow text, heading (light + bold), CTA buttons
 *
 * Source DOM:
 *   - MuiGrid-container with two MuiGrid-item columns (50/50 split)
 *   - Left column: eyebrow h2 (.MuiTypography-bodySmallBoldSans), heading h2 with spans
 *     (.MuiTypography-h1BigLightSerif + .MuiTypography-h1BigBoldSerif), CTAs (a.ButtonUnstyled-root)
 *   - Right column: product image in .css-1bfmyx7 > picture
 */
export default function parse(element, { document }) {
  // --- Extract from left column ---

  // Eyebrow: first h2 with bodySmallBoldSans class (promo code text)
  const eyebrow = element.querySelector('h2.MuiTypography-bodySmallBoldSans, h2[class*="bodySmallBoldSans"]');

  // Heading: the h2 containing the light + bold spans (not the eyebrow)
  // This is the second h2 or the one containing h1BigLightSerif/h1BigBoldSerif spans
  const headingWrapper = element.querySelector('h2:has(span[class*="h1BigLightSerif"]), h2:has(span[class*="h1BigBoldSerif"])');

  // If heading wrapper not found via :has, fallback to find by class pattern on spans
  let heading = headingWrapper;
  if (!heading) {
    const lightSpan = element.querySelector('span[class*="h1BigLightSerif"]');
    if (lightSpan) {
      heading = lightSpan.closest('h2');
    }
  }

  // Ensure whitespace between light and bold heading spans
  if (heading) {
    const lightSpan = heading.querySelector('span[class*="h1BigLightSerif"]');
    const boldSpan = heading.querySelector('span[class*="h1BigBoldSerif"]');
    if (lightSpan && boldSpan && lightSpan.nextSibling === boldSpan) {
      heading.insertBefore(document.createTextNode(' '), boldSpan);
    }
  }

  // CTA buttons: links with ButtonUnstyled-root class
  const ctaLinks = Array.from(element.querySelectorAll('a.ButtonUnstyled-root, a[class*="ButtonUnstyled"]'));

  // Clean CTA links: remove inline SVG icon images (keep only text)
  ctaLinks.forEach((cta) => {
    const iconImgs = cta.querySelectorAll('img[src^="data:image/svg"]');
    iconImgs.forEach((img) => img.remove());
  });

  // --- Extract from right column ---

  // Product image: the main large image in the right column (in .css-1bfmyx7 or similar picture wrapper)
  // Look for picture elements that contain a real image (not SVG icons, not tiny lentil images)
  let productImage = null;
  const pictures = Array.from(element.querySelectorAll('picture'));
  for (const pic of pictures) {
    const img = pic.querySelector('img');
    if (img && img.getAttribute('alt') && img.getAttribute('src') && !img.getAttribute('src').startsWith('data:')) {
      // Found a real image with alt text (the main product image)
      productImage = pic;
      break;
    }
  }

  // Fallback: look for any non-decorative img in the second MuiGrid-item column
  if (!productImage) {
    const rightColumn = element.querySelector('.MuiGrid-item:nth-child(2), .MuiGrid-item[class*="MuiGrid-grid-lg-6"]:last-child');
    if (rightColumn) {
      const img = rightColumn.querySelector('img[alt]:not([src^="data:"])');
      if (img) {
        productImage = img.closest('picture') || img;
      }
    }
  }

  // --- Build cells array matching block library structure ---
  const cells = [];

  // Row 1 (optional): Product/hero image
  if (productImage) {
    cells.push([productImage]);
  }

  // Row 2: Single content cell with eyebrow + heading + CTAs
  // Wrap all content elements in a single container so they appear in one cell
  const contentWrapper = document.createElement('div');
  if (eyebrow) {
    contentWrapper.append(eyebrow);
  }
  if (heading) {
    contentWrapper.append(heading);
  }
  if (ctaLinks.length > 0) {
    const ctaWrapper = document.createElement('p');
    ctaLinks.forEach((cta) => ctaWrapper.append(cta));
    contentWrapper.append(ctaWrapper);
  }
  cells.push([contentWrapper]);

  // Create block with exact variant name
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-gradient', cells });
  element.replaceWith(block);
}
