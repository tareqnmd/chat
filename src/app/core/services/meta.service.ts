import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_METADATA } from '../config/app-metadata.config';
import { SEO_CONFIG } from '../config/seo.config';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
  ) {}

  initDefaultMeta(): void {
    this.updateTitle();
    this.updateMetaTags([
      { name: 'description', content: APP_METADATA.description },
      { name: 'author', content: APP_METADATA.author },
      { name: 'robots', content: SEO_CONFIG.robots },

      { property: 'og:title', content: APP_METADATA.name },
      { property: 'og:description', content: APP_METADATA.description },
      { property: 'og:type', content: SEO_CONFIG.ogType },
      { property: 'og:url', content: SEO_CONFIG.baseUrl },
      { property: 'og:image', content: SEO_CONFIG.baseUrl + SEO_CONFIG.ogImage },

      { name: 'twitter:card', content: SEO_CONFIG.twitterCard },
      { name: 'twitter:title', content: APP_METADATA.name },
      { name: 'twitter:description', content: APP_METADATA.description },
    ]);
  }

  updateTitle(subTitle?: string): void {
    const title = subTitle
      ? `${subTitle} | ${APP_METADATA.name}`
      : `${APP_METADATA.name} - AI Chat Assistant`;
    this.titleService.setTitle(title);
  }

  updateMetaTags(tags: { name?: string; property?: string; content: string }[]): void {
    tags.forEach((tag) => {
      if (tag.name) {
        this.metaService.updateTag({ name: tag.name, content: tag.content });
      } else if (tag.property) {
        this.metaService.updateTag({ property: tag.property, content: tag.content });
      }
    });
  }
}
