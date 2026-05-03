import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '@modules/products/entities/product.entity';
import { seedDatabase } from './seeds/seed';

const SEED_ADVISORY_LOCK_KEY = 902198374;

@Injectable()
export class DbSeedService implements OnModuleInit {
  private readonly logger = new Logger(DbSeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const run = String(process.env.RUN_DB_SEED ?? '').toLowerCase() === 'true';
    if (!run) {
      return;
    }

    await this.dataSource.query('SELECT pg_advisory_lock($1)', [SEED_ADVISORY_LOCK_KEY]);
    try {
      const count = await this.dataSource.getRepository(Product).count();
      if (count > 0) {
        this.logger.log('Database already contains products; skipping seed.');
        return;
      }
      this.logger.log('Seeding database (idempotent catalog + demo users)...');
      await seedDatabase(this.dataSource);
      this.logger.log('Seed finished.');
    } catch (err) {
      this.logger.error('Seed failed', err instanceof Error ? err.stack : String(err));
    } finally {
      await this.dataSource.query('SELECT pg_advisory_unlock($1)', [SEED_ADVISORY_LOCK_KEY]);
    }
  }
}
