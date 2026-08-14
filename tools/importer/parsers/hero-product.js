/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-product (i-Lindung product banner)
 * Base block: hero
 * Source: https://www.kwsp.gov.my/en/member/healthcare/i-lindung
 * Instance selector: .product-banner-wrapper
 *
 * Per hero convention: 1 column, exactly 3 rows.
 *   Row 1: block name ("Hero") — added by createBlock.
 *   Row 2: background image (field:image; imageAlt collapses to <img alt>).
 *   Row 3: richtext (field:text) — Title (heading) + Subheading + CTA link.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('img');
  const titleEl = element.querySelector('.bannerTitle');
  const subEl = element.querySelector('.bannerContent');
  const ctaEl = element.querySelector('.responsive-cta-button');

  // Row 2: image cell
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (img) imageCell.appendChild(img);

  // Row 3: text cell (title + subheading + CTA)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (titleEl) {
    const h = document.createElement('h1');
    h.textContent = titleEl.textContent.trim();
    textCell.appendChild(h);
  }
  if (subEl) {
    const p = document.createElement('p');
    p.textContent = subEl.textContent.trim();
    textCell.appendChild(p);
  }
  if (ctaEl && ctaEl.getAttribute('href')) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', ctaEl.getAttribute('href'));
    a.textContent = ctaEl.textContent.trim();
    p.appendChild(a);
    textCell.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero',
    cells: [[imageCell], [textCell]],
  });
  element.replaceWith(block);
}
