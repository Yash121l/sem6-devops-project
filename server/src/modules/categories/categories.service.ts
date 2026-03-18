import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { generateSlug } from '@common/utils/string.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = createCategoryDto.slug || generateSlug(createCategoryDto.name);

    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Category>> {
    const [categories, total] = await this.categoryRepository.findAndCount({
      where: { isActive: true },
      relations: ['parent', 'children'],
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return paginate(categories, total, paginationDto.page, paginationDto.limit);
  }

  async findAllAdmin(paginationDto: PaginationDto): Promise<PaginatedResult<Category>> {
    const [categories, total] = await this.categoryRepository.findAndCount({
      relations: ['parent', 'children'],
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return paginate(categories, total, paginationDto.page, paginationDto.limit);
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Please delete subcategories first.',
      );
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Please move or delete products first.',
      );
    }

    await this.categoryRepository.softRemove(category);
  }

  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return this.buildTree(categories);
  }

  private buildTree(categories: Category[], parentId: string | null = null): Category[] {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: this.buildTree(categories, category.id),
      }));
  }
}
