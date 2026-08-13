import { canonicalizeSourceUrl, createProvenance } from "./contracts.js";
import { URL } from "node:url";

const ANCHOR_PATTERN = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;

export function isShopifyStore({ html = "", headers = {} }) {
  const poweredBy = headers["powered-by"] ?? headers["x-powered-by"] ?? "";
  return /shopify/i.test(poweredBy) || /cdn\.shopify\.com|Shopify\.theme|shopify-section/i.test(html);
}

export function collectShopifyLinks(sourceUrl, html) {
  const categories = new Map();
  const productUrls = new Set();
  for (const match of html.matchAll(ANCHOR_PATTERN)) {
    const href = match[1];
    if (!href) continue;
    const url = new URL(href, sourceUrl);
    if (url.origin !== new URL(sourceUrl).origin) continue;
    const name = stripMarkup(match[2] ?? "") || url.pathname.split("/").filter(Boolean).at(-1) || "Collection";
    if (/^\/collections\/[^/]+\/?$/.test(url.pathname)) categories.set(canonicalizeSourceUrl(url), { name, url: canonicalizeSourceUrl(url) });
    const productHandle = url.pathname.match(/(?:^|\/collections\/[^/]+)\/products\/([^/]+)\/?$/)?.[1];
    if (productHandle) {
      url.pathname = `/products/${productHandle}`;
      url.search = "";
      productUrls.add(canonicalizeSourceUrl(url));
    }
  }
  return { categories: [...categories.values()], productUrls: [...productUrls] };
}

export function normalizeShopifyProduct(sourceUrl, product) {
  const canonicalUrl = canonicalizeSourceUrl(sourceUrl);
  const images = [...new Set([product.featured_image, ...(product.images ?? [])].filter(Boolean).map(absoluteImageUrl))];
  return {
    platform: "shopify",
    id: String(product.id),
    handle: String(product.handle ?? canonicalUrl.split("/").at(-1)),
    title: String(product.title ?? "Untitled product"),
    description: String(product.description ?? ""),
    canonicalUrl,
    images,
    variants: (product.variants ?? []).map((variant) => ({
      id: String(variant.id),
      title: String(variant.title ?? "Default"),
      sku: String(variant.sku ?? "").trim().toUpperCase(),
      priceCents: Number(variant.price ?? 0),
      available: Boolean(variant.available),
    })),
    provenance: createProvenance({ sourceUrl: canonicalUrl, method: "shopify_ajax_product", confidence: 1 }),
  };
}

export function shopifyProductJsonUrl(productUrl) {
  const url = new URL(canonicalizeSourceUrl(productUrl));
  url.pathname = `${url.pathname}.js`;
  return url.toString();
}

function stripMarkup(value) {
  return value.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
}

function absoluteImageUrl(value) {
  return String(value).startsWith("//") ? `https:${value}` : String(value);
}
