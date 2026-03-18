import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '@modules/categories/categories.service';
import { Category } from '@modules/categories/entities/category.entity';

type MockRepository = Partial<Record<keyof Repository<Category>, jest.Mock>>;

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: MockRepository;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get(CategoriesService);
  });

  it('creates a category with a generated slug when none is provided', async () => {
    const createdCategory = {
      id: 'category-1',
      name: 'Fresh Produce',
      slug: 'fresh-produce',
      isActive: true,
    } as Category;

    repository.findOne?.mockResolvedValueOnce(null);
    repository.create?.mockReturnValue(createdCategory);
    repository.save?.mockResolvedValue(createdCategory);

    const result = await service.create({
      name: 'Fresh Produce',
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Fresh Produce',
      slug: 'fresh-produce',
    });
    expect(result.slug).toBe('fresh-produce');
  });

  it('rejects duplicate category slugs', async () => {
    repository.findOne?.mockResolvedValue({
      id: 'category-1',
      name: 'Electronics',
      slug: 'electronics',
    } as Category);

    await expect(
      service.create({
        name: 'Electronics',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('builds a nested category tree from flat repository data', async () => {
    repository.find?.mockResolvedValue([
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
    ] as Category[]);

    const tree = await service.getCategoryTree();

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].slug).toBe('audio');
  });
});
