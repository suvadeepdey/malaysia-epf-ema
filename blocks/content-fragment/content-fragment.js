import { fetchEpf } from '../../scripts/aem-graphql.js';

export default async function decorate(block) {
  const fragmentPath =
    '/content/dam/malaysia-epf-ema/content-fragments/financial-life-stages';

  try {
    const epfCf = await fetchEpf(fragmentPath);

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
    block.innerHTML = '<p>Article content is currently unavailable.</p>';
  }
}