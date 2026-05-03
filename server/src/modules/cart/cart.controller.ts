import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, ApplyCouponDto } from './dto/cart.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@ApiTags('cart')
/** Higher limit: guest traffic often shares one NAT/LB IP; trust proxy must be enabled in main.ts. */
@Throttle({ default: { limit: 2000, ttl: 60_000 } })
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @ResponseMessage('Cart retrieved successfully')
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.getOrCreateCart(user?.id, sessionId);
  }

  @Post('items')
  @Public()
  @ResponseMessage('Item added to cart')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart' })
  async addItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
    @Body() addToCartDto: AddToCartDto,
  ) {
    if (!user?.id && !(sessionId && sessionId.trim())) {
      throw new BadRequestException('Missing x-session-id header for guest cart');
    }
    return this.cartService.addItem(user?.id, sessionId?.trim(), addToCartDto);
  }

  @Put('items/:itemId')
  @Public()
  @ResponseMessage('Cart item updated')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  async updateItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user?.id, sessionId, itemId, updateDto);
  }

  @Delete('items/:itemId')
  @Public()
  @ResponseMessage('Item removed from cart')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  async removeItem(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(user?.id, sessionId, itemId);
  }

  @Delete()
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Cart cleared')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 204, description: 'Cart cleared' })
  async clearCart(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
  ) {
    await this.cartService.clearCart(user?.id, sessionId);
  }

  @Post('coupon')
  @Public()
  @ResponseMessage('Coupon applied successfully')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  async applyCoupon(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
    @Body() applyCouponDto: ApplyCouponDto,
  ) {
    return this.cartService.applyCoupon(user?.id, sessionId, applyCouponDto.code);
  }

  @Delete('coupon')
  @Public()
  @ResponseMessage('Coupon removed')
  @ApiOperation({ summary: 'Remove coupon from cart' })
  @ApiResponse({ status: 200, description: 'Coupon removed' })
  async removeCoupon(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.removeCoupon(user?.id, sessionId);
  }

  @Post('migrate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Cart migrated successfully')
  @ApiOperation({ summary: 'Migrate guest cart to user' })
  @ApiResponse({ status: 200, description: 'Cart migrated successfully' })
  async migrateCart(
    @CurrentUser() user: AuthenticatedUser,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.migrateGuestCart(sessionId, user.id);
  }
}
