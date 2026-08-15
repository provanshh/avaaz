export function domainFromWebsite(website?: string | null) {
  if (!website) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function agentLogoUrl(options: { website?: string | null; name?: string | null; stored?: string | null }) {
  if (options.stored) return options.stored;
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const domain = domainFromWebsite(options.website || "");
  if (token && domain) {
    const params = new URLSearchParams({
      token,
      format: "png",
      size: "256",
      retina: "true",
      fallback: "monogram",
      theme: "light",
    });
    return `https://img.logo.dev/${domain}?${params.toString()}`;
  }
  if (token && options.name) {
    const params = new URLSearchParams({
      token,
      format: "png",
      size: "256",
      retina: "true",
      fallback: "monogram",
    });
    return `https://img.logo.dev/name/${encodeURIComponent(options.name)}?${params.toString()}`;
  }
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return "";
}
