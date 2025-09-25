// src/utils/seo.ts
export type HreflangLink = { lang: string; href: string };

function upsertMeta(nameOrProp: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (isProperty) el.setAttribute("property", nameOrProp);
    else el.setAttribute("name", nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = `link[rel="${rel}"]${extra?.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (extra?.hreflang) el.setAttribute("hreflang", extra.hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export function setPageSEO(opts: {
  title?: string;
  description?: string;
  canonical?: string;
  og?: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    type?: string; // website, product, etc.
  };
  twitter?: {
    card?: string; // summary_large_image
    title?: string;
    description?: string;
    image?: string;
  };
  hreflang?: HreflangLink[]; // [{lang:'fi', href:'...'}, ...]
}) {
  const created: (HTMLMetaElement | HTMLLinkElement)[] = [];

  if (opts.title) document.title = opts.title;
  if (opts.description) created.push(upsertMeta("description", opts.description));

  if (opts.canonical) created.push(upsertLink("canonical", opts.canonical));

  if (opts.hreflang?.length) {
    for (const h of opts.hreflang) {
      created.push(upsertLink("alternate", h.href, { hreflang: h.lang }));
    }
  }

  if (opts.og) {
    const { title, description, url, image, type } = opts.og;
    if (title) created.push(upsertMeta("og:title", title, true));
    if (description) created.push(upsertMeta("og:description", description, true));
    if (url) created.push(upsertMeta("og:url", url, true));
    if (image) created.push(upsertMeta("og:image", image, true));
    created.push(upsertMeta("og:type", type || "website", true));
  }

  if (opts.twitter) {
    const { card, title, description, image } = opts.twitter;
    created.push(upsertMeta("twitter:card", card || "summary_large_image"));
    if (title) created.push(upsertMeta("twitter:title", title));
    if (description) created.push(upsertMeta("twitter:description", description));
    if (image) created.push(upsertMeta("twitter:image", image));
  }

  // Вернём функцию очистки для SPA-навигации (если нужно сбрасывать)
  return () => {
    // мета/линки перезаписываются на следующей странице; как правило, удалять не обязательно.
    // Если хочешь — можно раскомментировать:
    // for (const el of created) el.remove();
  };
}
