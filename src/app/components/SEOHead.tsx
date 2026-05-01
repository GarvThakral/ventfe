import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
}

export function SEOHead({
  title = 'Vent 🌬️ — Private AI Journaling',
  description = 'A place to let it out. Your private AI journal for venting about people in your life. Talk freely, be heard deeply, and breathe easier.',
  ogImage = '/og-image.svg',
  ogUrl,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    const currentUrl = ogUrl || window.location.href;

    // Set or update meta tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (!element) {
        element = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', description);
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', ogImage);
    setMetaTag('og:url', currentUrl);
    setMetaTag('og:type', 'website');
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
  }, [title, description, ogImage, ogUrl]);

  return null;
}
