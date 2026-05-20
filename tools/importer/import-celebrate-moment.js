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
  name: 'celebrate-moment',
  description: 'Celebration and occasions landing pages featuring themed products and inspiration',
  urls: [
    'https://www.mms.com/en-us/celebrate/moments',
    'https://www.mms.com/en-us/celebrate/moments/birthday',
    'https://www.mms.com/en-us/celebrate/moments/wedding',
    'https://www.mms.com/en-us/celebrate/moments/graduation',
  ],
  blocks: [
    {
      name: 'hero-gradient',
      instances: ['main#content > div > section:first-child .MuiGrid-container'],
    },
    {
      name: 'carousel-marquee',
      instances: ['main#content .MuiTypography-h1BigLightSerif'],
    },
    {
      name: 'carousel-occasions',
      instances: ['main#content div[id^=\'product-\']'],
    },
    {
      name: 'columns-promo',
      instances: ['main#content section:has(h3)'],
    },
    {
      name: 'carousel-gallery',
      instances: ['main#content section:last-of-type:has(img[alt*=\'@\'])'],
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
      name: 'Marquee',
      selector: 'main#content > div > section:nth-child(2)',
      style: null,
      blocks: ['carousel-marquee'],
      defaultContent: [],
    },
    {
      id: 'section-products',
      name: 'Featured Products',
      selector: 'main#content section:has(div[id^=\'product-\'])',
      style: null,
      blocks: ['carousel-occasions'],
      defaultContent: ['main#content section:has(div[id^=\'product-\']) h2', 'main#content section:has(div[id^=\'product-\']) p'],
    },
    {
      id: 'section-personalize',
      name: 'Personalize',
      selector: 'main#content section:has(h3)',
      style: null,
      blocks: ['columns-promo'],
      defaultContent: [],
    },
    {
      id: 'section-gallery',
      name: 'User Gallery',
      selector: 'main#content section:last-of-type',
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
