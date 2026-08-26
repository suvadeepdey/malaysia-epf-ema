import { fetchEpfData } from '../../scripts/aem-graphql.js';

export default async function decorate(block) {
  const fragmentPath =
    '/content/dam/malaysia-epf-ema/content-fragments/financial-life-stages';

  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  console.log('Entered path', contentPath);

  try {
    const epfCf = await fetchEpfData(fragmentPath);

    block.innerHTML = `
      <article class="article">
        <h1>${epfCf.title}</h1>
        <p class="article__subtitle">${epfCf.subtitle}</p>

        ${
          epfCf.imageUrl
            ? `<img
                 class="article__image"
                 src="${epfCf.imageUrl}"
                 alt="${epfCf.title}"
               >`
            : ''
        }

        <div class="article__description">
          ${epfCf.description?.html || ''}
        </div>
      </article>
    `;
  } catch (error) {
    console.error('Unable to load Article Content Fragment:', error);
    block.innerHTML = '<p>EPF content fragment is currently unavailable.</p>';
  }
}