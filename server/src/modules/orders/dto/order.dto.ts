import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsEnum,
    IsObject,
    ValidateNested,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@common/enums';

export class AddressDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    firstName: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    lastName: string;

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    address1: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    address2?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    city: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    state: string;

    @ApiProperty()
    @IsString()
    @MaxLength(20)
    postalCode: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;
}

export class CreateOrderDto {
    @ApiProperty({ type: AddressDto })
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    billingAddress: AddressDto;

    @ApiProperty({ type: AddressDto })
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    shippingAddress: AddressDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus })
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    internalNotes?: string;
}

export class CancelOrderDto {
    @ApiProperty()
    @IsString()
    @MaxLength(500)
    reason: string;
}

export class OrderFilterDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
