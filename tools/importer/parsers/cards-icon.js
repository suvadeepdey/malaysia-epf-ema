/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-icon (i-Lindung icon + title + description tiles)
 * Base block: cards (container block; one row per card, 2 cells)
 * Source: https://www.kwsp.gov.my/en/member/healthcare/i-lindung
 * Instance selectors: .card-bg groups containing .text-and-icon items
 *   (Who Can Apply, Who Is Eligible, Types Of Protection, Key Features)
 *
 * Per cards convention:
 *   Cell 1: Image/Icon  -> field:image
 *   Cell 2: Text (rich)  -> field:text : Title (heading) + Description
 * Empty cells are still included. Parser is called once per matched .card-bg.
 */
export default function parse(element, { document }) {
  const rows = [];

  element.querySelectorAll('.text-and-icon').forEach((item) => {
    const icon = item.querySelector('.icon-image-container img, img');
    const titleEl = item.querySelector('.font-text-and-icon');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const descEl = item.querySelector('.font-xsmall, .font-text');
    const descHtml = descEl ? descEl.innerHTML.trim() : '';

    // Cell 1: icon image (field:image)
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (icon) imageCell.appendChild(icon);

    // Cell 2: text (field:text) — title as heading + description
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      textCell.appendChild(h);
    }
    if (descHtml) {
      const p = document.createElement('p');
      p.innerHTML = descHtml;
      textCell.appendChild(p);
    }

    if (title || descHtml || icon) rows.push([imageCell, textCell]);
  });

  if (rows.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells: rows });
  element.replaceWith(block);
}
