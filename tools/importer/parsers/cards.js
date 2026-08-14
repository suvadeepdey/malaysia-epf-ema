/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://www.kwsp.gov.my/en/member/healthcare
 * Instance selectors (page-templates.json):
 *   - #main-content > div.portlet-asset-publisher:nth-of-type(3)  (iconCard, 1 card)
 *   - #main-content > div.portlet-asset-publisher:nth-of-type(4)  (iconCard, 2 cards)
 *   - #main-content > div.quickbar                                (quickbar, 5 cards)
 *   - #main-content > div.portlet-asset-publisher:nth-of-type(6)  (iconCard, 1 card)
 * Generated: 2026-08-14
 *
 * Block library convention (cards): container block, no block-level model.
 *   Each row = one card, 2 cells:
 *     Cell 1: Image/Icon        -> field:image (imageAlt collapses onto <img alt>)
 *     Cell 2: Text (richtext)   -> field:text  (title heading, description, CTA)
 *   An empty cell must still be included; every row has exactly 2 cells.
 *
 * Block model (blocks/cards/_cards.json): child "card" model with image + text.
 *
 * The parser is called once per matched instance element and produces one
 * Cards block whose rows are the cards found within that element.
 */
export default function parse(element, { document }) {
  const rows = [];

  // --- Style A: iconCard tiles (a.iconCard) ---
  const iconCards = element.querySelectorAll('a.iconCard');
  iconCards.forEach((card) => {
    const href = card.getAttribute('href');
    // Only the icon inside .card-icon. NOTE: querySelector with a comma list
    // returns the first match in DOCUMENT order, and the CTA chevron img appears
    // before .card-icon img — so resolve .card-icon first, then fall back.
    const icon = card.querySelector('.card-icon img')
      || card.querySelector('.card-icon');
    const titleEl = card.querySelector('.font-xmedium');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const ctaEl = card.querySelector('.link .font-smallMedium, .font-smallMedium');
    const ctaText = ctaEl ? ctaEl.textContent.trim() : '';

    // Cell 1: image (field:image).
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (icon) imageCell.appendChild(icon);

    // Cell 2: text (field:text) — title linked to tile href + CTA link.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      if (href) a.setAttribute('href', href);
      a.textContent = title;
      p.appendChild(a);
      textCell.appendChild(p);
    }
    if (ctaText) {
      const cta = document.createElement('p');
      const a = document.createElement('a');
      if (href) a.setAttribute('href', href);
      a.textContent = ctaText;
      cta.appendChild(a);
      textCell.appendChild(cta);
    }

    if (title || ctaText || icon) rows.push([imageCell, textCell]);
  });

  // --- Style B: quickbar tiles (icon-over-label links) ---
  if (rows.length === 0) {
    const quickItems = element.querySelectorAll('.quickbar-wrapper > div, div.d-flex');
    quickItems.forEach((item) => {
      const link = item.querySelector('a');
      const href = link ? link.getAttribute('href') : null;
      const icon = item.querySelector('img');
      const labelEl = item.querySelector('p');
      const label = labelEl ? labelEl.textContent.trim() : '';

      // Cell 1: image (field:image).
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      if (icon) imageCell.appendChild(icon);

      // Cell 2: text (field:text) — label linked to the item href.
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      if (label) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        if (href) a.setAttribute('href', href);
        a.textContent = label;
        p.appendChild(a);
        textCell.appendChild(p);
      }

      if (label || icon) rows.push([imageCell, textCell]);
    });
  }

  // Empty-block guard.
  if (rows.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells: rows });
  element.replaceWith(block);
}
