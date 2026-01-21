import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '@modules/products/products.service';
import { InventoryService } from '@modules/inventory/inventory.service';
import { CouponsService } from '@modules/coupons/coupons.service';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        private readonly productsService: ProductsService,
        private readonly inventoryService: InventoryService,
        private readonly couponsService: CouponsService,
    ) { }

    async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
        let cart: Cart | null = null;

        if (userId) {
            cart = await this.cartRepository.findOne({
                where: { userId },
                relations: ['items', 'items.product', 'items.variant', 'coupon'],
            });
        } else if (sessionId) {
            cart = await this.cartRepository.findOne({
                where: { sessionId },
                relations: ['items', 'items.product', 'items.variant', 'coupon'],
            });
        }

        if (!cart) {
            cart = this.cartRepository.create({
                userId: userId || null,
                sessionId: userId ? null : sessionId,
                items: [],
            });
            cart = await this.cartRepository.save(cart);
        }

        return cart;
    }

    async addItem(
        userId: string | undefined,
        sessionId: string | undefined,
        addToCartDto: AddToCartDto,
    ): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        // Verify product and variant exist
        const variant = await this.productsService.findVariant(addToCartDto.variantId);

        if (variant.productId !== addToCartDto.productId) {
            throw new BadRequestException('Variant does not belong to the specified product');
        }

        // Check inventory availability
        const isAvailable = await this.inventoryService.checkAvailability(
            addToCartDto.variantId,
            addToCartDto.quantity,
        );

        if (!isAvailable) {
            throw new BadRequestException('Insufficient stock available');
        }

        // Check if item already exists in cart
        let cartItem = await this.cartItemRepository.findOne({
            where: { cartId: cart.id, variantId: addToCartDto.variantId },
        });

        if (cartItem) {
            cartItem.quantity += addToCartDto.quantity;
            cartItem.totalPrice = cartItem.unitPrice * cartItem.quantity;
        } else {
            cartItem = this.cartItemRepository.create({
                cartId: cart.id,
                productId: addToCartDto.productId,
                variantId: addToCartDto.variantId,
                quantity: addToCartDto.quantity,
                unitPrice: variant.price,
                totalPrice: variant.price * addToCartDto.quantity,
                metadata: addToCartDto.metadata,
            });
        }

        await this.cartItemRepository.save(cartItem);

        return this.recalculateCart(cart.id);
    }

    async updateItem(
        userId: string | undefined,
        sessionId: string | undefined,
        itemId: string,
        updateDto: UpdateCartItemDto,
    ): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        const cartItem = await this.cartItemRepository.findOne({
            where: { id: itemId, cartId: cart.id },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (updateDto.quantity === 0) {
            await this.cartItemRepository.remove(cartItem);
        } else {
            // Check inventory availability
            const isAvailable = await this.inventoryService.checkAvailability(
                cartItem.variantId,
                updateDto.quantity,
            );

            if (!isAvailable) {
                throw new BadRequestException('Insufficient stock available');
            }

            cartItem.quantity = updateDto.quantity;
            cartItem.totalPrice = cartItem.unitPrice * updateDto.quantity;
            await this.cartItemRepository.save(cartItem);
        }

        return this.recalculateCart(cart.id);
    }

    async removeItem(
        userId: string | undefined,
        sessionId: string | undefined,
        itemId: string,
    ): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        const cartItem = await this.cartItemRepository.findOne({
            where: { id: itemId, cartId: cart.id },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartItemRepository.remove(cartItem);

        return this.recalculateCart(cart.id);
    }

    async clearCart(userId?: string, sessionId?: string): Promise<void> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        await this.cartItemRepository.delete({ cartId: cart.id });

        cart.subtotal = 0;
        cart.discountAmount = 0;
        cart.taxAmount = 0;
        cart.total = 0;
        cart.couponId = null;

        await this.cartRepository.save(cart);
    }

    async applyCoupon(
        userId: string | undefined,
        sessionId: string | undefined,
        code: string,
    ): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        if (cart.items.length === 0) {
            throw new BadRequestException('Cannot apply coupon to empty cart');
        }

        const coupon = await this.couponsService.validateAndGet(code, cart.subtotal, userId);

        cart.couponId = coupon.id;

        await this.cartRepository.save(cart);

        return this.recalculateCart(cart.id);
    }

    async removeCoupon(userId?: string, sessionId?: string): Promise<Cart> {
        const cart = await this.getOrCreateCart(userId, sessionId);

        cart.couponId = null;
        cart.discountAmount = 0;

        await this.cartRepository.save(cart);

        return this.recalculateCart(cart.id);
    }

    async migrateGuestCart(sessionId: string, userId: string): Promise<Cart> {
        const guestCart = await this.cartRepository.findOne({
            where: { sessionId },
            relations: ['items'],
        });

        if (!guestCart) {
            return this.getOrCreateCart(userId);
        }

        const userCart = await this.cartRepository.findOne({
            where: { userId },
            relations: ['items'],
        });

        if (userCart) {
            // Merge guest cart items into user cart
            for (const item of guestCart.items) {
                const existingItem = userCart.items.find(
                    (i) => i.variantId === item.variantId,
                );

                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
                    await this.cartItemRepository.save(existingItem);
                } else {
                    item.cartId = userCart.id;
                    await this.cartItemRepository.save(item);
                }
            }

            await this.cartRepository.remove(guestCart);
            return this.recalculateCart(userCart.id);
        } else {
            // Convert guest cart to user cart
            guestCart.userId = userId;
            guestCart.sessionId = null;
            await this.cartRepository.save(guestCart);
            return guestCart;
        }
    }

    private async recalculateCart(cartId: string): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { id: cartId },
            relations: ['items', 'items.product', 'items.variant', 'coupon'],
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Calculate subtotal
        cart.subtotal = cart.items.reduce(
            (sum, item) => sum + Number(item.totalPrice),
            0,
        );

        // Calculate discount
        if (cart.coupon) {
            cart.discountAmount = this.couponsService.calculateDiscount(
                cart.coupon,
                cart.subtotal,
            );
        } else {
            cart.discountAmount = 0;
        }

        // Calculate tax (simplified - 10%)
        const taxableAmount = cart.subtotal - cart.discountAmount;
        cart.taxAmount = taxableAmount * 0.1;

        // Calculate total
        cart.total = cart.subtotal - cart.discountAmount + cart.taxAmount;

        await this.cartRepository.save(cart);

        return cart;
    }
}
