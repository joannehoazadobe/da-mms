/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-explore-page.js
  var import_explore_page_exports = {};
  __export(import_explore_page_exports, {
    default: () => import_explore_page_default
  });

  // tools/importer/parsers/columns-timeline.js
  function parse(element, { document: document2 }) {
    const contentContainer = element.querySelector('.content-container, [class*="content-container"]') || element;
    const picture = contentContainer.querySelector("picture") || element.querySelector("picture");
    const eyebrow = contentContainer.querySelector(
      'span[class*="bodyExtraSmallBoldSans"], span[class*="ExtraSmall"], span[class*="eyebrow"]'
    ) || element.querySelector(
      'span[class*="bodyExtraSmallBoldSans"], span[class*="ExtraSmall"], span[class*="eyebrow"]'
    );
    const heading = contentContainer.querySelector(
      'h3[class*="h3BoldSerif"], h3[class*="BoldSerif"], h3, h2'
    ) || element.querySelector("h3, h2");
    const description = contentContainer.querySelector(
      'p[class*="bodyMedium"], p[class*="MuiTypography-body"], p'
    ) || element.querySelector('p[class*="bodyMedium"], p');
    if (!picture && !heading && !description) return;
    const imageCell = [];
    if (picture) {
      imageCell.push(picture);
    }
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
    const cells = [];
    if (imageCell.length > 0 || textCell.length > 0) {
      cells.push([imageCell, textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-timeline", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/mms-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".kl-private-reset-css-Xuajs1",
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="adsrvr.org"]',
        'iframe[src*="clinch.co"]',
        "iframe.ot-text-resize",
        "#dynamic-react-root",
        'div[id^="batBeacon"]'
      ]);
      const nested = element.querySelectorAll("span > span:only-child");
      nested.forEach((span) => {
        if (span.textContent.trim() === "" && !span.querySelector("img")) {
          span.parentElement.remove();
        }
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "next-route-announcer",
        "noscript",
        "link",
        "iframe"
      ]);
      const seoTitle = element.querySelector("h1.css-1am6aje");
      if (seoTitle && !seoTitle.closest("main#content")) {
        seoTitle.remove();
      }
      element.querySelectorAll("*").forEach((el) => {
        if (el.hasAttribute("data-testid")) el.removeAttribute("data-testid");
        if (el.hasAttribute("data-gtm")) el.removeAttribute("data-gtm");
        if (el.hasAttribute("data-track")) el.removeAttribute("data-track");
      });
      element.querySelectorAll("div:empty").forEach((el) => {
        if (!el.id && !el.querySelector("*")) {
          el.remove();
        }
      });
    }
  }

  // tools/importer/transformers/mms-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function findSection(element, section) {
    let el = null;
    try {
      el = element.querySelector(section.selector);
    } catch (e) {
    }
    if (el) return el;
    switch (section.id) {
      case "section-hero":
      case "section-intro":
      case "section-heading":
        el = element.querySelector("main#content > div > section:first-child");
        if (!el) el = element.querySelector("main#content section:first-of-type");
        break;
      case "section-marquee":
        el = element.querySelector(".MuiTypography-h1BigLightSerif");
        if (el) el = el.closest('div[class*="css-"]');
        break;
      case "section-mission":
        el = element.querySelector(".MuiTypography-h2LightSerif");
        if (el) el = el.closest("section");
        break;
      case "section-occasions":
        el = element.querySelector("#featured-occasions-slides");
        if (el) el = el.closest("section");
        break;
      case "section-products":
        el = element.querySelector("div[id^='product-ct']");
        if (!el) el = element.querySelector("div[id^='product-']");
        if (el) el = el.closest("section");
        break;
      case "section-promo":
      case "section-personalize":
        const promoHeadings = element.querySelectorAll("h2");
        for (const h of promoHeadings) {
          if (h.textContent.toLowerCase().includes("personal")) {
            el = h.closest("section");
            break;
          }
        }
        break;
      case "section-gallery":
        const allSections = element.querySelectorAll("main#content section");
        if (allSections.length > 0) {
          el = allSections[allSections.length - 1];
        }
        break;
      case "section-timeline":
        el = element.querySelector("main#content section:not(:first-child):not(:last-child)");
        break;
      case "section-closing":
        el = element.querySelector("main#content > div > section:last-child");
        break;
      case "section-categories":
        el = element.querySelector("main#content > div > section:nth-child(2)");
        break;
      default:
        break;
    }
    return el;
  }
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload || {};
      if (!template || !template.sections || template.sections.length < 2) {
        return;
      }
      const doc = element.ownerDocument || document;
      const sections = template.sections;
      const processed = /* @__PURE__ */ new Set();
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = findSection(element, section);
        if (!sectionEl || processed.has(sectionEl)) {
          continue;
        }
        processed.add(sectionEl);
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(sectionMetadata);
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-explore-page.js
  var parsers = {
    "columns-timeline": parse
  };
  var PAGE_TEMPLATE = {
    name: "explore-page",
    description: "Brand exploration pages with about info, characters, and store locations",
    urls: [
      "https://www.mms.com/en-us/explore/about-us",
      "https://www.mms.com/en-us/explore",
      "https://www.mms.com/en-us/explore/mms-characters",
      "https://www.mms.com/en-us/explore/mms-stores"
    ],
    blocks: [
      {
        name: "columns-timeline",
        instances: ["main#content section:not(:first-child):not(:last-child)"]
      }
    ],
    sections: [
      {
        id: "section-intro",
        name: "Intro Hero",
        selector: "main#content > div > section:first-child",
        style: "lentils-intro",
        blocks: [],
        defaultContent: ["main#content section:first-child h2", "main#content section:first-child h3", "main#content section:first-child p"]
      },
      {
        id: "section-timeline",
        name: "Timeline Entries",
        selector: "main#content section:not(:first-child):not(:last-child)",
        style: null,
        blocks: ["columns-timeline"],
        defaultContent: []
      },
      {
        id: "section-closing",
        name: "Closing CTA",
        selector: "main#content > div > section:last-child",
        style: "lentils-closing",
        blocks: [],
        defaultContent: ["main#content section:last-child h2", "main#content section:last-child h3", "main#content section:last-child p", "main#content section:last-child a"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_explore_page_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_explore_page_exports);
})();
