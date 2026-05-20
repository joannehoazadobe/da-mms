/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-occasions
 * Base block: carousel
 * Source: https://www.mms.com/en-us
 * Generated: 2026-05-19
 *
 * Handles two carousel instance types:
 * 1. Occasions carousel (#featured-occasions-slides) - category cards with image + label
 * 2. Product carousel (div[id^='product-ct']) - product cards with image, title, price
 *
 * Content model per slide row:
 *   Column 0 (image): product/occasion image
 *   Column 1 (content): link with heading text, optional price
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance type we are dealing with
  const isOccasionsCarousel = element.id === 'featured-occasions-slides' || element.querySelector('#featured-occasions-slides');
  const isProductCard = element.id && element.id.startsWith('product-ct') && !element.id.includes('price');

  if (isOccasionsCarousel) {
    // Instance 1: Occasions carousel with swiper slides
    // Structure: div.swiper#featured-occasions-slides > ul.swiper-wrapper > li.swiper-slide > a > picture + span
    const swiperContainer = element.id === 'featured-occasions-slides' ? element : element.querySelector('#featured-occasions-slides');
    const slides = swiperContainer ? Array.from(swiperContainer.querySelectorAll(':scope ul.swiper-wrapper > li.swiper-slide')) : [];

    slides.forEach((slide) => {
      const link = slide.querySelector('a');
      if (!link) return;

      // Extract image from picture element inside the anchor
      const img = link.querySelector('picture img, img[src*="amplience"]');
      // Extract occasion label from span (MuiTypography-h5BoldSerif)
      const label = link.querySelector('span[class*="MuiTypography"]');

      // Build image cell
      const imageCell = document.createElement('div');
      if (img) {
        const newImg = document.createElement('img');
        newImg.src = img.getAttribute('src') || img.getAttribute('href') || '';
        newImg.alt = img.getAttribute('alt') || '';
        imageCell.appendChild(newImg);
      }

      // Build content cell with linked heading
      const contentCell = document.createElement('div');
      const newLink = document.createElement('a');
      newLink.href = link.getAttribute('href') || '';
      const heading = document.createElement('h3');
      heading.textContent = label ? label.textContent.trim() : '';
      newLink.appendChild(heading);
      contentCell.appendChild(newLink);

      cells.push([imageCell, contentCell]);
    });
  } else if (isProductCard) {
    // Instance 2: Single product card (div[id^='product-ct'])
    // Structure: div#product-ctXXXX > div.css-bi40tp > div.flavorRemixImageWrapper + div.flavorRemixTitleWrapper
    //            + div.css-8dyv3k (price area)

    // Extract primary product image
    const imageWrapper = element.querySelector('.flavorRemixImageWrapper, div[class*="ImageWrapper"]');
    const img = imageWrapper ? imageWrapper.querySelector('picture img, img[src*="amplience"]') : element.querySelector('picture img, img[src*="amplience"]');

    // Extract product title and link
    const titleWrapper = element.querySelector('.flavorRemixTitleWrapper, div[class*="TitleWrapper"]');
    const titleLink = titleWrapper ? titleWrapper.querySelector('a') : element.querySelector('a[href*="-p.html"]');
    const titleHeading = titleLink ? titleLink.querySelector('h3, h2, h4') : null;

    // Extract price
    const priceContainer = element.querySelector('div[class*="8dyv3k"], span[id$="-price"]');
    const priceEl = priceContainer ? priceContainer.querySelector('ins span[class*="css-yigud2"], span[class*="css-yigud2"]') : null;

    // Build image cell
    const imageCell = document.createElement('div');
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src') || '';
      newImg.alt = img.getAttribute('alt') || '';
      imageCell.appendChild(newImg);
    }

    // Build content cell with product title link and price
    const contentCell = document.createElement('div');
    if (titleLink && titleHeading) {
      const newLink = document.createElement('a');
      newLink.href = titleLink.getAttribute('href') || '';
      const heading = document.createElement('h3');
      heading.textContent = titleHeading.textContent.trim();
      newLink.appendChild(heading);
      contentCell.appendChild(newLink);
    }
    if (priceEl) {
      const pricePara = document.createElement('p');
      pricePara.textContent = priceEl.textContent.trim();
      contentCell.appendChild(pricePara);
    }

    cells.push([imageCell, contentCell]);
  }

  // Fallback: if no cells were generated, attempt generic extraction
  if (cells.length === 0) {
    const allLinks = Array.from(element.querySelectorAll('a[href]'));
    allLinks.forEach((link) => {
      const img = link.querySelector('img') || link.previousElementSibling?.querySelector('img');
      const text = link.textContent.trim();

      const imageCell = document.createElement('div');
      if (img) {
        const newImg = document.createElement('img');
        newImg.src = img.getAttribute('src') || '';
        newImg.alt = img.getAttribute('alt') || '';
        imageCell.appendChild(newImg);
      }

      const contentCell = document.createElement('div');
      if (text) {
        const heading = document.createElement('h3');
        heading.textContent = text;
        const newLink = document.createElement('a');
        newLink.href = link.getAttribute('href') || '';
        newLink.appendChild(heading);
        contentCell.appendChild(newLink);
      }

      if (img || text) {
        cells.push([imageCell, contentCell]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-occasions', cells });
  element.replaceWith(block);
}
