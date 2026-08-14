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

  // tools/importer/import-member-product.js
  var import_member_product_exports = {};
  __export(import_member_product_exports, {
    default: () => import_member_product_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document: document2 }) {
    const img = element.querySelector("img");
    const titleEl = element.querySelector(".bannerTitle");
    const subEl = element.querySelector(".bannerContent");
    const ctaEl = element.querySelector(".responsive-cta-button");
    const imageCell = document2.createDocumentFragment();
    imageCell.appendChild(document2.createComment(" field:image "));
    if (img) imageCell.appendChild(img);
    const textCell = document2.createDocumentFragment();
    textCell.appendChild(document2.createComment(" field:text "));
    if (titleEl) {
      const h = document2.createElement("h1");
      h.textContent = titleEl.textContent.trim();
      textCell.appendChild(h);
    }
    if (subEl) {
      const p = document2.createElement("p");
      p.textContent = subEl.textContent.trim();
      textCell.appendChild(p);
    }
    if (ctaEl && ctaEl.getAttribute("href")) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.setAttribute("href", ctaEl.getAttribute("href"));
      a.textContent = ctaEl.textContent.trim();
      p.appendChild(a);
      textCell.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "hero",
      cells: [[imageCell], [textCell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse2(element, { document: document2 }) {
    const rows = [];
    element.querySelectorAll(".text-and-icon").forEach((item) => {
      const icon = item.querySelector(".icon-image-container img, img");
      const titleEl = item.querySelector(".font-text-and-icon");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const descEl = item.querySelector(".font-xsmall, .font-text");
      const descHtml = descEl ? descEl.innerHTML.trim() : "";
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      if (icon) imageCell.appendChild(icon);
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (title) {
        const h = document2.createElement("h3");
        h.textContent = title;
        textCell.appendChild(h);
      }
      if (descHtml) {
        const p = document2.createElement("p");
        p.innerHTML = descHtml;
        textCell.appendChild(p);
      }
      if (title || descHtml || icon) rows.push([imageCell, textCell]);
    });
    if (rows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-articles.js
  function parse3(element, { document: document2 }) {
    const rows = [];
    element.querySelectorAll(".related-card").forEach((card) => {
      const link = card.querySelector("a");
      const href = link ? link.getAttribute("href") : null;
      const img = card.querySelector("img");
      const title = link ? link.textContent.trim() : "";
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      if (img) imageCell.appendChild(img);
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (title) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        if (href) a.setAttribute("href", href);
        a.textContent = title;
        p.appendChild(a);
        textCell.appendChild(p);
      }
      if (title || img) rows.push([imageCell, textCell]);
    });
    if (rows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse4(element, { document: document2 }) {
    const rows = [];
    element.querySelectorAll(".faq-row").forEach((row) => {
      const qEl = row.querySelector(".faq-q");
      const aEl = row.querySelector(".faq-a");
      const titleCell = document2.createDocumentFragment();
      titleCell.appendChild(document2.createComment(" field:title "));
      if (qEl) {
        const p = document2.createElement("p");
        p.textContent = qEl.textContent.trim();
        titleCell.appendChild(p);
      }
      const bodyCell = document2.createDocumentFragment();
      bodyCell.appendChild(document2.createComment(" field:text "));
      if (aEl) {
        [...aEl.childNodes].forEach((n) => bodyCell.appendChild(n.cloneNode(true)));
      }
      if (qEl || aEl) rows.push([titleCell, bodyCell]);
    });
    if (rows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ilindung-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    WebImporter.DOMUtils.remove(element, ["header#banner", "footer#footer", "header", "footer"]);
    element.querySelectorAll(".font-xlarge").forEach((el) => {
      const h = document.createElement("h2");
      h.textContent = el.textContent.trim();
      el.replaceWith(h);
    });
    element.querySelectorAll(".common-para .text-area").forEach((el) => {
      const p = document.createElement("p");
      p.innerHTML = el.innerHTML.trim();
      el.replaceWith(p);
    });
  }

  // tools/importer/import-member-product.js
  var PAGE_TEMPLATE = {
    name: "member-product",
    description: "EPF Member product detail page (i-Lindung). Hero banner + CTA, intro, icon-card groups, video, FAQ accordion grouped by category, related-article cards.",
    urls: ["http://127.0.0.1:8788/member/healthcare/i-lindung.html"],
    blocks: [
      { name: "hero-product", instances: [".product-banner-wrapper"] },
      { name: "cards-icon", instances: [
        ".who-can-apply .grid-three-col",
        ".who-is-eligible .grid-two-col",
        ".types-of-protection .grid-two-col",
        ".key-features .grid-three-col"
      ] },
      { name: "accordion", instances: [".accordion-faq"] },
      { name: "cards-articles", instances: [".related-wrapper"] }
    ],
    // section dividers are inserted before each selector (except the first section)
    sectionStarts: [".product-banner-wrapper", ".who-can-apply", ".faq-section", ".related-articles"]
  };
  var parsers = {
    "hero-product": parse,
    "cards-icon": parse2,
    "cards-articles": parse3,
    accordion: parse4
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhanced = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
      if (i === 0) return;
      const el = main.querySelector(sel);
      if (el) el.before(document.createElement("hr"));
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const els = document2.querySelectorAll(selector);
        if (els.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        els.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_member_product_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.querySelector("#main-content") || document2.body;
      executeTransformers("beforeTransform", main, payload);
      insertSectionBreaks(main);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        const idx = src.indexOf("/content/dam/");
        if (idx > 0) img.setAttribute("src", src.slice(idx));
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_member_product_exports);
})();
