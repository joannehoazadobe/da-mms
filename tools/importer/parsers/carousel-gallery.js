/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-gallery
 * Base block: carousel
 * Source: https://www.mms.com/en-us
 * Generated: 2026-05-19T00:00:00Z
 *
 * Extracts user-generated content gallery section with:
 * - Section heading ("fun in every color")
 * - Description paragraph (social media tagging CTA)
 * - Gallery slides with user photos and @username captions
 * - Branded hashtag (#shareyourfun)
 *
 * Each slide becomes a row with: image | caption/username
 * First row contains heading + description as intro content.
 */
export default function parse(element, { document }) {
  // Extract section heading
  const heading = element.querySelector('h2.MuiTypography-h3BoldSerif, h2[class*="BoldSerif"], h2');

  // Extract description paragraph
  const description = element.querySelector('p.MuiTypography-bodyMedium, .css-qzqmir p, .css-1x1ym9m p');

  // Extract gallery slides from swiper carousel
  const slides = Array.from(element.querySelectorAll('li.swiper-slide'));

  // Extract the hashtag text (appears in first slide overlay)
  const hashtagEl = element.querySelector('p.MuiTypography-h1BigBoldSerif, p[class*="h1BigBoldSerif"]');

  const cells = [];

  // Row 1: Intro content (heading + description + hashtag) as a single cell
  const introCell = document.createElement('div');
  if (heading) introCell.append(heading);
  if (description) introCell.append(description);
  if (hashtagEl) introCell.append(hashtagEl);
  if (introCell.childNodes.length > 0) {
    cells.push([introCell]);
  }

  // Rows 2+: One row per gallery slide (image | username)
  slides.forEach((slide) => {
    // Get the user photo - look for img with CDN src (not SVG data URIs)
    const img = slide.querySelector('img[src*="cdn.media.amplience"], img[href*="cdn.media.amplience"]');
    // Get the username caption (paragraph with @ text)
    const username = slide.querySelector('p[class*="bodyExtraSmallBoldSans"], p[class*="MuiTypography-bodyExtraSmall"]');

    if (img) {
      // Ensure the img has the proper src (some have href instead of src for CDN URL)
      const imgSrc = img.getAttribute('src') || img.getAttribute('href');
      if (imgSrc && imgSrc.includes('cdn.media.amplience')) {
        const slideRow = [];
        // Create a proper image element for the cell
        const imgEl = document.createElement('img');
        imgEl.src = imgSrc;
        imgEl.alt = img.alt || '';
        slideRow.push(imgEl);
        if (username) slideRow.push(username);
        cells.push(slideRow);
      }
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
