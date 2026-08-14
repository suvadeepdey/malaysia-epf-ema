/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://www.kwsp.gov.my/en/member/healthcare
 * Instance selector: #main-content > div.journal-content-article.contribution
 * Generated: 2026-08-14
 *
 * Block library convention (hero): 1 column, exactly 3 rows.
 *   Row 1: block name.
 *   Row 2: single cell — background/banner image.
 *   Row 3: single cell — richtext (title as heading, subheading/intro, optional CTA).
 *
 * Block model (blocks/hero/_hero.json): simple 1-column block
 *   - image    (reference)  -> field:image  (imageAlt collapses onto <img alt>)
 *   - imageAlt (text)       -> collapsed into image <img> alt attribute (NO hint)
 *   - text     (richtext)   -> field:text
 */
export default function parse(element, { document }) {
  // --- Image (banner) ---
  // Prefer the delivered <img>; fall back to the <picture> wrapper.
  const img = element.querySelector('picture img, img.largeImage, img');

  // --- Text: last-updated meta + title heading + intro paragraph ---
  const lastUpdated = element.querySelector('p.title-desk.font-xsmall, p.font-xsmall');
  const title = element.querySelector('.textImage .font-xlarge, p.font-xlarge, h1, h2');
  const intro = element.querySelector('.textImage .font-small, p.font-small, p.title-padding');

  const textEls = [];

  // Last-updated small meta line (keep at top of hero text per authoring analysis).
  if (lastUpdated && lastUpdated.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = lastUpdated.textContent.trim();
    textEls.push(p);
  }

  // Title -> heading (source uses a styled <p>; promote to a semantic heading).
  if (title && title.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = title.textContent.trim();
    textEls.push(h);
  }

  // Intro paragraph (subheading).
  if (intro && intro.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = intro.textContent.trim();
    textEls.push(p);
  }

  // Empty-block guard.
  if (!img && textEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background/banner image (field:image). imageAlt collapses onto <img alt>.
  if (img) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);
    cells.push([imageCell]);
  }

  // Row 3: text (field:text).
  if (textEls.length) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textEls.forEach((el) => textCell.appendChild(el));
    cells.push([textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
