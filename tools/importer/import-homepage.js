/* eslint-disable */
/* global WebImporter */

import heroGradientParser from './parsers/hero-gradient.js';
import carouselMarqueeParser from './parsers/carousel-marquee.js';
import carouselOccasionsParser from './parsers/carousel-occasions.js';
import columnsPromoParser from './parsers/columns-promo.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';

import mmsCleanupTransformer from './transformers/mms-cleanup.js';
import mmsSectionsTransformer from './transformers/mms-sections.js';

const parsers = {
  'hero-gradient': heroGradientParser,
  'carousel-marquee': carouselMarqueeParser,
  'carousel-occasions': carouselOccasionsParser,
  'columns-promo': columnsPromoParser,
  'carousel-gallery': carouselGalleryParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main site homepage with hero banners, featured products, and promotional content',
  urls: ['https://www.mms.com/en-us'],
  blocks: [
    {
      name: 'hero-gradient',
      instances: ['main#content > div > section:first-child .content-container:first-child .MuiGrid-container'],
    },
    {
      name: 'carousel-marquee',
      instances: ['main#content .css-ko3u0t'],
    },
    {
      name: 'carousel-occasions',
      instances: ['#featured-occasions-slides', 'main#content div[id^=\'product-ct\']'],
    },
    {
      name: 'columns-promo',
      instances: ['main#content section.css-1icvowc'],
    },
    {
      name: 'carousel-gallery',
      instances: ['main#content section.css-1ob3jhi:last-of-type'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: 'main#content > div > section:first-child',
      style: null,
      blocks: ['hero-gradient'],
      defaultContent: [],
    },
    {
      id: 'section-marquee',
      name: 'Scrolling Marquee',
      selector: 'main#content > div > section:first-child .content-container ~ div',
      style: 'gold',
      blocks: ['carousel-marquee'],
      defaultContent: [],
    },
    {
      id: 'section-mission',
      name: 'Mission Statement',
      selector: 'section.css-zvpdw2',
      style: null,
      blocks: [],
      defaultContent: ['section.css-zvpdw2 h2', 'section.css-zvpdw2 h1', 'section.css-zvpdw2 p', 'section.css-zvpdw2 a'],
    },
    {
      id: 'section-occasions',
      name: 'Celebrate Every Moment',
      selector: 'section.css-1ob3jhi:has(#featured-occasions-slides)',
      style: null,
      blocks: ['carousel-occasions'],
      defaultContent: [],
    },
    {
      id: 'section-products',
      name: 'Featured Products',
      selector: 'section.css-1ob3jhi:has(div[id^=\'product-ct\'])',
      style: null,
      blocks: ['carousel-occasions'],
      defaultContent: [],
    },
    {
      id: 'section-promo',
      name: 'Personalization CTA',
      selector: 'section.css-1icvowc',
      style: null,
      blocks: ['columns-promo'],
      defaultContent: [],
    },
    {
      id: 'section-gallery',
      name: 'Social Proof Gallery',
      selector: 'main#content section.css-1ob3jhi:last-of-type',
      style: null,
      blocks: ['carousel-gallery'],
      defaultContent: [],
    },
  ],
};

const transformers = [
  mmsCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [mmsSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
