/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: rehost KWSP image URLs to local project DAM assets.
 *
 * The source images live on https://www.kwsp.gov.my (Cloudflare-protected) and
 * cannot be fetched/optimized by the importer. Local copies were placed in
 * content/content/dam/malaysia-epf-ema/ from the reference capture. This
 * transformer rewrites the remote <img src> to the local DAM path so the
 * imported page is self-contained (images render everywhere, no cross-origin).
 *
 * Runs in beforeTransform so the rewritten src flows through the block parsers
 * and the built-in image rules unchanged.
 */

const DAM = '/content/dam/malaysia-epf-ema';

// Map remote URL (exact) -> local DAM path.
const URL_MAP = {
  'https://www.kwsp.gov.my/o/adaptive-media/image/1814386/Preview-1000x0/Banner-Member-Health-Critical.webp': `${DAM}/banner-member-health-critical.webp`,
  'https://www.kwsp.gov.my/documents/20126/46090/Checklist-1.png': `${DAM}/checklist-1.png`,
  'https://www.kwsp.gov.my/documents/20126/48748/Health+Life.png': `${DAM}/health-life.png`,
  'https://www.kwsp.gov.my/documents/20126/46366/MyIdaman+Icons-2.png': `${DAM}/myidaman-icons-2.png`,
  'https://www.kwsp.gov.my/documents/20126/46348/Incap.png': `${DAM}/incap.png`,
  'https://www.kwsp.gov.my/documents/20126/119352/Retirement.png': `${DAM}/retirement.png`,
  'https://www.kwsp.gov.my/documents/20126/112481/i-Saraan.png': `${DAM}/i-saraan.png`,
  'https://www.kwsp.gov.my/documents/20126/45802/i-Sayang.png': `${DAM}/i-sayang.png`,
  'https://www.kwsp.gov.my/documents/20126/236494/Nomination+Icon.png': `${DAM}/nomination-icon.png`,
  'https://www.kwsp.gov.my/documents/20126/113135/Person+Document.png': `${DAM}/person-document.png`,
};

// Also match the srcset variants (adaptive-media Thumbnail/Preview banner URLs)
// by normalising any Banner-Member-Health-Critical.webp reference.
function rewrite(url) {
  if (!url) return url;
  if (URL_MAP[url]) return URL_MAP[url];
  if (/Banner-Member-Health-Critical\.webp/i.test(url)) {
    return `${DAM}/banner-member-health-critical.webp`;
  }
  return url;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  element.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', rewrite(img.getAttribute('src')));
    // drop srcset so the local src is used verbatim
    if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
  });

  element.querySelectorAll('source[srcset]').forEach((source) => {
    // remove theme <source> variants that point at remote adaptive-media URLs;
    // the <img src> (rewritten above) becomes the single local source.
    source.remove();
  });
}
