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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-gradient.js
  function parse(element, { document: document2 }) {
    const eyebrow = element.querySelector('h2.MuiTypography-bodySmallBoldSans, h2[class*="bodySmallBoldSans"]');
    const headingWrapper = element.querySelector('h2:has(span[class*="h1BigLightSerif"]), h2:has(span[class*="h1BigBoldSerif"])');
    let heading = headingWrapper;
    if (!heading) {
      const lightSpan = element.querySelector('span[class*="h1BigLightSerif"]');
      if (lightSpan) {
        heading = lightSpan.closest("h2");
      }
    }
    if (heading) {
      const lightSpan = heading.querySelector('span[class*="h1BigLightSerif"]');
      const boldSpan = heading.querySelector('span[class*="h1BigBoldSerif"]');
      if (lightSpan && boldSpan && lightSpan.nextSibling === boldSpan) {
        heading.insertBefore(document2.createTextNode(" "), boldSpan);
      }
    }
    const ctaLinks = Array.from(element.querySelectorAll('a.ButtonUnstyled-root, a[class*="ButtonUnstyled"]'));
    ctaLinks.forEach((cta) => {
      const iconImgs = cta.querySelectorAll('img[src^="data:image/svg"]');
      iconImgs.forEach((img) => img.remove());
    });
    let productImage = null;
    const pictures = Array.from(element.querySelectorAll("picture"));
    for (const pic of pictures) {
      const img = pic.querySelector("img");
      if (img && img.getAttribute("alt") && img.getAttribute("src") && !img.getAttribute("src").startsWith("data:")) {
        productImage = pic;
        break;
      }
    }
    if (!productImage) {
      const rightColumn = element.querySelector('.MuiGrid-item:nth-child(2), .MuiGrid-item[class*="MuiGrid-grid-lg-6"]:last-child');
      if (rightColumn) {
        const img = rightColumn.querySelector('img[alt]:not([src^="data:"])');
        if (img) {
          productImage = img.closest("picture") || img;
        }
      }
    }
    const cells = [];
    if (productImage) {
      cells.push([productImage]);
    }
    const contentWrapper = document2.createElement("div");
    if (eyebrow) {
      contentWrapper.append(eyebrow);
    }
    if (heading) {
      contentWrapper.append(heading);
    }
    if (ctaLinks.length > 0) {
      const ctaWrapper = document2.createElement("p");
      ctaLinks.forEach((cta) => ctaWrapper.append(cta));
      contentWrapper.append(ctaWrapper);
    }
    cells.push([contentWrapper]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-gradient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-marquee.js
  function parse2(element, { document: document2 }) {
    const rows = Array.from(element.querySelectorAll(":scope > div"));
    const cells = [];
    rows.forEach((row) => {
      const cellContent = extractUniqueKeywords(row, document2);
      if (cellContent.length > 0) {
        cells.push(cellContent);
      }
    });
    if (cells.length === 0) {
      const fallbackRows = Array.from(
        element.querySelectorAll("div:has(> .MuiTypography-h1BigLightSerif)")
      );
      fallbackRows.forEach((row) => {
        const cellContent = extractUniqueKeywords(row, document2);
        if (cellContent.length > 0) {
          cells.push(cellContent);
        }
      });
    }
    if (cells.length === 0) {
      const allSpans = Array.from(
        element.querySelectorAll('.MuiTypography-h1BigLightSerif, [class*="h1BigLightSerif"]')
      );
      if (allSpans.length > 0) {
        const allKeywords = allSpans.map((s) => s.textContent.trim()).filter(Boolean);
        const unique = deduplicatePattern(allKeywords);
        const p = document2.createElement("p");
        p.textContent = unique.join(" & ");
        cells.push([p]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-marquee", cells });
    element.replaceWith(block);
  }
  function extractUniqueKeywords(row, document2) {
    if (!row) return [];
    const keywordSpans = Array.from(
      row.querySelectorAll('.MuiTypography-h1BigLightSerif, [class*="h1BigLightSerif"]')
    );
    if (keywordSpans.length === 0) {
      const allSpans = Array.from(row.querySelectorAll("span"));
      const nonAmpSpans = allSpans.filter((s) => s.textContent.trim() !== "&");
      if (nonAmpSpans.length === 0) return [];
      return buildKeywordCell(nonAmpSpans, document2);
    }
    return buildKeywordCell(keywordSpans, document2);
  }
  function buildKeywordCell(spans, document2) {
    const allKeywords = spans.map((s) => s.textContent.trim()).filter(Boolean);
    const uniqueKeywords = deduplicatePattern(allKeywords);
    if (uniqueKeywords.length === 0) return [];
    const p = document2.createElement("p");
    p.textContent = uniqueKeywords.join(" & ");
    return [p];
  }
  function deduplicatePattern(keywords) {
    if (keywords.length === 0) return [];
    for (let patternLen = 1; patternLen <= Math.floor(keywords.length / 2); patternLen++) {
      if (keywords.length % patternLen !== 0) continue;
      const pattern = keywords.slice(0, patternLen);
      let isRepeating = true;
      for (let i = patternLen; i < keywords.length; i++) {
        if (keywords[i] !== pattern[i % patternLen]) {
          isRepeating = false;
          break;
        }
      }
      if (isRepeating) return pattern;
    }
    return keywords;
  }

  // tools/importer/parsers/carousel-occasions.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const isOccasionsCarousel = element.id === "featured-occasions-slides" || element.querySelector("#featured-occasions-slides");
    const isProductCard = element.id && element.id.startsWith("product-ct") && !element.id.includes("price");
    if (isOccasionsCarousel) {
      const swiperContainer = element.id === "featured-occasions-slides" ? element : element.querySelector("#featured-occasions-slides");
      const slides = swiperContainer ? Array.from(swiperContainer.querySelectorAll(":scope ul.swiper-wrapper > li.swiper-slide")) : [];
      slides.forEach((slide) => {
        const link = slide.querySelector("a");
        if (!link) return;
        const img = link.querySelector('picture img, img[src*="amplience"]');
        const label = link.querySelector('span[class*="MuiTypography"]');
        const imageCell = document2.createElement("div");
        if (img) {
          const newImg = document2.createElement("img");
          newImg.src = img.getAttribute("src") || img.getAttribute("href") || "";
          newImg.alt = img.getAttribute("alt") || "";
          imageCell.appendChild(newImg);
        }
        const contentCell = document2.createElement("div");
        const newLink = document2.createElement("a");
        newLink.href = link.getAttribute("href") || "";
        const heading = document2.createElement("h3");
        heading.textContent = label ? label.textContent.trim() : "";
        newLink.appendChild(heading);
        contentCell.appendChild(newLink);
        cells.push([imageCell, contentCell]);
      });
    } else if (isProductCard) {
      const imageWrapper = element.querySelector('.flavorRemixImageWrapper, div[class*="ImageWrapper"]');
      const img = imageWrapper ? imageWrapper.querySelector('picture img, img[src*="amplience"]') : element.querySelector('picture img, img[src*="amplience"]');
      const titleWrapper = element.querySelector('.flavorRemixTitleWrapper, div[class*="TitleWrapper"]');
      const titleLink = titleWrapper ? titleWrapper.querySelector("a") : element.querySelector('a[href*="-p.html"]');
      const titleHeading = titleLink ? titleLink.querySelector("h3, h2, h4") : null;
      const priceContainer = element.querySelector('div[class*="8dyv3k"], span[id$="-price"]');
      const priceEl = priceContainer ? priceContainer.querySelector('ins span[class*="css-yigud2"], span[class*="css-yigud2"]') : null;
      const imageCell = document2.createElement("div");
      if (img) {
        const newImg = document2.createElement("img");
        newImg.src = img.getAttribute("src") || "";
        newImg.alt = img.getAttribute("alt") || "";
        imageCell.appendChild(newImg);
      }
      const contentCell = document2.createElement("div");
      if (titleLink && titleHeading) {
        const newLink = document2.createElement("a");
        newLink.href = titleLink.getAttribute("href") || "";
        const heading = document2.createElement("h3");
        heading.textContent = titleHeading.textContent.trim();
        newLink.appendChild(heading);
        contentCell.appendChild(newLink);
      }
      if (priceEl) {
        const pricePara = document2.createElement("p");
        pricePara.textContent = priceEl.textContent.trim();
        contentCell.appendChild(pricePara);
      }
      cells.push([imageCell, contentCell]);
    }
    if (cells.length === 0) {
      const allLinks = Array.from(element.querySelectorAll("a[href]"));
      allLinks.forEach((link) => {
        var _a;
        const img = link.querySelector("img") || ((_a = link.previousElementSibling) == null ? void 0 : _a.querySelector("img"));
        const text = link.textContent.trim();
        const imageCell = document2.createElement("div");
        if (img) {
          const newImg = document2.createElement("img");
          newImg.src = img.getAttribute("src") || "";
          newImg.alt = img.getAttribute("alt") || "";
          imageCell.appendChild(newImg);
        }
        const contentCell = document2.createElement("div");
        if (text) {
          const heading = document2.createElement("h3");
          heading.textContent = text;
          const newLink = document2.createElement("a");
          newLink.href = link.getAttribute("href") || "";
          newLink.appendChild(heading);
          contentCell.appendChild(newLink);
        }
        if (img || text) {
          cells.push([imageCell, contentCell]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-occasions", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse4(element, { document: document2 }) {
    const sectionHeading = element.querySelector("div.css-qyx0d0 h2, .MuiTypography-h2BoldSerif");
    const sectionDescription = element.querySelector("div.css-qyx0d0 p, .css-qyx0d0 .MuiTypography-bodyMedium");
    const gridItems = element.querySelectorAll(".MuiGrid-item");
    const cells = [];
    const row = [];
    gridItems.forEach((gridItem) => {
      const cellContent = [];
      const picture = gridItem.querySelector("picture");
      if (picture) {
        cellContent.push(picture);
      }
      const heading = gridItem.querySelector('h3, .MuiTypography-h4BoldSerif, [class*="h4BoldSerif"]');
      if (heading) {
        cellContent.push(heading);
      }
      const description = gridItem.querySelector(".css-1acn5wy p, .MuiTypography-bodySmall");
      if (description) {
        cellContent.push(description);
      }
      const ctaLink = gridItem.querySelector('a.ButtonUnstyled-root, a[class*="ButtonUnstyled"]');
      if (ctaLink) {
        const link = document2.createElement("a");
        link.href = ctaLink.href;
        const textSpan = ctaLink.querySelector(".css-yjflkb, span span:last-child");
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
    if (sectionHeading || sectionDescription) {
      const wrapper = document2.createElement("div");
      if (sectionHeading) {
        wrapper.append(sectionHeading);
      }
      if (sectionDescription) {
        wrapper.append(sectionDescription);
      }
      element.before(wrapper);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse5(element, { document: document2 }) {
    const heading = element.querySelector('h2.MuiTypography-h3BoldSerif, h2[class*="BoldSerif"], h2');
    const description = element.querySelector("p.MuiTypography-bodyMedium, .css-qzqmir p, .css-1x1ym9m p");
    const slides = Array.from(element.querySelectorAll("li.swiper-slide"));
    const hashtagEl = element.querySelector('p.MuiTypography-h1BigBoldSerif, p[class*="h1BigBoldSerif"]');
    const cells = [];
    const introCell = document2.createElement("div");
    if (heading) introCell.append(heading);
    if (description) introCell.append(description);
    if (hashtagEl) introCell.append(hashtagEl);
    if (introCell.childNodes.length > 0) {
      cells.push([introCell]);
    }
    slides.forEach((slide) => {
      const img = slide.querySelector('img[src*="cdn.media.amplience"], img[href*="cdn.media.amplience"]');
      const username = slide.querySelector('p[class*="bodyExtraSmallBoldSans"], p[class*="MuiTypography-bodyExtraSmall"]');
      if (img) {
        const imgSrc = img.getAttribute("src") || img.getAttribute("href");
        if (imgSrc && imgSrc.includes("cdn.media.amplience")) {
          const slideRow = [];
          const imgEl = document2.createElement("img");
          imgEl.src = imgSrc;
          imgEl.alt = img.alt || "";
          slideRow.push(imgEl);
          if (username) slideRow.push(username);
          cells.push(slideRow);
        }
      }
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-gallery", cells });
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-gradient": parse,
    "carousel-marquee": parse2,
    "carousel-occasions": parse3,
    "columns-promo": parse4,
    "carousel-gallery": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main site homepage with hero banners, featured products, and promotional content",
    urls: ["https://www.mms.com/en-us"],
    blocks: [
      {
        name: "hero-gradient",
        instances: ["main#content > div > section:first-child .content-container:first-child .MuiGrid-container"]
      },
      {
        name: "carousel-marquee",
        instances: ["main#content .css-ko3u0t"]
      },
      {
        name: "carousel-occasions",
        instances: ["#featured-occasions-slides", "main#content div[id^='product-ct']"]
      },
      {
        name: "columns-promo",
        instances: ["main#content section.css-1icvowc"]
      },
      {
        name: "carousel-gallery",
        instances: ["main#content section.css-1ob3jhi:last-of-type"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: "main#content > div > section:first-child",
        style: null,
        blocks: ["hero-gradient"],
        defaultContent: []
      },
      {
        id: "section-marquee",
        name: "Scrolling Marquee",
        selector: "main#content > div > section:first-child .content-container ~ div",
        style: "gold",
        blocks: ["carousel-marquee"],
        defaultContent: []
      },
      {
        id: "section-mission",
        name: "Mission Statement",
        selector: "section.css-zvpdw2",
        style: null,
        blocks: [],
        defaultContent: ["section.css-zvpdw2 h2", "section.css-zvpdw2 h1", "section.css-zvpdw2 p", "section.css-zvpdw2 a"]
      },
      {
        id: "section-occasions",
        name: "Celebrate Every Moment",
        selector: "section.css-1ob3jhi:has(#featured-occasions-slides)",
        style: null,
        blocks: ["carousel-occasions"],
        defaultContent: []
      },
      {
        id: "section-products",
        name: "Featured Products",
        selector: "section.css-1ob3jhi:has(div[id^='product-ct'])",
        style: null,
        blocks: ["carousel-occasions"],
        defaultContent: []
      },
      {
        id: "section-promo",
        name: "Personalization CTA",
        selector: "section.css-1icvowc",
        style: null,
        blocks: ["columns-promo"],
        defaultContent: []
      },
      {
        id: "section-gallery",
        name: "Social Proof Gallery",
        selector: "main#content section.css-1ob3jhi:last-of-type",
        style: null,
        blocks: ["carousel-gallery"],
        defaultContent: []
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
  var import_homepage_default = {
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
  return __toCommonJS(import_homepage_exports);
})();
