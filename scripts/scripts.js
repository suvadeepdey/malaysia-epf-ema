import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

import {
	runExperimentation,
	showExperimentationRail,
} from './experiment-load.js';
const experimentationConfig = {
	prodHost: 'www.example.com',
	audiences: {
		mobile: () => window.innerWidth < 600,
		desktop: () => window.innerWidth >= 600,
		// define your custom audiences here as needed
	},
};

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
	decorateDMImages(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
	await runExperimentation(doc, experimentationConfig);
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
	await showExperimentationRail(doc, experimentationConfig);
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
   * Decorates Dynamic Media images by modifying their URLs to include specific parameters
   * and creating a <picture> element with different sources for different image formats and sizes.
   *
   * @param {HTMLElement} main - The main container element that includes the links to be processed.
   */
  export async function decorateDMImages(main) {

	
		const links = Array.from(main.querySelectorAll('a[href]'));
	
		for (const a of links) {
		  let href = a.href;
		  const hrefLower = href.toLowerCase();
		  if (!isDMOpenAPIUrl(href)) continue;
	  
		  const isGifFile = hrefLower.endsWith('.gif');
		  const containsOriginal = href.includes('/original/');
		  const dmOpenApiDiv = a.closest('.dm-openapi') || a.closest('.dynamic-media-image');
	  
		  if (!dmOpenApiDiv) continue;
	  
		  // Skip non-originals except GIF, as per your logic
		  if (containsOriginal && !isGifFile) continue;
	  
		  const blockBeingDecorated = whatBlockIsThis(a);
		  let blockName = '';
		  let rotate = '';
		  let flip = '';
		  let cropValue = '';
		  let preset = '';
		  let extend = '';
		  let backgroundcolor = '';
		  let advanceManualParam = '';
		  let enableSmartCrop = '';
			let showInfoIcon = '';
	  
		  if (blockBeingDecorated) {
			blockName = Array.from(blockBeingDecorated.classList).find(
			  (className) => className !== 'block'
			) || '';
		  }
	  
		  // Early exclude videos
		  const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.m4v', '.mkv'];
		  const isVideoAsset = videoExtensions.some((ext) => hrefLower.includes(ext));
		  if (isVideoAsset || blockName === 'video') continue;
		  
		  // Extract advanced modifiers only for dynamic-media blocks
		  if (blockName === 'dm-openapi' || blockName === 'dynamic-media-image') {
			const parentDiv = a.closest('div');
			if (parentDiv && parentDiv.parentElement) {
			  const container = parentDiv.parentElement;
			  const siblings = [];
			  let current = container.nextElementSibling;
	  
				// Collect up to 4 siblings (preset, rotate, flip, crop) in order
				while (current && siblings.length < 9) {
							siblings.push(current);
							current = current.nextElementSibling;
				}
	  
			  // Helper to safely consume a sibling element's trimmed text and remove it
			  const consumeSiblingText = (el) => {
				if (!el) return '';
				const text = el.textContent?.trim() || '';
				if (text) el.remove();
				return text;
			  };
	  
			  // Order matters: preset, rotate, flip, crop
			  if (siblings.length > 0) {
				enableSmartCrop = consumeSiblingText(siblings.shift()) || false;
				preset = consumeSiblingText(siblings.shift());
				extend = consumeSiblingText(siblings.shift());
				backgroundcolor = consumeSiblingText(siblings.shift());
				rotate = consumeSiblingText(siblings.shift());
				flip = consumeSiblingText(siblings.shift());
				cropValue = consumeSiblingText(siblings.shift());
				advanceManualParam = consumeSiblingText(siblings.shift()); // advance_parameters
				showInfoIcon = consumeSiblingText(siblings.shift());
			  }
			}
	  
			// Remove direct child divs once (minimize DOM thrash)
			const directChildDivs = dmOpenApiDiv.querySelectorAll(':scope > div');
			directChildDivs.forEach((div) => div.remove());
		  }
		  
	
		   // Build advanced modifier parameters for Dynamic Media URL
		   const buildAdvanceModifierParams = () => {
			const params = [];
			
			// Add rotation parameter
			if (rotate) {
			  params.push(`rotate=${encodeURIComponent(rotate)}`);
			}
			
			// Add flip parameter
			if (flip) {
			  params.push(`flip=${encodeURIComponent(flip.toLowerCase())}`);
			}
			
			// Add crop parameter
			if (cropValue) {
			  params.push(`crop=${encodeURIComponent(cropValue.toLowerCase())}`);
			}
			
			// Handle preset parameter with special logic for 'border' preset
			if (preset) {
			  const presetLower = preset.toLowerCase();
			  
			  if (presetLower === 'border') {
				// Border preset can include extend and background-color
				if (extend && backgroundcolor) {
				  const bgColor = backgroundcolor.replace('#', '');
				  params.push(`extend=${encodeURIComponent(extend)}`);
				  params.push(`background-color=rgb,${encodeURIComponent(bgColor)}`);
				} else if (extend) {
				  params.push(`extend=${encodeURIComponent(extend)}`);
				}
			  }
			  else if (presetLower === 'grayscale') {
				  params.push(`saturation=-100`);
			  } else {
				// Regular preset
				params.push(`preset=${encodeURIComponent(preset)}`);
			  }
			}

			// Append advance_parameters (author-provided custom params)
			if (advanceManualParam) {
			  // Strip leading '&' to avoid double '&&' when joining
			  const sanitized = advanceManualParam.replace(/^&+/, '');
			  if (sanitized) {
				params.push(sanitized);
			  }
			}
			
			// Join all parameters with '&' and prepend '&' if there are any
			return params.length > 0 ? `&${params.join('&')}` : '';
		  };
		  
		  const advanceModifierParams = buildAdvanceModifierParams();
		  const originalUrl = new URL(href);
		  const hasQueryParams = originalUrl.toString().includes('?');
		  const paramSeparator = hasQueryParams ? '&' : '?';
		  const baseParams = `${paramSeparator}quality=85&preferwebp=true${advanceModifierParams}`;
		  const pic = document.createElement('picture');
	  
	  
		  // Only add smart crop sources if enableSmartCrop is true
		  if (enableSmartCrop === true || enableSmartCrop === 'true') {
			  const metadataUrl = getMetadataUrl(href);
			  if (!metadataUrl) continue;
	  
			  let metadata;
			  try {
				const response = await fetch(metadataUrl);
				if (!response.ok) {
				  console.error(`Failed to fetch metadata: ${response.status}`);
				  continue;
				}
				metadata = await response.json();
			  } catch (error) {
				console.error('Error fetching or processing metadata:', error);
				continue;
			  }
	  
			  const smartcrops = metadata?.repositoryMetadata?.smartcrops;
			  const mimeType = metadata?.repositoryMetadata?.["dc:format"];
			  if (smartcrops){
					// Build picture and sources
					pic.style.textAlign = 'center';
			
					const cropKeys = Object.keys(smartcrops);
					if (!cropKeys.length) continue;
			
					// Sort crop keys by width desc (largest → smallest)
					const cropOrder = cropKeys.sort((a, b) => {
						const widthA = parseInt(smartcrops[a].width, 10) || 0;
						const widthB = parseInt(smartcrops[b].width, 10) || 0;
						return widthB - widthA;
					});
			
					const largestCropWidth = Math.max(
						...cropOrder.map((cropName) =>
						parseInt(smartcrops[cropName].width, 10) || 0
						)
					);
			
					const extraLargeBreakpoint = Math.max(largestCropWidth + 1, 1300);
			
					// Extra-large screen source (no smartcrop)
					const sourceWebpExtraLarge = document.createElement('source');
					sourceWebpExtraLarge.type = 'image/webp';
					sourceWebpExtraLarge.srcset = `${originalUrl}${baseParams}`;
					sourceWebpExtraLarge.media = `(min-width: ${extraLargeBreakpoint}px)`;
					pic.appendChild(sourceWebpExtraLarge);
			
					// Smartcrop sources
					cropOrder.forEach((cropName) => {
						const crop = smartcrops[cropName];
						if (!crop) return;
			
						const minWidth = parseInt(crop.width, 10) || 0;
						const smartcropParam = `${paramSeparator}smartcrop=${encodeURIComponent(
						cropName
						)}`;
			
						const sourceWebp = document.createElement('source');
						sourceWebp.type = mimeType ? mimeType : "image/webp";
						sourceWebp.srcset = `${originalUrl}${smartcropParam}&quality=85&preferwebp=true${advanceModifierParams}`;
						if (minWidth > 0) {
						sourceWebp.media = `(min-width: ${minWidth}px)`;
						}
			
						pic.appendChild(sourceWebp);
					});
				}
		  }
	  
		  // Fallback 
		  const fallbackUrl = `${originalUrl}${baseParams}`;
		  const img = document.createElement('img');
		  img.loading = 'lazy';
		  img.src = fallbackUrl;
		  //img.alt = href !== a.title ? a.title || '' : '';
	  
		  pic.appendChild(img);
		  dmOpenApiDiv.appendChild(pic);

			if (showInfoIcon === true || showInfoIcon === 'true') {
				const urnPattern = /(\/adobe\/assets\/urn:[^\/]+)/i;
				const urnMatch = href.match(urnPattern);
				if (urnMatch) {
				const urlObj = new URL(href);
				const imageBaseUrl = `${urlObj.protocol}//${urlObj.hostname}${urnMatch[1]}`;
				const snapshotState = JSON.stringify({
					imageUrl: imageBaseUrl,
					serviceMode: 'openapi',
					params: {},
					thumbWidth: 600,
					thumbHeight: 600,
				});
				const snapshotUrl = `https://snapshot.scene7.com/?state=${encodeURIComponent(snapshotState)}`;
		
				dmOpenApiDiv.style.position = 'relative';
				dmOpenApiDiv.style.display = 'inline-block';
		
				const infoLink = document.createElement('a');
				infoLink.href = snapshotUrl;
				infoLink.target = '_blank';
				infoLink.rel = 'noopener noreferrer';
				infoLink.className = 'dm-info-icon';
				infoLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="8,5 19,12 8,19"/></svg>`;
				const tooltip = document.createElement('span');
				tooltip.className = 'dm-info-tooltip';
				tooltip.textContent = 'Explore more image transformations in Snapshot tool';
				infoLink.appendChild(tooltip);
		
				dmOpenApiDiv.appendChild(infoLink);
				}
			}
		}
		
		const allBlocks = Array.from(main.querySelectorAll('.dm-openapi, .dynamic-media-image'));

		for (const block of allBlocks) {
				const links = block.querySelectorAll('a[href]');
				// If no image is authored, hide all children to prevent raw property values
				// like "false", "na" from rendering as visible text
				if (links.length === 0) {
						const pictures = block.querySelectorAll('picture');
						// Hide children only if no image was authored (no links)
						// and block wasn't already processed (no picture element)
						if (links.length === 0 && pictures.length === 0) {
							Array.from(block.children).forEach((child) => {
								child.style.display = 'none';
							});
						}
				}
		}
  
  }

function whatBlockIsThis(element) {
		let currentElement = element;
	  
		while (currentElement.parentElement) {
		  if (currentElement.parentElement.classList.contains('block')) return currentElement.parentElement;
		  currentElement = currentElement.parentElement;
		  if (currentElement.classList.length > 0) return currentElement.classList[0];
		}
		return null;
  }

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
