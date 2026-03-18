import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesController } from '@modules/categories/categories.controller';
import { CategoriesService } from '@modules/categories/categories.service';
import { Category } from '@modules/categories/entities/category.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

describe('CategoriesController (integration)', () => {
  let controller: CategoriesController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn().mockResolvedValue([
              {
                id: 'root',
                name: 'Electronics',
                slug: 'electronics',
                parentId: null,
                sortOrder: 0,
                isActive: true,
              },
              {
                id: 'child',
                name: 'Audio',
                slug: 'audio',
                parentId: 'root',
                sortOrder: 1,
                isActive: true,
              },
            ]),
            findOne: jest.fn().mockImplementation(({ where }) => {
              if (where?.slug === 'electronics') {
                return Promise.resolve({
                  id: 'root',
                  name: 'Electronics',
                  slug: 'electronics',
                  parentId: null,
                  isActive: true,
                });
              }

              return Promise.resolve(null);
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(CategoriesController);
  });

  it('returns categories from the slug route without being shadowed by :id', async () => {
    const category = await controller.findBySlug('electronics');

    expect(category.slug).toBe('electronics');
  });

  it('returns a nested category tree', async () => {
    const categories = await controller.getCategoryTree();

    expect(categories).toHaveLength(1);
    expect(categories[0].children[0].slug).toBe('audio');
  });
});
