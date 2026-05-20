/* eslint-disable */
/* global WebImporter */

import columnsTimelineParser from './parsers/columns-timeline.js';

import mmsCleanupTransformer from './transformers/mms-cleanup.js';
import mmsSectionsTransformer from './transformers/mms-sections.js';

const parsers = {
  'columns-timeline': columnsTimelineParser,
};

const PAGE_TEMPLATE = {
  name: 'explore-page',
  description: 'Brand exploration pages with about info, characters, and store locations',
  urls: [
    'https://www.mms.com/en-us/explore/about-us',
    'https://www.mms.com/en-us/explore',
    'https://www.mms.com/en-us/explore/mms-characters',
    'https://www.mms.com/en-us/explore/mms-stores',
  ],
  blocks: [
    {
      name: 'columns-timeline',
      instances: ['main#content section:not(:first-child):not(:last-child)'],
    },
  ],
  sections: [
    {
      id: 'section-intro',
      name: 'Intro Hero',
      selector: 'main#content > div > section:first-child',
      style: 'lentils-intro',
      blocks: [],
      defaultContent: ['main#content section:first-child h2', 'main#content section:first-child h3', 'main#content section:first-child p'],
    },
    {
      id: 'section-timeline',
      name: 'Timeline Entries',
      selector: 'main#content section:not(:first-child):not(:last-child)',
      style: null,
      blocks: ['columns-timeline'],
      defaultContent: [],
    },
    {
      id: 'section-closing',
      name: 'Closing CTA',
      selector: 'main#content > div > section:last-child',
      style: 'lentils-closing',
      blocks: [],
      defaultContent: ['main#content section:last-child h2', 'main#content section:last-child h3', 'main#content section:last-child p', 'main#content section:last-child a'],
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
