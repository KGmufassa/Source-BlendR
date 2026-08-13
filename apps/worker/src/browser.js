export async function collectRenderedPage(sourceUrl, options = {}) {
  const validateUrl = options.validateUrl ?? (await import("./url-security.js")).assertPublicHttpUrl;
  await validateUrl(sourceUrl);
  const chromium = options.chromium ?? (await import("playwright")).chromium;
  const browser = await chromium.launch({ headless: true });
  let context;
  try {
    context = await browser.newContext({ serviceWorkers: "block" });
    if (context.route) await context.route("**/*", async (route) => {
      try {
        await validateUrl(route.request().url());
        await route.continue();
      } catch {
        await route.abort("blockedbyclient");
      }
    });
    const page = await context.newPage();
    await page.goto(sourceUrl, { waitUntil: "domcontentloaded", timeout: options.timeoutMs ?? 20_000 });
    return { url: sourceUrl, html: await page.content(), method: "playwright_rendered_dom" };
  } finally {
    await context?.close();
    await browser.close();
  }
}
