import { Controller, Get, Header, Req, SetMetadata } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Public } from '@common/decorators/public.decorator';
import { SKIP_TRANSFORM_KEY } from '@common/interceptors/transform.interceptor';
import { Product } from '@modules/products/entities/product.entity';
import { Category } from '@modules/categories/entities/category.entity';
import { ProductStatus } from '@common/enums';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function w3cDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

@Controller()
@SkipThrottle()
export class SeoController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('sitemap.xml')
  @Public()
  @SetMetadata(SKIP_TRANSFORM_KEY, true)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async sitemap(@Req() req: Request): Promise<string> {
    const proto = (req.get('x-forwarded-proto') || 'http').split(',')[0].trim();
    const host = req.get('host') || 'localhost';
    const base = `${proto}://${host}`;

    const productRepo = this.dataSource.getRepository(Product);
    const categoryRepo = this.dataSource.getRepository(Category);

    const [products, categories] = await Promise.all([
      productRepo.find({
        where: { status: ProductStatus.ACTIVE },
        select: ['slug', 'updatedAt'],
        order: { updatedAt: 'DESC' },
      }),
      categoryRepo.find({
        where: { isActive: true },
        select: ['id', 'updatedAt'],
        order: { sortOrder: 'ASC' },
      }),
    ]);

    const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
      { loc: `${base}/`, lastmod: w3cDate(new Date()), changefreq: 'daily', priority: '1.0' },
      { loc: `${base}/cart`, lastmod: w3cDate(new Date()), changefreq: 'monthly', priority: '0.3' },
      { loc: `${base}/login`, lastmod: w3cDate(new Date()), changefreq: 'yearly', priority: '0.2' },
    ];

    for (const c of categories) {
      urls.push({
        loc: `${base}/category/${c.id}`,
        lastmod: w3cDate(c.updatedAt ?? new Date()),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    for (const p of products) {
      urls.push({
        loc: `${base}/product/${encodeURIComponent(p.slug)}`,
        lastmod: w3cDate(p.updatedAt ?? new Date()),
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    const body = urls
      .map(
        (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
  }

  @Get('robots.txt')
  @Public()
  @SetMetadata(SKIP_TRANSFORM_KEY, true)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots(@Req() req: Request): string {
    const proto = (req.get('x-forwarded-proto') || 'http').split(',')[0].trim();
    const host = req.get('host') || 'localhost';
    const base = `${proto}://${host}`;
    return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
  }
}
