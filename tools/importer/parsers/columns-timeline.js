/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-timeline
 * Base block: columns
 * Source: https://www.mms.com/en-us/explore/about-us
 * Selector: main#content section:not(:first-child):not(:last-child)
 * Generated: 2026-05-19T19:33:00Z
 *
 * Structure: Each timeline section contains a 2-column layout with:
 * - Image column: a picture element showing a historical product/character photo
 * - Text column: eyebrow span ("Year"), h3 heading (decade), and paragraph (description)
 *
 * The source DOM has:
 *   section.css-1ob3jhi > div.css-jhl78h > div > div > div.content-container
 *     - div.css-3sio8 (image wrapper with nested divs > picture > img.css-1ajpiyg)
 *     - div.css-1upg7d5 (text wrapper with span eyebrow + h3 + p)
 *
 * Output: Single row with 2 cells [imageCell, textCell]
 * The block decoration adds .columns-timeline-img-col to picture-only columns.
 */
export default function parse(element, { document }) {
  // Find the content container - try specific class first, then fall back to broader search
  const contentContainer = element.querySelector('.content-container, [class*="content-container"]')
    || element;

  // Extract image - look for picture element anywhere in this section
  const picture = contentContainer.querySelector('picture') || element.querySelector('picture');

  // Extract text content elements
  // Eyebrow: span with "Year" or similar small bold text
  const eyebrow = contentContainer.querySelector(
    'span[class*="bodyExtraSmallBoldSans"], span[class*="ExtraSmall"], span[class*="eyebrow"]'
  ) || element.querySelector(
    'span[class*="bodyExtraSmallBoldSans"], span[class*="ExtraSmall"], span[class*="eyebrow"]'
  );

  // Heading: h3 (decade heading like "1940's")
  const heading = contentContainer.querySelector(
    'h3[class*="h3BoldSerif"], h3[class*="BoldSerif"], h3, h2'
  ) || element.querySelector('h3, h2');

  // Description paragraph
  const description = contentContainer.querySelector(
    'p[class*="bodyMedium"], p[class*="MuiTypography-body"], p'
  ) || element.querySelector('p[class*="bodyMedium"], p');

  // Only create block if we found meaningful content (at least image or text)
  if (!picture && !heading && !description) return;

  // Build image cell
  const imageCell = [];
  if (picture) {
    imageCell.push(picture);
  }

  // Build text cell with eyebrow + heading + paragraph
  const textCell = [];
  if (eyebrow) {
    textCell.push(eyebrow);
  }
  if (heading) {
    textCell.push(heading);
  }
  if (description) {
    textCell.push(description);
  }

  // Build cells array: single row with [imageCell, textCell]
  const cells = [];
  if (imageCell.length > 0 || textCell.length > 0) {
    cells.push([imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-timeline', cells });
  element.replaceWith(block);
}
