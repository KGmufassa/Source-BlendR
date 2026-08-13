import assert from "node:assert/strict";
import test from "node:test";

import { collectShopifyLinks, isShopifyStore, normalizeShopifyProduct } from "./src/shopify.js";

const collectionHtml = `
  <link rel="preconnect" href="https://cdn.shopify.com">
  <a href="/collections/shirts?utm_source=menu">Shirts</a>
  <a href="/collections/sets">Sets</a>
  <a href="/collections/shirts/products/linen-shirt?variant=101&utm_campaign=summer">Linen Shirt</a>
`;

test("Shopify detection and links are deterministic and canonical", () => {
  assert.equal(isShopifyStore({ html: collectionHtml, headers: { "powered-by": "Shopify" } }), true);
  assert.deepEqual(collectShopifyLinks("https://vendor.example/collections/all", collectionHtml), {
    categories: [
      { name: "Shirts", url: "https://vendor.example/collections/shirts" },
      { name: "Sets", url: "https://vendor.example/collections/sets" },
    ],
    productUrls: ["https://vendor.example/products/linen-shirt"],
  });
});

test("Shopify product JSON normalizes variants and provenance", () => {
  assert.deepEqual(normalizeShopifyProduct("https://vendor.example/products/linen-shirt", {
    id: 10,
    handle: "linen-shirt",
    title: "Linen Shirt",
    description: "Light shirt",
    featured_image: "//cdn.shopify.com/linen.jpg",
    variants: [{ id: 101, title: "Small", sku: "LIN-S", price: 4500, available: true }],
  }), {
    platform: "shopify",
    id: "10",
    handle: "linen-shirt",
    title: "Linen Shirt",
    description: "Light shirt",
    canonicalUrl: "https://vendor.example/products/linen-shirt",
    images: ["https://cdn.shopify.com/linen.jpg"],
    variants: [{ id: "101", title: "Small", sku: "LIN-S", priceCents: 4500, available: true }],
    provenance: { sourceUrl: "https://vendor.example/products/linen-shirt", method: "shopify_ajax_product", confidence: 1 },
  });
});
