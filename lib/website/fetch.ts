const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function normalizeWebsiteUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Paste a website link first.");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("That doesn't look like a valid website link.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https links are supported.");
  }
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || !host.includes(".")) {
    throw new Error("Please use a public website link.");
  }
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.)/.test(host)) {
    throw new Error("Please use a public website link.");
  }
  return url.toString();
}

export async function fetchWebsiteText(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AvaazBot/1.0; +https://avaaz.ai) AppleWebKit/537.36 Chrome/120.0.0.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      throw new Error("Could not open that website. Check the link and try again.");
    }
    const html = await response.text();
    return {
      url: response.url || url,
      title: readTitle(html),
      text: htmlToText(html),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("That website took too long to respond.");
    }
    throw error instanceof Error ? error : new Error("Could not read that website.");
  } finally {
    clearTimeout(timer);
  }
}

function readTitle(html: string) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);
  if (og?.[1]) return decode(og[1]);
  const title = html.match(/<title[^>]*>([^<]+)/i);
  return decode(title?.[1] || "");
}

function htmlToText(html: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return cleaned.slice(0, 28_000);
}

function decode(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
