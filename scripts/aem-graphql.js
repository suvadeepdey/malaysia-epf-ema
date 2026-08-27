const AEM_PUBLISH_HOST =
  'https://publish-p214503-e2234854.adobeaemcloud.com';

const GRAPHQL_CONFIGURATION = 'malaysia-epf-ema';
const PERSISTED_QUERY_NAME = 'epf-data';

export async function fetchEpfData(fragmentPath) {
  /*
   * AEM persisted-query variables use this form:
   * ;path=/content/dam/...
   *
   * encodeURIComponent() encodes:
   * ; as %3B
   * = as %3D
   * / as %2F
   */
  const encodedVariable = encodeURIComponent(`;path=${fragmentPath}`);

  const url =
    `${AEM_PUBLISH_HOST}/graphql/execute.json/` +
    `${GRAPHQL_CONFIGURATION}/${PERSISTED_QUERY_NAME}` +
    encodedVariable;

  console.log('Fetching AEM GraphQL data from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `AEM GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    const message = payload.errors
      .map((error) => error.message)
      .join('; ');

    throw new Error(`AEM GraphQL error: ${message}`);
  }

  const epfCf = payload.data?.epfCfModelByPath?.item;
  console.log('Fetched AEM GraphQL data:', epfCf);

  if (!epfCf) {
    throw new Error(
      `No Content Fragment found at ${fragmentPath}`,
    );
  }

  return {
    ...epfCf,

    // Convert the DAM repository path into an absolute image URL.
    imageUrl: epfCf.mainImage._path
      ? new URL(epfCf.mainImage._path, AEM_PUBLISH_HOST).href
      : null,
  };
}