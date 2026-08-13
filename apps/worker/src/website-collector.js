import { normalizeWebsiteSource } from "../../../packages/scrapers/src/website.js";
import { collectShopifyLinks, isShopifyStore, normalizeShopifyProduct, shopifyProductJsonUrl } from "../../../packages/scrapers/src/shopify.js";
import { runExtractionFallback } from "../../../packages/ai/src/extraction.js";
import { URL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

export async function collectWebsiteSource(workspaceId, sourceUri, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const sleep = options.sleep ?? delay;
  let requestCount = 0;
  async function request(target) {
    if (requestCount > 0) await sleep(options.hostDelayMs ?? 250);
    requestCount += 1;
    let response = await fetchImpl(target, { redirect: "error", signal: globalThis.AbortSignal.timeout(options.timeoutMs ?? 20_000) });
    if (response.status === 429) {
      const retryAfterSeconds = Number(response.headers.get("retry-after") ?? 1);
      await sleep(Number.isFinite(retryAfterSeconds) ? Math.max(1, retryAfterSeconds) * 1000 : 1000);
      response = await fetchImpl(target, { redirect: "error", signal: globalThis.AbortSignal.timeout(options.timeoutMs ?? 20_000) });
    }
    return response;
  }
  const initial = await request(sourceUri);
  if (!initial.ok) throw new Error(`source_http_${initial.status}`);
  const html = (await initial.text()).slice(0, options.maxResponseBytes ?? 2_000_000);
  const headers = { "powered-by": initial.headers.get("powered-by") ?? "", "x-powered-by": initial.headers.get("x-powered-by") ?? "" };

  if (isShopifyStore({ html, headers })) {
    const firstLinks = collectShopifyLinks(sourceUri, html);
    const categories = new Map(firstLinks.categories.map((category) => [category.url, category]));
    const productUrls = new Set(firstLinks.productUrls);
    const completedUrls = [sourceUri];
    let duplicatesSkipped = 0;
    if (/\/collections\/[^/]+\/?$/.test(new URL(sourceUri).pathname)) {
      for (let pageNumber = 2; pageNumber <= (options.maxPages ?? 10); pageNumber += 1) {
        const pageUrl = new URL(sourceUri);
        pageUrl.searchParams.set("page", String(pageNumber));
        const pageResponse = await request(pageUrl);
        if (!pageResponse.ok) break;
        const pageHtml = (await pageResponse.text()).slice(0, options.maxResponseBytes ?? 2_000_000);
        completedUrls.push(pageUrl.toString());
        const pageLinks = collectShopifyLinks(sourceUri, pageHtml);
        for (const category of pageLinks.categories) categories.set(category.url, category);
        let newProducts = 0;
        for (const productUrl of pageLinks.productUrls) {
          if (productUrls.has(productUrl)) duplicatesSkipped += 1;
          else {
            productUrls.add(productUrl);
            newProducts += 1;
          }
        }
        if (!newProducts) break;
      }
    }
    const products = [];
    let productsFailed = 0;
    for (const productUrl of [...productUrls].slice(0, 250)) {
      try {
        const response = await request(shopifyProductJsonUrl(productUrl));
        if (!response.ok) {
          productsFailed += 1;
          continue;
        }
        products.push(normalizeShopifyProduct(productUrl, await response.json()));
      } catch {
        productsFailed += 1;
      }
    }
    return {
      platform: "shopify",
      url: sourceUri,
      title: titleFromHtml(html, new URL(sourceUri).hostname),
      categories: [...categories.values()],
      products,
      records: products,
      checkpoint: {
        completedUrls,
        counters: {
          pagesCompleted: completedUrls.length,
          productsDiscovered: productUrls.size,
          productsCompleted: products.length,
          productsFailed,
          duplicatesSkipped,
        },
      },
    };
  }

  const renderPage = options.renderPage ?? ((url) => import("./browser.js").then(({ collectRenderedPage }) => collectRenderedPage(url)));
  const rendered = await renderPage(sourceUri);
  const normalized = normalizeWebsiteSource({ workspaceId, sourceUri, html: rendered.html });
  const extraction = await runExtractionFallback({
    deterministic: { products: [] },
    executeAi: options.executeAi ?? (async () => { throw new Error("no_provider_available"); }),
    budget: { maxCalls: options.executeAi ? (options.maxAiCalls ?? 1) : 0 },
  });
  return {
    platform: "generic_browser",
    url: sourceUri,
    title: normalized.title,
    categories: [],
    products: extraction.products,
    records: normalized.records,
    extractionMode: extraction.mode,
    manualReviewReason: extraction.reason ?? null,
  };
}

function titleFromHtml(html, fallback) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || fallback;
}
