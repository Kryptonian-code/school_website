import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string[];
  siteName?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function removeHeadElement(selector: string) {
  document.head.querySelector(selector)?.remove();
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

const PageMeta = ({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  robots = "index,follow",
  keywords,
  siteName = "School Website",
  publishedTime,
  modifiedTime,
}: PageMetaProps) => {
  const location = useLocation();

  useEffect(() => {
    const path = canonicalPath ?? location.pathname;
    const canonicalUrl = new URL(path, window.location.origin).toString();
    const imageUrl = image ? new URL(image, window.location.origin).toString() : "";

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    if (keywords && keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords.join(", ") });
    } else {
      removeHeadElement('meta[name="keywords"]');
    }
    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    } else {
      removeHeadElement('meta[property="og:image"]');
      removeHeadElement('meta[name="twitter:image"]');
    }
    if (publishedTime) {
      upsertMeta('meta[property="article:published_time"]', { property: "article:published_time", content: publishedTime });
    } else {
      removeHeadElement('meta[property="article:published_time"]');
    }
    if (modifiedTime) {
      upsertMeta('meta[property="article:modified_time"]', { property: "article:modified_time", content: modifiedTime });
    } else {
      removeHeadElement('meta[property="article:modified_time"]');
    }
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  }, [canonicalPath, description, image, keywords, location.pathname, modifiedTime, publishedTime, robots, siteName, title, type]);

  return null;
};

export default PageMeta;
