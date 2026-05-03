import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  MaxLength,
  IsEmail,
  Matches,
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

  @ApiPropertyOptional({ description: 'Contact email for this address (e.g. shipping notices)' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
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

/** Guest checkout: same addresses as authenticated checkout plus confirmation email. */
export class GuestCheckoutDto extends CreateOrderDto {
  @ApiProperty({ example: 'buyer@example.com' })
  @IsEmail()
  @MaxLength(255)
  customerEmail: string;
}

export class GuestOrderConfirmationQueryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  orderNumber: string;

  @ApiProperty({ description: 'Secret token returned from guest checkout' })
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-f0-9]{64}$/i, { message: 'Invalid confirmation token' })
  token: string;
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
