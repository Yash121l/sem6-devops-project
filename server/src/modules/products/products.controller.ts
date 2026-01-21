import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
    CreateProductDto,
    UpdateProductDto,
    CreateProductVariantDto,
    UpdateProductVariantDto,
    ProductFilterDto,
} from './dto/product.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Product created successfully')
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @Public()
    @ResponseMessage('Products retrieved successfully')
    @ApiOperation({ summary: 'Get all active products' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
    async findAll(
        @Query() paginationDto: PaginationDto,
        @Query() filterDto: ProductFilterDto,
    ) {
        return this.productsService.findAll(paginationDto, filterDto);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('All products retrieved successfully')
    @ApiOperation({ summary: 'Get all products including drafts (Admin)' })
    @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
    async findAllAdmin(
        @Query() paginationDto: PaginationDto,
        @Query() filterDto: ProductFilterDto,
    ) {
        return this.productsService.findAllAdmin(paginationDto, filterDto);
    }

    @Get('featured')
    @Public()
    @ResponseMessage('Featured products retrieved successfully')
    @ApiOperation({ summary: 'Get featured products' })
    @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
    async findFeatured(@Query('limit') limit?: number) {
        return this.productsService.findFeatured(limit);
    }

    @Get(':id')
    @Public()
    @ResponseMessage('Product retrieved successfully')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    @Get('slug/:slug')
    @Public()
    @ResponseMessage('Product retrieved successfully')
    @ApiOperation({ summary: 'Get product by slug' })
    @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Product updated successfully')
    @ApiOperation({ summary: 'Update product' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Product deleted successfully')
    @ApiOperation({ summary: 'Delete product' })
    @ApiResponse({ status: 204, description: 'Product deleted successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.productsService.remove(id);
    }

    @Post(':id/variants')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Variant added successfully')
    @ApiOperation({ summary: 'Add variant to product' })
    @ApiResponse({ status: 201, description: 'Variant added successfully' })
    async addVariant(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() createVariantDto: CreateProductVariantDto,
    ) {
        return this.productsService.addVariant(id, createVariantDto);
    }

    @Put(':id/variants/:variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Variant updated successfully')
    @ApiOperation({ summary: 'Update product variant' })
    @ApiResponse({ status: 200, description: 'Variant updated successfully' })
    async updateVariant(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('variantId', ParseUUIDPipe) variantId: string,
        @Body() updateVariantDto: UpdateProductVariantDto,
    ) {
        return this.productsService.updateVariant(id, variantId, updateVariantDto);
    }

    @Delete(':id/variants/:variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Variant deleted successfully')
    @ApiOperation({ summary: 'Delete product variant' })
    @ApiResponse({ status: 204, description: 'Variant deleted successfully' })
    async removeVariant(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('variantId', ParseUUIDPipe) variantId: string,
    ) {
        await this.productsService.removeVariant(id, variantId);
    }
}
