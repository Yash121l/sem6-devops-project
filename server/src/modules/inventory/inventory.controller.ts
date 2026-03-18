import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto, AdjustInventoryDto } from './dto/inventory.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Inventory retrieved successfully')
  @ApiOperation({ summary: 'Get all inventory' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryService.findAll(paginationDto);
  }

  @Get('low-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Low stock items retrieved successfully')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  async getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get(':variantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Inventory retrieved successfully')
  @ApiOperation({ summary: 'Get inventory by variant ID' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  async findByVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.inventoryService.findByVariant(variantId);
  }

  @Put(':variantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Inventory updated successfully')
  @ApiOperation({ summary: 'Update inventory' })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  async update(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(variantId, updateDto);
  }

  @Post(':variantId/adjust')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Inventory adjusted successfully')
  @ApiOperation({ summary: 'Adjust inventory quantity' })
  @ApiResponse({ status: 200, description: 'Inventory adjusted successfully' })
  async adjust(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() adjustDto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjust(variantId, adjustDto);
  }
}
