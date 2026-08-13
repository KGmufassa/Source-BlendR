import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { URL } from "node:url";

export async function assertPublicHttpUrl(sourceUrl, lookupImpl = lookupAll) {
  const url = new URL(sourceUrl);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("source_protocol_invalid");
  if (url.username || url.password) throw new Error("source_credentials_forbidden");
  const addresses = isIP(url.hostname) ? [{ address: url.hostname }] : await lookupImpl(url.hostname);
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("source_address_forbidden");
  return url;
}

export async function fetchPublic(sourceUrl, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  let url = await assertPublicHttpUrl(sourceUrl, options.lookupImpl);
  for (let redirect = 0; redirect <= (options.maxRedirects ?? 5); redirect += 1) {
    const response = await fetchImpl(url, { signal: options.signal, headers: options.headers, redirect: "manual" });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location || redirect === (options.maxRedirects ?? 5)) throw new Error("source_redirect_invalid");
    url = await assertPublicHttpUrl(new URL(location, url), options.lookupImpl);
  }
  throw new Error("source_redirect_invalid");
}

export function robotsAllows(robotsText, pathname) {
  const lines = robotsText.split(/\r?\n/).map((line) => line.replace(/#.*/, "").trim()).filter(Boolean);
  let applies = false;
  const rules = [];
  for (const line of lines) {
    const [rawKey, ...rawValue] = line.split(":");
    const key = rawKey.toLowerCase();
    const value = rawValue.join(":").trim();
    if (key === "user-agent") applies = value === "*";
    else if (applies && (key === "allow" || key === "disallow") && value) rules.push({ allow: key === "allow", path: value });
  }
  const match = rules.filter((rule) => pathname.startsWith(rule.path)).sort((a, b) => b.path.length - a.path.length)[0];
  return match?.allow ?? true;
}

async function lookupAll(hostname) {
  return lookup(hostname, { all: true, verbatim: true });
}

function isPrivateAddress(address) {
  const value = address.toLowerCase();
  return value === "::" || value === "::1" || value === "0.0.0.0"
    || value.startsWith("127.") || value.startsWith("10.") || value.startsWith("192.168.")
    || /^172\.(1[6-9]|2\d|3[01])\./.test(value) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(value)
    || value.startsWith("169.254.") || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}
