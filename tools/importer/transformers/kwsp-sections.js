/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: kwsp (www.kwsp.gov.my) section breaks + section metadata.
 *
 * Template member-healthcare has 3 EDS sections (from page-templates.json):
 *   1. rc-eds-1 "Page intro"            selector: #main-content > div.component-html   (style: null)
 *   2. rc-eds-2 "Hero"                  selector: #main-content > div.journal-content-article.contribution (style: null)
 *   3. rc-eds-3 "Healthcare programmes" selector: #main-content > h3.component-heading.mb-0.text-break (style: null)
 *
 * Inserts a <hr> section break before each section except the first, producing
 * the three EDS sections in order. No section has a `style`, so no Section
 * Metadata blocks are created.
 *
 * Section boundary selectors are DOM-verified in migration-work/cleaned.html.
 * page-templates.json stores each `selector` as a single-element array, so we
 * normalize to a string before querying.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function selectorFor(section) {
  const { selector } = section;
  return Array.isArray(selector) ? selector[0] : selector;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    // Walk backwards so inserts never disturb not-yet-processed section anchors.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sel = selectorFor(section);
      if (!sel) continue;
      const sectionEl = element.querySelector(sel);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Add Section Metadata for any section with a style. None have one for this
    // template, but the logic is kept so the transformer stays correct if a
    // style is added later.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(selectorFor(section));
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
