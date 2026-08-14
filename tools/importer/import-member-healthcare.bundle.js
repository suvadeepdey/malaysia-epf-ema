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

  // tools/importer/import-member-healthcare.js
  var import_member_healthcare_exports = {};
  __export(import_member_healthcare_exports, {
    default: () => import_member_healthcare_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const img = element.querySelector("picture img, img.largeImage, img");
    const lastUpdated = element.querySelector("p.title-desk.font-xsmall, p.font-xsmall");
    const title = element.querySelector(".textImage .font-xlarge, p.font-xlarge, h1, h2");
    const intro = element.querySelector(".textImage .font-small, p.font-small, p.title-padding");
    const textEls = [];
    if (lastUpdated && lastUpdated.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = lastUpdated.textContent.trim();
      textEls.push(p);
    }
    if (title && title.textContent.trim()) {
      const h = document2.createElement("h2");
      h.textContent = title.textContent.trim();
      textEls.push(h);
    }
    if (intro && intro.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = intro.textContent.trim();
      textEls.push(p);
    }
    if (!img && textEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (img) {
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(img);
      cells.push([imageCell]);
    }
    if (textEls.length) {
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      textEls.forEach((el) => textCell.appendChild(el));
      cells.push([textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    const rows = [];
    const iconCards = element.querySelectorAll("a.iconCard");
    iconCards.forEach((card) => {
      const href = card.getAttribute("href");
      const icon = card.querySelector(".card-icon img") || card.querySelector(".card-icon");
      const titleEl = card.querySelector(".font-xmedium");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const ctaEl = card.querySelector(".link .font-smallMedium, .font-smallMedium");
      const ctaText = ctaEl ? ctaEl.textContent.trim() : "";
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      if (icon) imageCell.appendChild(icon);
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
      if (ctaText) {
        const cta = document2.createElement("p");
        const a = document2.createElement("a");
        if (href) a.setAttribute("href", href);
        a.textContent = ctaText;
        cta.appendChild(a);
        textCell.appendChild(cta);
      }
      if (title || ctaText || icon) rows.push([imageCell, textCell]);
    });
    if (rows.length === 0) {
      const quickItems = element.querySelectorAll(".quickbar-wrapper > div, div.d-flex");
      quickItems.forEach((item) => {
        const link = item.querySelector("a");
        const href = link ? link.getAttribute("href") : null;
        const icon = item.querySelector("img");
        const labelEl = item.querySelector("p");
        const label = labelEl ? labelEl.textContent.trim() : "";
        const imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        if (icon) imageCell.appendChild(icon);
        const textCell = document2.createDocumentFragment();
        textCell.appendChild(document2.createComment(" field:text "));
        if (label) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          if (href) a.setAttribute("href", href);
          a.textContent = label;
          p.appendChild(a);
          textCell.appendChild(p);
        }
        if (label || icon) rows.push([imageCell, textCell]);
      });
    }
    if (rows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells: rows });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kwsp-image-rehost.js
  var DAM = "/content/dam/malaysia-epf-ema";
  var URL_MAP = {
    "https://www.kwsp.gov.my/o/adaptive-media/image/1814386/Preview-1000x0/Banner-Member-Health-Critical.webp": `${DAM}/banner-member-health-critical.webp`,
    "https://www.kwsp.gov.my/documents/20126/46090/Checklist-1.png": `${DAM}/checklist-1.png`,
    "https://www.kwsp.gov.my/documents/20126/48748/Health+Life.png": `${DAM}/health-life.png`,
    "https://www.kwsp.gov.my/documents/20126/46366/MyIdaman+Icons-2.png": `${DAM}/myidaman-icons-2.png`,
    "https://www.kwsp.gov.my/documents/20126/46348/Incap.png": `${DAM}/incap.png`,
    "https://www.kwsp.gov.my/documents/20126/119352/Retirement.png": `${DAM}/retirement.png`,
    "https://www.kwsp.gov.my/documents/20126/112481/i-Saraan.png": `${DAM}/i-saraan.png`,
    "https://www.kwsp.gov.my/documents/20126/45802/i-Sayang.png": `${DAM}/i-sayang.png`,
    "https://www.kwsp.gov.my/documents/20126/236494/Nomination+Icon.png": `${DAM}/nomination-icon.png`,
    "https://www.kwsp.gov.my/documents/20126/113135/Person+Document.png": `${DAM}/person-document.png`
  };
  function rewrite(url) {
    if (!url) return url;
    if (URL_MAP[url]) return URL_MAP[url];
    if (/Banner-Member-Health-Critical\.webp/i.test(url)) {
      return `${DAM}/banner-member-health-critical.webp`;
    }
    return url;
  }
  function transform(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    element.querySelectorAll("img[src]").forEach((img) => {
      img.setAttribute("src", rewrite(img.getAttribute("src")));
      if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    });
    element.querySelectorAll("source[srcset]").forEach((source) => {
      source.remove();
    });
  }

  // tools/importer/transformers/kwsp-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#banner",
        "footer#footer",
        "header",
        "footer"
      ]);
    }
  }

  // tools/importer/transformers/kwsp-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function selectorFor(section) {
    const { selector } = section;
    return Array.isArray(selector) ? selector[0] : selector;
  }
  function transform3(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sel = selectorFor(section);
        if (!sel) continue;
        const sectionEl = element.querySelector(sel);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(selectorFor(section));
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-member-healthcare.js
  var PAGE_TEMPLATE = {
    name: "member-healthcare",
    description: "EPF Member 'Health Protection' landing page (source: https://www.kwsp.gov.my/en/member/healthcare). Hero with intro + banner image, followed by grouped icon-card link tiles (Protection, Health Withdrawal, Incapacitation Withdrawal) and a quick-links bar.",
    urls: [
      "http://127.0.0.1:8787/member/healthcare.html"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "#main-content > div.journal-content-article.contribution"
        ]
      },
      {
        name: "cards",
        instances: [
          "#main-content > div.portlet-asset-publisher:nth-of-type(3)",
          "#main-content > div.portlet-asset-publisher:nth-of-type(4)",
          "#main-content > div.quickbar",
          "#main-content > div.portlet-asset-publisher:nth-of-type(6)"
        ]
      }
    ],
    sections: [
      {
        id: "rc-eds-1",
        name: "Page intro",
        selector: ["#main-content > div.component-html"],
        style: null,
        blocks: [],
        defaultContent: [
          "#main-content > div.component-html",
          "#main-content > nav.breadcrumb-contribution"
        ]
      },
      {
        id: "rc-eds-2",
        name: "Hero",
        selector: ["#main-content > div.journal-content-article.contribution"],
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "rc-eds-3",
        name: "Healthcare programmes",
        selector: ["#main-content > h3.component-heading.mb-0.text-break"],
        style: null,
        blocks: ["cards"],
        defaultContent: [
          "#main-content > h3.component-heading.mb-0.text-break",
          "#main-content > h4.component-heading.mb-0.text-break:nth-of-type(1)",
          "#main-content > h4.component-heading.mb-0.text-break:nth-of-type(2)",
          "#main-content > h4.component-heading.mb-0.text-break:nth-of-type(3)"
        ]
      }
    ]
  };
  var parsers = {
    hero: parse,
    cards: parse2
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
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
  var import_member_healthcare_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.querySelector("#main-content") || document2.body;
      executeTransformers("beforeTransform", main, payload);
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
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_member_healthcare_exports);
})();
