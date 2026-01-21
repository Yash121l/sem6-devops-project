import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
    CreateOrderDto,
    UpdateOrderStatusDto,
    CancelOrderDto,
    OrderFilterDto,
} from './dto/order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { generateOrderNumber } from '@common/utils/string.util';
import { OrderStatus, PaymentStatus, UserRole } from '@common/enums';
import { CartService } from '@modules/cart/cart.service';
import { InventoryService } from '@modules/inventory/inventory.service';
import { CouponsService } from '@modules/coupons/coupons.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    private readonly validTransitions: Map<OrderStatus, OrderStatus[]> = new Map([
        [OrderStatus.PENDING, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
        [OrderStatus.CONFIRMED, [OrderStatus.PROCESSING, OrderStatus.CANCELLED]],
        [OrderStatus.PROCESSING, [OrderStatus.SHIPPED, OrderStatus.CANCELLED]],
        [OrderStatus.SHIPPED, [OrderStatus.DELIVERED]],
        [OrderStatus.DELIVERED, []],
        [OrderStatus.CANCELLED, []],
    ]);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly dataSource: DataSource,
        private readonly cartService: CartService,
        private readonly inventoryService: InventoryService,
        private readonly couponsService: CouponsService,
    ) { }

    async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get user's cart
            const cart = await this.cartService.getOrCreateCart(userId);

            if (!cart.items || cart.items.length === 0) {
                throw new BadRequestException('Cart is empty');
            }

            // Reserve inventory for all items
            for (const item of cart.items) {
                const reserved = await this.inventoryService.reserve(
                    item.variantId,
                    item.quantity,
                );

                if (!reserved) {
                    throw new BadRequestException(
                        `Insufficient stock for ${item.product.name}`,
                    );
                }
            }

            // Create order
            const order = queryRunner.manager.create(Order, {
                userId,
                orderNumber: generateOrderNumber(),
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                subtotal: cart.subtotal,
                discountAmount: cart.discountAmount,
                taxAmount: cart.taxAmount,
                shippingAmount: 0,
                total: cart.total,
                couponId: cart.couponId,
                billingAddress: createOrderDto.billingAddress,
                shippingAddress: createOrderDto.shippingAddress,
                notes: createOrderDto.notes,
                placedAt: new Date(),
            });

            const savedOrder = await queryRunner.manager.save(order);

            // Create order items
            const orderItems = cart.items.map((cartItem) =>
                queryRunner.manager.create(OrderItem, {
                    orderId: savedOrder.id,
                    productId: cartItem.productId,
                    variantId: cartItem.variantId,
                    sku: cartItem.variant.sku,
                    productName: cartItem.product.name,
                    variantName: cartItem.variant.name,
                    quantity: cartItem.quantity,
                    unitPrice: cartItem.unitPrice,
                    totalPrice: cartItem.totalPrice,
                    productSnapshot: {
                        name: cartItem.product.name,
                        sku: cartItem.product.sku,
                        description: cartItem.product.description,
                        images: cartItem.product.images,
                    },
                }),
            );

            await queryRunner.manager.save(orderItems);

            // Increment coupon usage if applicable
            if (cart.couponId) {
                await this.couponsService.incrementUsage(cart.couponId);
            }

            // Clear cart
            await this.cartService.clearCart(userId);

            await queryRunner.commitTransaction();

            return this.findOne(savedOrder.id, userId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(
        paginationDto: PaginationDto,
        filterDto?: OrderFilterDto,
    ): Promise<PaginatedResult<Order>> {
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.items', 'items');

        if (filterDto?.status) {
            queryBuilder.andWhere('order.status = :status', { status: filterDto.status });
        }

        if (filterDto?.search) {
            queryBuilder.andWhere(
                '(order.orderNumber ILIKE :search OR user.email ILIKE :search)',
                { search: `%${filterDto.search}%` },
            );
        }

        queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .skip(paginationDto.skip)
            .take(paginationDto.limit);

        const [orders, total] = await queryBuilder.getManyAndCount();

        return paginate(orders, total, paginationDto.page, paginationDto.limit);
    }

    async findByUser(
        userId: string,
        paginationDto: PaginationDto,
    ): Promise<PaginatedResult<Order>> {
        const [orders, total] = await this.orderRepository.findAndCount({
            where: { userId },
            relations: ['items'],
            skip: paginationDto.skip,
            take: paginationDto.limit,
            order: { createdAt: 'DESC' },
        });

        return paginate(orders, total, paginationDto.page, paginationDto.limit);
    }

    async findOne(id: string, userId?: string, userRole?: UserRole): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'user', 'payments', 'coupon'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check ownership if user is a customer
        if (userId && userRole === UserRole.CUSTOMER && order.userId !== userId) {
            throw new ForbiddenException('You do not have access to this order');
        }

        return order;
    }

    async findByOrderNumber(orderNumber: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { orderNumber },
            relations: ['items', 'user', 'payments'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async updateStatus(
        id: string,
        updateStatusDto: UpdateOrderStatusDto,
    ): Promise<Order> {
        const order = await this.findOne(id);

        const allowedTransitions = this.validTransitions.get(order.status);

        if (!allowedTransitions?.includes(updateStatusDto.status)) {
            throw new BadRequestException(
                `Cannot transition from ${order.status} to ${updateStatusDto.status}`,
            );
        }

        order.status = updateStatusDto.status;

        if (updateStatusDto.internalNotes) {
            order.internalNotes = updateStatusDto.internalNotes;
        }

        // Update timestamps based on status
        switch (updateStatusDto.status) {
            case OrderStatus.CONFIRMED:
                // Commit inventory
                for (const item of order.items) {
                    if (item.variantId) {
                        await this.inventoryService.commit(item.variantId, item.quantity);
                    }
                }
                break;
            case OrderStatus.SHIPPED:
                order.shippedAt = new Date();
                break;
            case OrderStatus.DELIVERED:
                order.deliveredAt = new Date();
                break;
        }

        return this.orderRepository.save(order);
    }

    async cancel(id: string, cancelDto: CancelOrderDto, userId?: string): Promise<Order> {
        const order = await this.findOne(id);

        // Check if user owns the order (for customer cancellation)
        if (userId && order.userId !== userId) {
            throw new ForbiddenException('You cannot cancel this order');
        }

        const allowedTransitions = this.validTransitions.get(order.status);

        if (!allowedTransitions?.includes(OrderStatus.CANCELLED)) {
            throw new BadRequestException(
                `Cannot cancel order in ${order.status} status`,
            );
        }

        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.cancellationReason = cancelDto.reason;

        // Release inventory
        for (const item of order.items) {
            if (item.variantId) {
                await this.inventoryService.release(item.variantId, item.quantity);
            }
        }

        this.logger.log(`Order ${order.orderNumber} cancelled: ${cancelDto.reason}`);

        return this.orderRepository.save(order);
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
        const order = await this.findOne(id);

        order.paymentStatus = paymentStatus;

        // Auto-confirm order when payment is completed
        if (
            paymentStatus === PaymentStatus.COMPLETED &&
            order.status === OrderStatus.PENDING
        ) {
            order.status = OrderStatus.CONFIRMED;
        }

        return this.orderRepository.save(order);
    }
}
