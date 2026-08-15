import { Firecrawl } from "firecrawl";
import { fetchWebsiteText as fetchHomepageFallback } from "@/lib/website/fetch";

const IMPORTANT =
  /(pricing|price|plans|plan|about|contact|product|service|faq|menu|shop|store|hour|location|team|book|order|collection|catalog|support|help|policy|careers|menu)/i;

export type CrawledPage = {
  url: string;
  title: string;
  markdown: string;
};

export async function crawlWebsite(startUrl: string): Promise<{
  url: string;
  title: string;
  text: string;
  pages: CrawledPage[];
}> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    const page = await fetchHomepageFallback(startUrl);
    return { ...page, pages: [{ url: page.url, title: page.title, markdown: page.text }] };
  }

  const firecrawl = new Firecrawl({ apiKey: key, timeoutMs: 90_000 });

  try {
    const mapped = await firecrawl.map(startUrl, { limit: 80, includeSubdomains: false });
    const picked = pickImportantUrls(startUrl, mapped.links?.map((link) => link.url) || []);
    if (picked.length >= 2) {
      const job = await firecrawl.batchScrape(picked, {
        options: { formats: ["markdown"], onlyMainContent: true },
        timeout: 90,
        pollInterval: 2,
      });
      const pages = documentsToPages(job.data || []);
      if (pages.length) return combine(startUrl, pages);
    }
  } catch (error) {
    console.error("firecrawl map/batch", error);
  }

  try {
    const job = await firecrawl.crawl(startUrl, {
      limit: 25,
      maxDiscoveryDepth: 3,
      allowExternalLinks: false,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      timeout: 90,
      pollInterval: 2,
    });
    const pages = documentsToPages(job.data || []);
    if (pages.length) return combine(startUrl, pages);
  } catch (error) {
    console.error("firecrawl crawl", error);
  }

  const page = await fetchHomepageFallback(startUrl);
  return { ...page, pages: [{ url: page.url, title: page.title, markdown: page.text }] };
}

function pickImportantUrls(startUrl: string, discovered: string[]) {
  const origin = new URL(startUrl).origin;
  const unique = new Set<string>([startUrl]);
  const ranked = discovered
    .filter((href) => {
      try {
        const next = new URL(href);
        return next.origin === origin && !unique.has(next.toString());
      } catch {
        return false;
      }
    })
    .sort((a, b) => scoreUrl(b) - scoreUrl(a));

  for (const href of ranked) {
    unique.add(href);
    if (unique.size >= 25) break;
  }
  return [...unique];
}

function scoreUrl(href: string) {
  const path = href.toLowerCase();
  if (IMPORTANT.test(path)) return 10;
  if (path.split("/").filter(Boolean).length <= 2) return 3;
  return 1;
}

function documentsToPages(docs: { markdown?: string; metadata?: { sourceURL?: string; title?: string; url?: string } }[]): CrawledPage[] {
  return docs
    .map((doc) => ({
      url: doc.metadata?.sourceURL || doc.metadata?.url || "",
      title: doc.metadata?.title || "",
      markdown: (doc.markdown || "").trim(),
    }))
    .filter((page) => page.markdown.length > 40);
}

function combine(startUrl: string, pages: CrawledPage[]) {
  const ordered = [...pages].sort((a, b) => scoreUrl(b.url) - scoreUrl(a.url));
  const text = ordered
    .map((page) => `# ${page.title || page.url}\nSource: ${page.url}\n\n${page.markdown}`)
    .join("\n\n---\n\n")
    .slice(0, 90_000);
  return {
    url: startUrl,
    title: ordered.find((page) => page.title)?.title || "",
    text,
    pages: ordered,
  };
}
