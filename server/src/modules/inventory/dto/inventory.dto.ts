import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, IsEnum, IsString, Min } from 'class-validator';
import { InventoryTrackingType } from '@common/enums';

export class UpdateInventoryDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ enum: InventoryTrackingType })
  @IsOptional()
  @IsEnum(InventoryTrackingType)
  trackingType?: InventoryTrackingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;
}

export class AdjustInventoryDto {
  @ApiProperty({ example: 10, description: 'Positive to add, negative to subtract' })
  @IsNumber()
  adjustment: number;

  @ApiProperty({ example: 'Restock from supplier' })
  @IsString()
  reason: string;
}

export class ReserveInventoryDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
