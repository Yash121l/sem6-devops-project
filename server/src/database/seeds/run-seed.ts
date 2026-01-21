import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';

// Create a data source for seeding
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'ecommerce',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
});

async function runSeed() {
    try {
        await dataSource.initialize();
        console.log('📦 Database connection established');

        await seedDatabase(dataSource);

        await dataSource.destroy();
        console.log('📦 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
