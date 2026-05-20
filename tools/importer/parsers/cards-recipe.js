/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-recipe variant.
 * Base block: cards
 * Source: https://www.mms.com/en-us/recipes
 * Selector: main#content ul li a[href*='recipes']
 *
 * Each matched element is an <a> within a <li> containing a recipe category card.
 * Structure per anchor:
 *   <a href="/en-us/{category}-recipes">
 *     <div class="css-13bie21">  (image container)
 *       <div class="css-1bfmyx7"> <picture><img></picture> </div>
 *     </div>
 *     <div class="css-1yltisf">  (label container)
 *       <span class="MuiTypography-h6BoldSerif">category name</span>
 *     </div>
 *   </a>
 *
 * Output: one row per card with [image, linked label].
 * Consecutive same-name blocks merge during import.
 *
 * Generated: 2026-05-19
 */
export default function parse(element, { document }) {
  // The element is an <a> tag within a recipe category list item
  // Extract the picture element (recipe image)
  const picture = element.querySelector('picture');

  // Extract the category label text from the span
  const labelSpan = element.querySelector('span.MuiTypography-h6BoldSerif, span[class*="h6BoldSerif"], span[class*="MuiTypography"]');
  const labelText = labelSpan ? labelSpan.textContent.trim() : element.textContent.trim();

  // Build a linked label to preserve the category link
  const link = document.createElement('a');
  link.href = element.href || element.getAttribute('href');
  link.textContent = labelText;

  // Build cells: each row = [image cell, body cell]
  // The block decorator expects two child divs per row:
  //   - one with just a picture (becomes cards-recipe-card-image)
  //   - one with other content (becomes cards-recipe-card-body)
  const cells = [];

  if (picture) {
    cells.push([picture, link]);
  } else {
    // Fallback: try img element directly
    const img = element.querySelector('img');
    if (img) {
      cells.push([img, link]);
    } else {
      cells.push([link]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-recipe', cells });
  element.replaceWith(block);
}
