/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import cardsIconParser from './parsers/cards-icon.js';
import cardsArticlesParser from './parsers/cards-articles.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import ilindungCleanupTransformer from './transformers/ilindung-cleanup.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'member-product',
  description: "EPF Member product detail page (i-Lindung). Hero banner + CTA, intro, icon-card groups, video, FAQ accordion grouped by category, related-article cards.",
  urls: ['http://127.0.0.1:8788/member/healthcare/i-lindung.html'],
  blocks: [
    { name: 'hero-product', instances: ['.product-banner-wrapper'] },
    { name: 'cards-icon', instances: [
      '.who-can-apply .grid-three-col',
      '.who-is-eligible .grid-two-col',
      '.types-of-protection .grid-two-col',
      '.key-features .grid-three-col',
    ] },
    { name: 'accordion', instances: ['.accordion-faq'] },
    { name: 'cards-articles', instances: ['.related-wrapper'] },
  ],
  // section dividers are inserted before each selector (except the first section)
  sectionStarts: ['.product-banner-wrapper', '.who-can-apply', '.faq-section', '.related-articles'],
};

const parsers = {
  'hero-product': heroProductParser,
  'cards-icon': cardsIconParser,
  'cards-articles': cardsArticlesParser,
  accordion: accordionParser,
};

const transformers = [ilindungCleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhanced = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try {
      fn.call(null, hookName, element, enhanced);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function insertSectionBreaks(main) {
  const selectors = PAGE_TEMPLATE.sectionStarts || [];
  selectors.forEach((sel, i) => {
    if (i === 0) return; // no leading break before first section
    const el = main.querySelector(sel);
    if (el) el.before(document.createElement('hr'));
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const els = document.querySelectorAll(selector);
      if (els.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      els.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.querySelector('#main-content') || document.body;

    // 1. cleanup + heading normalization
    executeTransformers('beforeTransform', main, payload);

    // 2. section dividers (before parsers replace section anchors)
    insertSectionBreaks(main);

    // 3. parse blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. afterTransform
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // normalize rehosted DAM images to root-relative
    main.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      const idx = src.indexOf('/content/dam/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // 6. sanitized document path
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
