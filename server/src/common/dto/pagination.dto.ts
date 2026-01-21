import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { API_CONSTANTS } from '@common/constants';

export class PaginationDto {
    @ApiProperty({
        required: false,
        default: 1,
        minimum: 1,
        description: 'Page number',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = API_CONSTANTS.DEFAULT_PAGE;

    @ApiProperty({
        required: false,
        default: 20,
        minimum: 1,
        maximum: 100,
        description: 'Number of items per page',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(API_CONSTANTS.MAX_LIMIT)
    limit: number = API_CONSTANTS.DEFAULT_LIMIT;

    get skip(): number {
        return (this.page - 1) * this.limit;
    }
}
