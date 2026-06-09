import { apiCatalog } from "../mcp/catalog.mjs";

const DOC_INDEX_URL = "https://opendocs.echotik.live/llms.txt";
const ALLOWED_NON_INDEXED_DOCS = new Set([
  "https://open.echotik.live/api/v3/realtime/product/detail_new_app"
]);
// Catalog endpoints whose docs are intentionally absent from llms.txt. Empty by
// design: removed endpoints must be deleted from the catalog, not whitelisted here.
const ALLOWED_MISSING_FROM_INDEX = new Set([]);

function unique(values) {
  return [...new Set(values)];
}

function extractUrls(markdown) {
  return unique(
    [...markdown.matchAll(/\((https:\/\/opendocs\.echotik\.live\/[^)]+)\)/g)].map((match) => match[1])
  );
}

function isEndpointDoc(url) {
  return /https:\/\/opendocs\.echotik\.live\/(echotik|realtime)\//.test(url);
}

async function main() {
  const response = await fetch(DOC_INDEX_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${DOC_INDEX_URL}: ${response.status}`);
  }

  const llmsText = await response.text();
  const llmsUrls = extractUrls(llmsText).filter(isEndpointDoc);
  const llmsUrlSet = new Set(llmsUrls);

  const catalogUrls = unique(apiCatalog.map((entry) => entry.docsUrl));
  const opendocsCatalogUrls = catalogUrls.filter((url) => url.startsWith("https://opendocs.echotik.live/"));
  const catalogOnly = opendocsCatalogUrls.filter((url) => !llmsUrlSet.has(url));
  const unexpectedCatalogOnly = catalogOnly.filter((url) => !ALLOWED_MISSING_FROM_INDEX.has(url));
  const docsOnly = llmsUrls.filter((url) => !catalogUrls.includes(url));
  const externalDocs = catalogUrls.filter(
    (url) => !url.startsWith("https://opendocs.echotik.live/") && !ALLOWED_NON_INDEXED_DOCS.has(url)
  );

  const report = {
    indexUrl: DOC_INDEX_URL,
    llmsEndpointDocCount: llmsUrls.length,
    catalogDocCount: catalogUrls.length,
    catalogOnly,
    unexpectedCatalogOnly,
    docsOnly,
    externalDocs,
    allowedNonIndexedDocs: [...ALLOWED_NON_INDEXED_DOCS],
    allowedMissingFromIndex: [...ALLOWED_MISSING_FROM_INDEX]
  };

  console.log(JSON.stringify(report, null, 2));

  if (unexpectedCatalogOnly.length > 0 || externalDocs.length > 0) {
    process.exitCode = 1;
  }
}

await main();
