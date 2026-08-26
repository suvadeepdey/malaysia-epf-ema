import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Reads the plain-text value authored in a config row.
 * @param {Element} row
 */
function readRowValue(row) {
  return row?.querySelector(':scope > div')?.textContent?.trim() || '';
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [
    imageRow,
    titleRow,
    subtitleRow,
    descriptionRow,
    ctaUrlRow,
    ctaLabelRow,
    ctaStyleRow,
    displayStyleRow,
    alignmentRow,
  ] = [...block.children];

  const displayStyle = readRowValue(displayStyleRow);
  const alignment = readRowValue(alignmentRow);
  const ctaStyle = readRowValue(ctaStyleRow) || 'button';
  const ctaHref = readRowValue(ctaUrlRow);
  const ctaLabel = readRowValue(ctaLabelRow);

  // Optimize the authored image and read its resolved src for use as a CSS background
  const imageContent = imageRow?.querySelector(':scope > div');
  const img = imageContent?.querySelector('img');
  if (img) {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]);
    moveInstrumentation(img, optimizedPicture.querySelector('img'));
    img.closest('picture')?.replaceWith(optimizedPicture);
  }
  const imgUrl = imageContent?.querySelector('img')?.getAttribute('src') || '';

  const isImageLeft = displayStyle === 'image-left';
  const isImageRight = displayStyle === 'image-right';
  const isImageTop = displayStyle === 'image-top';
  const isImageBottom = displayStyle === 'image-bottom';
  const isImageBackground = isImageLeft || isImageRight || isImageTop || isImageBottom;

  const bannerContent = document.createElement('div');
  bannerContent.className = `banner-content${displayStyle ? ` ${displayStyle}` : ''}`;

  const bannerDetail = document.createElement('div');
  bannerDetail.className = `banner-detail${alignment ? ` ${alignment}` : ''}`;

  // The image is rendered as a CSS background, not a visible <img>; move its
  // authoring instrumentation onto whichever element carries that background
  // so authors can still click the visual area to edit the image field.
  if (imgUrl && isImageBackground) {
    bannerContent.style.backgroundImage = `url(${imgUrl})`;
    if (imageContent) moveInstrumentation(imageContent, bannerContent);
  } else if (imgUrl) {
    bannerDetail.style.backgroundImage = `linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1) 80%), url(${imgUrl})`;
    if (imageContent) moveInstrumentation(imageContent, bannerDetail);
  }

  const titleContent = titleRow?.querySelector(':scope > div');
  if (titleContent?.textContent?.trim()) {
    titleContent.classList.add('cftitle');
    bannerDetail.append(titleContent);
  }

  const subtitleContent = subtitleRow?.querySelector(':scope > div');
  if (subtitleContent?.textContent?.trim()) {
    subtitleContent.classList.add('cfsubtitle');
    bannerDetail.append(subtitleContent);
  }

  const descriptionContent = descriptionRow?.querySelector(':scope > div');
  if (descriptionContent?.textContent?.trim()) {
    descriptionContent.classList.add('cfdescription');
    bannerDetail.append(descriptionContent);
  }

  if (ctaHref) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = `button-container ${ctaStyle}`;
    const link = document.createElement('a');
    link.className = 'button';
    link.href = ctaHref;
    link.textContent = ctaLabel || ctaHref;
    buttonContainer.append(link);
    bannerDetail.append(buttonContainer);
  }

  bannerContent.append(bannerDetail);

  const bannerLogo = document.createElement('div');
  bannerLogo.className = 'banner-logo';
  bannerContent.append(bannerLogo);

  block.replaceChildren(bannerContent);
}
