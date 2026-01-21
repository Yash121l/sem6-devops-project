import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsBoolean,
    IsUUID,
    IsInt,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({ example: 'electronics' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @ApiPropertyOptional({ example: 'Electronic devices and accessories' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    parentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    imageUrl?: string;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    metadata?: Record<string, unknown>;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

export class CategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    parentId?: string;

    @ApiPropertyOptional()
    imageUrl?: string;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
