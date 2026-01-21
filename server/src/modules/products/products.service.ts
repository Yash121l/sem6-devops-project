import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
    CreateProductDto,
    UpdateProductDto,
    CreateProductVariantDto,
    UpdateProductVariantDto,
    ProductFilterDto,
} from './dto/product.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { generateSlug, generateSku } from '@common/utils/string.util';
import { ProductStatus } from '@common/enums';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductVariant)
        private readonly variantRepository: Repository<ProductVariant>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { variants, ...productData } = createProductDto;

        // Check SKU uniqueness
        const existingSku = await this.productRepository.findOne({
            where: { sku: productData.sku },
        });

        if (existingSku) {
            throw new ConflictException('Product with this SKU already exists');
        }

        // Generate slug if not provided
        const slug = productData.slug || generateSlug(productData.name);

        const existingSlug = await this.productRepository.findOne({
            where: { slug },
        });

        if (existingSlug) {
            throw new ConflictException('Product with this slug already exists');
        }

        const product = this.productRepository.create({
            ...productData,
            slug,
        });

        const savedProduct = await this.productRepository.save(product);

        // Create variants if provided
        if (variants && variants.length > 0) {
            const variantEntities = variants.map((variant) =>
                this.variantRepository.create({
                    ...variant,
                    productId: savedProduct.id,
                }),
            );

            await this.variantRepository.save(variantEntities);
        } else {
            // Create default variant
            const defaultVariant = this.variantRepository.create({
                productId: savedProduct.id,
                sku: `${savedProduct.sku}-DEFAULT`,
                name: 'Default',
                price: savedProduct.basePrice,
                costPrice: savedProduct.costPrice,
                isDefault: true,
            });

            await this.variantRepository.save(defaultVariant);
        }

        return this.findOne(savedProduct.id);
    }

    async findAll(
        paginationDto: PaginationDto,
        filterDto?: ProductFilterDto,
    ): Promise<PaginatedResult<Product>> {
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.variants', 'variants')
            .where('product.status = :status', { status: ProductStatus.ACTIVE });

        if (filterDto?.categoryId) {
            queryBuilder.andWhere('product.categoryId = :categoryId', {
                categoryId: filterDto.categoryId,
            });
        }

        if (filterDto?.isFeatured !== undefined) {
            queryBuilder.andWhere('product.isFeatured = :isFeatured', {
                isFeatured: filterDto.isFeatured,
            });
        }

        if (filterDto?.minPrice !== undefined) {
            queryBuilder.andWhere('product.basePrice >= :minPrice', {
                minPrice: filterDto.minPrice,
            });
        }

        if (filterDto?.maxPrice !== undefined) {
            queryBuilder.andWhere('product.basePrice <= :maxPrice', {
                maxPrice: filterDto.maxPrice,
            });
        }

        if (filterDto?.search) {
            queryBuilder.andWhere(
                '(product.name ILIKE :search OR product.description ILIKE :search)',
                { search: `%${filterDto.search}%` },
            );
        }

        queryBuilder
            .orderBy('product.createdAt', 'DESC')
            .skip(paginationDto.skip)
            .take(paginationDto.limit);

        const [products, total] = await queryBuilder.getManyAndCount();

        return paginate(products, total, paginationDto.page, paginationDto.limit);
    }

    async findAllAdmin(
        paginationDto: PaginationDto,
        filterDto?: ProductFilterDto,
    ): Promise<PaginatedResult<Product>> {
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.variants', 'variants');

        if (filterDto?.status) {
            queryBuilder.andWhere('product.status = :status', {
                status: filterDto.status,
            });
        }

        if (filterDto?.categoryId) {
            queryBuilder.andWhere('product.categoryId = :categoryId', {
                categoryId: filterDto.categoryId,
            });
        }

        if (filterDto?.search) {
            queryBuilder.andWhere(
                '(product.name ILIKE :search OR product.sku ILIKE :search)',
                { search: `%${filterDto.search}%` },
            );
        }

        queryBuilder
            .orderBy('product.createdAt', 'DESC')
            .skip(paginationDto.skip)
            .take(paginationDto.limit);

        const [products, total] = await queryBuilder.getManyAndCount();

        return paginate(products, total, paginationDto.page, paginationDto.limit);
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['category', 'variants', 'variants.inventory'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySlug(slug: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { slug, status: ProductStatus.ACTIVE },
            relations: ['category', 'variants', 'variants.inventory'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySku(sku: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { sku },
            relations: ['category', 'variants'],
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        const { variants, ...productData } = updateProductDto;

        if (productData.sku && productData.sku !== product.sku) {
            const existingSku = await this.productRepository.findOne({
                where: { sku: productData.sku },
            });

            if (existingSku) {
                throw new ConflictException('Product with this SKU already exists');
            }
        }

        if (productData.slug && productData.slug !== product.slug) {
            const existingSlug = await this.productRepository.findOne({
                where: { slug: productData.slug },
            });

            if (existingSlug) {
                throw new ConflictException('Product with this slug already exists');
            }
        }

        Object.assign(product, productData);

        await this.productRepository.save(product);

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.softRemove(product);
    }

    async addVariant(productId: string, createVariantDto: CreateProductVariantDto): Promise<ProductVariant> {
        const product = await this.findOne(productId);

        const existingSku = await this.variantRepository.findOne({
            where: { sku: createVariantDto.sku },
        });

        if (existingSku) {
            throw new ConflictException('Variant with this SKU already exists');
        }

        // If this is set as default, unset other defaults
        if (createVariantDto.isDefault) {
            await this.variantRepository.update(
                { productId },
                { isDefault: false },
            );
        }

        const variant = this.variantRepository.create({
            ...createVariantDto,
            productId,
        });

        return this.variantRepository.save(variant);
    }

    async updateVariant(
        productId: string,
        variantId: string,
        updateVariantDto: UpdateProductVariantDto,
    ): Promise<ProductVariant> {
        const variant = await this.variantRepository.findOne({
            where: { id: variantId, productId },
        });

        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
            const existingSku = await this.variantRepository.findOne({
                where: { sku: updateVariantDto.sku },
            });

            if (existingSku) {
                throw new ConflictException('Variant with this SKU already exists');
            }
        }

        if (updateVariantDto.isDefault) {
            await this.variantRepository.update(
                { productId },
                { isDefault: false },
            );
        }

        Object.assign(variant, updateVariantDto);

        return this.variantRepository.save(variant);
    }

    async removeVariant(productId: string, variantId: string): Promise<void> {
        const product = await this.findOne(productId);

        if (product.variants.length <= 1) {
            throw new BadRequestException('Cannot delete the last variant');
        }

        const variant = await this.variantRepository.findOne({
            where: { id: variantId, productId },
        });

        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        await this.variantRepository.remove(variant);
    }

    async findFeatured(limit: number = 10): Promise<Product[]> {
        return this.productRepository.find({
            where: { isFeatured: true, status: ProductStatus.ACTIVE },
            relations: ['category', 'variants'],
            take: limit,
            order: { createdAt: 'DESC' },
        });
    }

    async findVariant(variantId: string): Promise<ProductVariant> {
        const variant = await this.variantRepository.findOne({
            where: { id: variantId },
            relations: ['product', 'inventory'],
        });

        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        return variant;
    }
}
