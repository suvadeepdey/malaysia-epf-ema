/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-articles (i-Lindung "Related Articles")
 * Base block: cards (container block; one row per card, 2 cells)
 * Source: https://www.kwsp.gov.my/en/member/healthcare/i-lindung
 * Instance selector: .related-articles (contains .related-card items)
 *
 * Per cards convention:
 *   Cell 1: Image/Icon  -> field:image (article thumbnail)
 *   Cell 2: Text (rich)  -> field:text : title as a Call-to-Action link
 */
export default function parse(element, { document }) {
  const rows = [];

  element.querySelectorAll('.related-card').forEach((card) => {
    const link = card.querySelector('a');
    const href = link ? link.getAttribute('href') : null;
    const img = card.querySelector('img');
    const title = link ? link.textContent.trim() : '';

    // Cell 1: thumbnail (field:image)
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) imageCell.appendChild(img);

    // Cell 2: text (field:text) — title linked to the article
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

    if (title || img) rows.push([imageCell, textCell]);
  });

  if (rows.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells: rows });
  element.replaceWith(block);
}
