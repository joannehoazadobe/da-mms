/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo
 * Base block: columns
 * Source: https://www.mms.com/en-us
 * Selector: main#content section.css-1icvowc
 * Generated: 2026-05-19
 *
 * Structure: A promotional section with a heading/description above a grid
 * of 3 promotional cards. Each card has an image, heading, description, and CTA.
 * The section heading becomes default content above the block.
 * Each card maps to a column cell in a single row.
 */
export default function parse(element, { document }) {
  // Extract the section heading and description (will become default content above block)
  const sectionHeading = element.querySelector('div.css-qyx0d0 h2, .MuiTypography-h2BoldSerif');
  const sectionDescription = element.querySelector('div.css-qyx0d0 p, .css-qyx0d0 .MuiTypography-bodyMedium');

  // Find all card containers (MuiGrid items within the grid container)
  const gridItems = element.querySelectorAll('.MuiGrid-item');

  // Build the columns: one row with N cells (one per card)
  const cells = [];
  const row = [];

  gridItems.forEach((gridItem) => {
    const cellContent = [];

    // Extract card image (the main product/lifestyle photo, not decorative SVG icons)
    const picture = gridItem.querySelector('picture');
    if (picture) {
      cellContent.push(picture);
    }

    // Extract card heading (h3)
    const heading = gridItem.querySelector('h3, .MuiTypography-h4BoldSerif, [class*="h4BoldSerif"]');
    if (heading) {
      cellContent.push(heading);
    }

    // Extract card description (p inside the text area, not the button text)
    const description = gridItem.querySelector('.css-1acn5wy p, .MuiTypography-bodySmall');
    if (description) {
      cellContent.push(description);
    }

    // Extract CTA link
    const ctaLink = gridItem.querySelector('a.ButtonUnstyled-root, a[class*="ButtonUnstyled"]');
    if (ctaLink) {
      // Create a clean link element with just the text content
      const link = document.createElement('a');
      link.href = ctaLink.href;
      // Get the visible text from the button (skip decorative SVG icon spans)
      const textSpan = ctaLink.querySelector('.css-yjflkb, span span:last-child');
      link.textContent = textSpan ? textSpan.textContent.trim() : ctaLink.textContent.trim();
      cellContent.push(link);
    }

    if (cellContent.length > 0) {
      row.push(cellContent);
    }
  });

  if (row.length > 0) {
    cells.push(row);
  }

  // Insert section heading as default content before the block
  if (sectionHeading || sectionDescription) {
    const wrapper = document.createElement('div');
    if (sectionHeading) {
      wrapper.append(sectionHeading);
    }
    if (sectionDescription) {
      wrapper.append(sectionDescription);
    }
    element.before(wrapper);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
