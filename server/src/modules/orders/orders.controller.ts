import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  GuestCheckoutDto,
  GuestOrderConfirmationQueryDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  OrderFilterDto,
} from './dto/order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ResponseMessage('Order placed successfully')
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Post('guest-checkout')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ResponseMessage('Guest order placed successfully')
  @ApiOperation({ summary: 'Guest checkout from session cart (requires x-session-id)' })
  @ApiResponse({ status: 201, description: 'Guest order placed successfully' })
  async guestCheckout(
    @Headers('x-session-id') sessionId: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() dto: GuestCheckoutDto,
  ) {
    return this.ordersService.guestCheckout(sessionId, dto, idempotencyKey?.trim() || undefined);
  }

  @Get('guest-confirmation')
  @Public()
  @ResponseMessage('Order confirmation retrieved')
  @ApiOperation({ summary: 'Public order summary for guest confirmation (orderNumber + token)' })
  async guestConfirmation(@Query() query: GuestOrderConfirmationQueryDto) {
    return this.ordersService.findGuestOrderConfirmation(query);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Orders retrieved successfully')
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto, @Query() filterDto: OrderFilterDto) {
    return this.ordersService.findAll(paginationDto, filterDto);
  }

  @Get('my-orders')
  @ResponseMessage('Your orders retrieved successfully')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findMyOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByUser(user.id, paginationDto);
  }

  @Get(':id')
  @ResponseMessage('Order retrieved successfully')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findOne(id, user.id, user.role as UserRole);
  }

  @Put(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ResponseMessage('Order status updated')
  @ApiOperation({ summary: 'Update order status (Admin)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/cancel')
  @ResponseMessage('Order cancelled')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(id, cancelDto, user.id);
  }
}
