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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Category created successfully')
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @Public()
    @ResponseMessage('Categories retrieved successfully')
    @ApiOperation({ summary: 'Get all active categories' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.categoriesService.findAll(paginationDto);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('All categories retrieved successfully')
    @ApiOperation({ summary: 'Get all categories including inactive (Admin)' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    async findAllAdmin(@Query() paginationDto: PaginationDto) {
        return this.categoriesService.findAllAdmin(paginationDto);
    }

    @Get('tree')
    @Public()
    @ResponseMessage('Category tree retrieved successfully')
    @ApiOperation({ summary: 'Get category tree structure' })
    @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
    async getCategoryTree() {
        return this.categoriesService.getCategoryTree();
    }

    @Get('root')
    @Public()
    @ResponseMessage('Root categories retrieved successfully')
    @ApiOperation({ summary: 'Get root categories' })
    @ApiResponse({ status: 200, description: 'Root categories retrieved successfully' })
    async findRootCategories() {
        return this.categoriesService.findRootCategories();
    }

    @Get(':id')
    @Public()
    @ResponseMessage('Category retrieved successfully')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.findOne(id);
    }

    @Get('slug/:slug')
    @Public()
    @ResponseMessage('Category retrieved successfully')
    @ApiOperation({ summary: 'Get category by slug' })
    @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findBySlug(@Param('slug') slug: string) {
        return this.categoriesService.findBySlug(slug);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Category updated successfully')
    @ApiOperation({ summary: 'Update category' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Category deleted successfully')
    @ApiOperation({ summary: 'Delete category' })
    @ApiResponse({ status: 204, description: 'Category deleted successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.categoriesService.remove(id);
    }
}
