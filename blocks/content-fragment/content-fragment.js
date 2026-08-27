import { fetchEpfData } from '../../scripts/aem-graphql.js';

const IMAGE_FRAMED_STYLES = ['image-left', 'image-right', 'image-top', 'image-bottom'];

/**
 * Converts an AEM repository path (e.g. /content/malaysia-epf-ema/member/foo)
 * into a site-relative path (e.g. /member/foo).
 * @param {string} damPath
 */
function toSitePath(damPath) {
  const [, sitePath] = damPath?.match(/^\/content\/[^/]+(\/.*)$/) || [];
  return sitePath || damPath;
}

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');

  const fragmentPath = rows[0]?.querySelector('a')?.getAttribute('href')
    || rows[0]?.textContent?.trim();
  const variation = rows[1]?.textContent?.trim() || '';
  const displayStyle = rows[2]?.textContent?.trim() || '';
  const alignment = rows[3]?.textContent?.trim() || '';
  const ctaStyle = rows[4]?.textContent?.trim() || 'link';

  if (!fragmentPath) {
    block.innerHTML = '<p>No content fragment selected.</p>';
    return;
  }

  console.log('Loading EPF Content Fragment:', fragmentPath, variation, displayStyle, alignment, ctaStyle);

  try {
    const epfCf = await fetchEpfData(fragmentPath, variation);

    const isImageFramed = IMAGE_FRAMED_STYLES.includes(displayStyle);
    const bannerContentStyle = isImageFramed && epfCf.imageUrl
      ? `background-image: url(${epfCf.imageUrl});`
      : '';
    const bannerDetailStyle = !isImageFramed && epfCf.imageUrl
      ? `background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1) 80%), url(${epfCf.imageUrl});`
      : '';

    const ctaHref = epfCf.buttonLinkurl?._path ? toSitePath(epfCf.buttonLinkurl._path) : '';
    const cta = ctaHref && epfCf.buttonLabel
      ? `<p class="button-container ${ctaStyle}"><a class="button" href="${ctaHref}">${epfCf.buttonLabel}</a></p>`
      : '';

    block.innerHTML = `
      <div class="banner-content ${displayStyle}" style="${bannerContentStyle}">
        <div class="banner-detail ${alignment}" style="${bannerDetailStyle}">
          <h2 class="cftitle">${epfCf.title || ''}</h2>
          <h3 class="cfsubtitle">${epfCf.subtitle || ''}</h3>
          <div class="cfdescription"><p>${epfCf.description?.plaintext || ''}</p></div>
          ${cta}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Unable to load EPF Content Fragment:', error);
    block.innerHTML = '<p>EPF content fragment is currently unavailable.</p>';
  }
}
