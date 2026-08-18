/**
 * Reads the plain-text value authored in a hero config row (a block row
 * that only ever contains a single value, e.g. "true" or "image-right").
 * @param {Element} row
 */
function readRowValue(row) {
  return row?.querySelector(':scope > div')?.textContent?.trim();
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [, textRow, underlineRow, layoutRow, ctaRow, backgroundRow] = [...block.children];

  const enableUnderline = readRowValue(underlineRow) || 'true';
  const explicitLayout = readRowValue(layoutRow);
  const explicitCtaStyle = readRowValue(ctaRow);
  const explicitBackground = readRowValue(backgroundRow);

  // Older/author-created content doesn't always carry the layout/background
  // config rows above (they were added after this content was authored), so
  // fall back to detecting the intended variant from the content itself:
  // a hero with a call-to-action link reads as a full-bleed banner with the
  // image as a background, while one without a CTA reads as a plain
  // image + copy panel.
  const textContainer = textRow?.querySelector(':scope > div');
  const ctaLink = textContainer?.querySelector('a[href]');
  const ctaParagraph = ctaLink?.closest('p');
  const hasCta = !!(ctaLink && ctaParagraph
    && ctaParagraph.textContent.trim() === ctaLink.textContent.trim());

  const layoutStyle = explicitLayout || (hasCta ? 'image-background-text-left' : 'image-right');
  const backgroundStyle = explicitBackground || (hasCta ? 'theme-dark' : 'theme-light');
  const ctaStyle = explicitCtaStyle || 'button';

  block.classList.add(layoutStyle);
  block.classList.add(backgroundStyle);

  if (enableUnderline.toLowerCase() === 'false') {
    block.classList.add('removeunderline');
  }

  if (hasCta) {
    ctaParagraph.classList.add('button-container', `cta-${ctaStyle}`);
    ctaLink.classList.add('button');
  }

  // Hide the config rows (image/text rows are always kept)
  [underlineRow, layoutRow, ctaRow, backgroundRow].forEach((row) => {
    if (row) row.style.display = 'none';
  });
}
