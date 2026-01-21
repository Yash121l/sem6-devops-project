import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsNumber,
    IsString,
    IsEnum,
    IsOptional,
    Min,
    MaxLength,
} from 'class-validator';
import { PaymentMethod } from '@common/enums';

export class CreatePaymentDto {
    @ApiProperty()
    @IsUUID()
    orderId: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiPropertyOptional({ default: 'stripe' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    provider?: string;
}

export class ProcessPaymentDto {
    @ApiProperty()
    @IsString()
    paymentToken: string;

    @ApiPropertyOptional()
    @IsOptional()
    metadata?: Record<string, unknown>;
}

export class RefundPaymentDto {
    @ApiPropertyOptional({ description: 'Amount to refund, leave empty for full refund' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    amount?: number;

    @ApiProperty()
    @IsString()
    @MaxLength(500)
    reason: string;
}
