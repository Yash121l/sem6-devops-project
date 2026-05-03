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
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { Payment } from '@modules/payments/entities/payment.entity';
import {
  CreateOrderDto,
  GuestCheckoutDto,
  GuestOrderConfirmationQueryDto,
  UpdateOrderStatusDto,
  CancelOrderDto,
  OrderFilterDto,
} from './dto/order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { generateOrderNumber, generateTransactionId, generateConfirmationToken } from '@common/utils/string.util';
import { OrderStatus, PaymentStatus, UserRole, PaymentMethod } from '@common/enums';
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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyKeyRepository: Repository<IdempotencyKey>,
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly couponsService: CouponsService,
  ) {}

  private async applySimulatedPayment(orderId: string, amount: number): Promise<void> {
    const payment = this.paymentRepository.create({
      orderId,
      transactionId: generateTransactionId(),
      provider: 'manual',
      method: PaymentMethod.MANUAL,
      amount,
      currency: 'USD',
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
      providerResponse: { simulated: true },
    });
    await this.paymentRepository.save(payment);
    await this.updatePaymentStatus(orderId, PaymentStatus.COMPLETED);
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    return this.createFromCart({
      userId,
      sessionId: undefined,
      dto: createOrderDto,
      customerEmail: null,
      confirmationToken: null,
      simulatePayment: false,
      idempotencyKey: undefined,
    });
  }

  /**
   * Place order from the DB cart (authenticated user or guest session).
   * Totals and shipping always come from {@link CartService.recalculateCart}.
   */
  async createFromCart(params: {
    userId?: string;
    sessionId?: string;
    dto: CreateOrderDto;
    customerEmail: string | null;
    confirmationToken: string | null;
    simulatePayment: boolean;
    idempotencyKey?: string;
  }): Promise<Order> {
    const {
      userId,
      sessionId,
      dto,
      customerEmail,
      confirmationToken,
      simulatePayment,
      idempotencyKey,
    } = params;

    if (!userId && !sessionId) {
      throw new BadRequestException('Cart identity is required');
    }
    if (userId && sessionId) {
      throw new BadRequestException('Provide either user or session cart identity, not both');
    }

    if (idempotencyKey) {
      const existingKey = await this.idempotencyKeyRepository.findOne({
        where: { key: idempotencyKey },
      });
      if (existingKey) {
        return this.findOne(existingKey.orderId, userId, userId ? UserRole.CUSTOMER : undefined);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let cart = await this.cartService.getOrCreateCart(userId, sessionId);
      cart = await this.cartService.recalculateCart(cart.id);

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      for (const item of cart.items) {
        const reserved = await this.inventoryService.reserve(item.variantId, item.quantity);

        if (!reserved) {
          throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
        }
      }

      const order = queryRunner.manager.create(Order, {
        userId: userId ?? null,
        customerEmail,
        confirmationToken,
        orderNumber: generateOrderNumber(),
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount,
        taxAmount: cart.taxAmount,
        shippingAmount: cart.shippingAmount ?? 0,
        total: cart.total,
        couponId: cart.couponId,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
        notes: dto.notes ?? null,
        placedAt: new Date(),
      });

      const savedOrder = await queryRunner.manager.save(order);

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

      if (cart.couponId) {
        await this.couponsService.incrementUsage(cart.couponId);
      }

      await this.cartService.clearCart(userId, sessionId);

      if (idempotencyKey) {
        await queryRunner.manager.save(
          queryRunner.manager.create(IdempotencyKey, {
            key: idempotencyKey,
            orderId: savedOrder.id,
          }),
        );
      }

      await queryRunner.commitTransaction();

      if (simulatePayment) {
        await this.applySimulatedPayment(savedOrder.id, Number(savedOrder.total));
      }

      return this.findOne(savedOrder.id, userId, userId ? UserRole.CUSTOMER : undefined);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async guestCheckout(
    sessionId: string | undefined,
    dto: GuestCheckoutDto,
    idempotencyKey?: string,
  ): Promise<{ orderNumber: string; confirmationToken: string; orderId: string }> {
    if (!sessionId?.trim()) {
      throw new BadRequestException('x-session-id header is required for guest checkout');
    }

    const confirmationToken = generateConfirmationToken();

    const order = await this.createFromCart({
      userId: undefined,
      sessionId: sessionId.trim(),
      dto,
      customerEmail: dto.customerEmail,
      confirmationToken,
      simulatePayment: true,
      idempotencyKey,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      confirmationToken: order.confirmationToken ?? confirmationToken,
    };
  }

  async findGuestOrderConfirmation(
    query: GuestOrderConfirmationQueryDto,
  ): Promise<Record<string, unknown>> {
    const order = await this.orderRepository.findOne({
      where: {
        orderNumber: query.orderNumber,
        confirmationToken: query.token,
      },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      total: order.total,
      customerEmail: order.customerEmail,
      placedAt: order.placedAt,
      items: order.items.map((line) => ({
        productName: line.productName,
        variantName: line.variantName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
      })),
    };
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
      queryBuilder.andWhere('(order.orderNumber ILIKE :search OR user.email ILIKE :search)', {
        search: `%${filterDto.search}%`,
      });
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(paginationDto.skip)
      .take(paginationDto.limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return paginate(orders, total, paginationDto.page, paginationDto.limit);
  }

  async findByUser(userId: string, paginationDto: PaginationDto): Promise<PaginatedResult<Order>> {
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

    if (userId && userRole === UserRole.CUSTOMER && order.userId && order.userId !== userId) {
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

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
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

    if (userId && order.userId && order.userId !== userId) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    const allowedTransitions = this.validTransitions.get(order.status);

    if (!allowedTransitions?.includes(OrderStatus.CANCELLED)) {
      throw new BadRequestException(`Cannot cancel order in ${order.status} status`);
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
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === PaymentStatus.COMPLETED && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
      for (const item of order.items) {
        if (item.variantId) {
          await this.inventoryService.commit(item.variantId, item.quantity);
        }
      }
    }

    return this.orderRepository.save(order);
  }
}
