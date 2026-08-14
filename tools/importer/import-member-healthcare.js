/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import kwspImageRehostTransformer from './transformers/kwsp-image-rehost.js';
import kwspCleanupTransformer from './transformers/kwsp-cleanup.js';
import kwspSectionsTransformer from './transformers/kwsp-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'member-healthcare',
  description: "EPF Member 'Health Protection' landing page (source: https://www.kwsp.gov.my/en/member/healthcare). Hero with intro + banner image, followed by grouped icon-card link tiles (Protection, Health Withdrawal, Incapacitation Withdrawal) and a quick-links bar.",
  urls: [
    'http://127.0.0.1:8787/member/healthcare.html',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '#main-content > div.journal-content-article.contribution',
      ],
    },
    {
      name: 'cards',
      instances: [
        '#main-content > div.portlet-asset-publisher:nth-of-type(3)',
        '#main-content > div.portlet-asset-publisher:nth-of-type(4)',
        '#main-content > div.quickbar',
        '#main-content > div.portlet-asset-publisher:nth-of-type(6)',
      ],
    },
  ],
  sections: [
    {
      id: 'rc-eds-1',
      name: 'Page intro',
      selector: ['#main-content > div.component-html'],
      style: null,
      blocks: [],
      defaultContent: [
        '#main-content > div.component-html',
        '#main-content > nav.breadcrumb-contribution',
      ],
    },
    {
      id: 'rc-eds-2',
      name: 'Hero',
      selector: ['#main-content > div.journal-content-article.contribution'],
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'rc-eds-3',
      name: 'Healthcare programmes',
      selector: ['#main-content > h3.component-heading.mb-0.text-break'],
      style: null,
      blocks: ['cards'],
      defaultContent: [
        '#main-content > h3.component-heading.mb-0.text-break',
        '#main-content > h4.component-heading.mb-0.text-break:nth-of-type(1)',
        '#main-content > h4.component-heading.mb-0.text-break:nth-of-type(2)',
        '#main-content > h4.component-heading.mb-0.text-break:nth-of-type(3)',
      ],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  cards: cardsParser,
};

// TRANSFORMER REGISTRY
// Cleanup runs first; the section transformer runs after so it operates on the
// cleaned DOM. The section transformer only acts on the hooks it recognises.
const transformers = [
  kwspImageRehostTransformer,
  kwspCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [kwspSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 * @param {Document} document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
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

    // Scope to main content. Global header/footer are removed by the cleanup
    // transformer (defensively) but scoping here keeps the imported doc lean.
    const main = document.querySelector('#main-content') || document.body;

    // 1. beforeTransform (initial cleanup + section breaks inserted before parsing)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on the page using the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Normalize rehosted DAM images back to root-relative paths. adjustImageUrls
    // absolutizes root-relative src against the (local serve) page origin; the
    // project serves DAM assets at /content/dam/... so strip any origin prefix.
    main.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      const idx = src.indexOf('/content/dam/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // 6. Generate sanitized document path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
