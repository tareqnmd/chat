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
    const authorHandle =
      APP_METADATA.authorHandle || `@${APP_METADATA.authorUsername || 'tareqnmd'}`;
    const authorImageUrl = `${SEO_CONFIG.baseUrl}${APP_METADATA.authorImage.startsWith('/') ? '' : '/'}${APP_METADATA.authorImage}`;

    this.updateTitle();
    this.updateMetaTags([
      { name: 'description', content: APP_METADATA.description },
      { name: 'author', content: `${APP_METADATA.author} (${authorHandle})` },
      { name: 'author:url', content: APP_METADATA.authorUrl },
      {
        name: 'author:username',
        content: APP_METADATA.authorUsername || authorHandle.replace('@', ''),
      },
      { name: 'author:image', content: authorImageUrl },
      { name: 'robots', content: SEO_CONFIG.robots },

      { property: 'og:title', content: APP_METADATA.name },
      { property: 'og:description', content: APP_METADATA.description },
      { property: 'og:type', content: SEO_CONFIG.ogType },
      { property: 'og:url', content: SEO_CONFIG.baseUrl },
      { property: 'og:image', content: SEO_CONFIG.baseUrl + SEO_CONFIG.ogImage },
      { property: 'og:site_name', content: APP_METADATA.name },
      { property: 'article:author', content: APP_METADATA.authorUrl },

      { name: 'twitter:card', content: SEO_CONFIG.twitterCard },
      { name: 'twitter:title', content: APP_METADATA.name },
      { name: 'twitter:description', content: APP_METADATA.description },
      { name: 'twitter:creator', content: authorHandle },
      { name: 'twitter:image', content: authorImageUrl },
      { name: 'twitter:url', content: SEO_CONFIG.baseUrl },
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
