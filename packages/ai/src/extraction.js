export async function runExtractionFallback({ deterministic, executeAi, budget = {} }) {
  const products = validProducts(deterministic?.products) ? deterministic.products : [];
  if (products.length) return { mode: "deterministic", products, callsUsed: 0 };
  if (!Number.isInteger(budget.maxCalls) || budget.maxCalls < 1) return manual("ai_budget_exhausted", 0);

  try {
    const output = await executeAi();
    if (!validProducts(output?.products)) return manual("ai_output_invalid", 1);
    return { mode: "ai_validated", products: output.products, callsUsed: 1 };
  } catch {
    return manual("ai_provider_failed", 1);
  }
}

function validProducts(products) {
  return Array.isArray(products) && products.every((product) => product && typeof product.title === "string"
    && /^https?:\/\//.test(product.canonicalUrl) && Array.isArray(product.variants));
}

function manual(reason, callsUsed) {
  return { mode: "manual_review", reason, products: [], callsUsed };
}
