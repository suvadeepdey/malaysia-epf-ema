/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion (i-Lindung FAQ)
 * Base block: accordion
 * Source: https://www.kwsp.gov.my/en/member/healthcare/i-lindung
 * Instance selectors: .accordion-faq groups (one per FAQ category)
 *
 * Per accordion convention: first row = block name; each subsequent row is an
 * accordion item with 2 cells:
 *   Cell 1 (mandatory): Title  -> field:title (the question)
 *   Cell 2 (mandatory): Content -> field:text (the answer: paragraphs/lists)
 * Parser is called once per matched .accordion-faq element.
 */
export default function parse(element, { document }) {
  const rows = [];

  element.querySelectorAll('.faq-row').forEach((row) => {
    const qEl = row.querySelector('.faq-q');
    const aEl = row.querySelector('.faq-a');

    // Cell 1: title (field:title)
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    if (qEl) {
      const p = document.createElement('p');
      p.textContent = qEl.textContent.trim();
      titleCell.appendChild(p);
    }

    // Cell 2: content (field:text) — move answer paragraphs/lists in
    const bodyCell = document.createDocumentFragment();
    bodyCell.appendChild(document.createComment(' field:text '));
    if (aEl) {
      [...aEl.childNodes].forEach((n) => bodyCell.appendChild(n.cloneNode(true)));
    }

    if (qEl || aEl) rows.push([titleCell, bodyCell]);
  });

  if (rows.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells: rows });
  element.replaceWith(block);
}
