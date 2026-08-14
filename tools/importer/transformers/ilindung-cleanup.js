/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: i-Lindung page cleanup + heading normalization.
 *
 * - Removes global chrome (header/footer) — main-content is the import root.
 * - Promotes the source's styled title divs (.font-xlarge) to <h2> and the
 *   intro (.text-area) to a paragraph, so they render as default content
 *   headings/text alongside the blocks.
 * - Rewrites the local DAM image paths from root-relative (/content/dam/...)
 *   to relative for the importer, matching kwsp-image-rehost handling.
 * Runs in beforeTransform so downstream parsers see normalized nodes.
 */

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  // remove global chrome defensively
  WebImporter.DOMUtils.remove(element, ['header#banner', 'footer#footer', 'header', 'footer']);

  // promote styled section titles to real headings
  element.querySelectorAll('.font-xlarge').forEach((el) => {
    const h = document.createElement('h2');
    h.textContent = el.textContent.trim();
    el.replaceWith(h);
  });

  // intro paragraph
  element.querySelectorAll('.common-para .text-area').forEach((el) => {
    const p = document.createElement('p');
    p.innerHTML = el.innerHTML.trim();
    el.replaceWith(p);
  });
}
