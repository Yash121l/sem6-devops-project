import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import {
    CreatePaymentDto,
    ProcessPaymentDto,
    RefundPaymentDto,
} from './dto/payment.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { generateTransactionId } from '@common/utils/string.util';
import { PaymentStatus } from '@common/enums';
import { OrdersService } from '@modules/orders/orders.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly ordersService: OrdersService,
    ) { }

    async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const order = await this.ordersService.findOne(createPaymentDto.orderId);

        if (order.paymentStatus === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Order is already paid');
        }

        const payment = this.paymentRepository.create({
            orderId: createPaymentDto.orderId,
            transactionId: generateTransactionId(),
            provider: createPaymentDto.provider || 'stripe',
            method: createPaymentDto.method,
            amount: order.total,
            currency: 'USD',
            status: PaymentStatus.PENDING,
        });

        return this.paymentRepository.save(payment);
    }

    async process(
        paymentId: string,
        processDto: ProcessPaymentDto,
    ): Promise<Payment> {
        const payment = await this.findOne(paymentId);

        if (payment.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Payment is not in pending status');
        }

        payment.status = PaymentStatus.PROCESSING;
        await this.paymentRepository.save(payment);

        try {
            // Simulate payment processing
            // In production, integrate with Stripe, PayPal, etc.
            const success = await this.processWithProvider(payment, processDto);

            if (success) {
                payment.status = PaymentStatus.COMPLETED;
                payment.paidAt = new Date();
                payment.providerResponse = { success: true, token: processDto.paymentToken };

                await this.paymentRepository.save(payment);

                // Update order payment status
                await this.ordersService.updatePaymentStatus(
                    payment.orderId,
                    PaymentStatus.COMPLETED,
                );

                this.logger.log(`Payment ${payment.transactionId} completed successfully`);
            } else {
                throw new Error('Payment processing failed');
            }

            return payment;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            payment.status = PaymentStatus.FAILED;
            payment.failureReason = errorMessage;
            await this.paymentRepository.save(payment);

            this.logger.error(`Payment ${payment.transactionId} failed: ${errorMessage}`);

            throw new BadRequestException('Payment processing failed');
        }
    }

    async refund(paymentId: string, refundDto: RefundPaymentDto): Promise<Payment> {
        const payment = await this.findOne(paymentId);

        if (payment.status !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Can only refund completed payments');
        }

        const refundAmount = refundDto.amount || payment.amount;

        if (refundAmount > payment.amount) {
            throw new BadRequestException('Refund amount exceeds payment amount');
        }

        // Simulate refund processing
        payment.status = refundAmount === payment.amount
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PARTIALLY_REFUNDED;
        payment.refundedAt = new Date();
        payment.providerResponse = {
            ...payment.providerResponse,
            refund: {
                amount: refundAmount,
                reason: refundDto.reason,
            },
        };

        await this.paymentRepository.save(payment);

        // Update order payment status
        await this.ordersService.updatePaymentStatus(payment.orderId, payment.status);

        this.logger.log(
            `Payment ${payment.transactionId} refunded: ${refundAmount} - ${refundDto.reason}`,
        );

        return payment;
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Payment>> {
        const [payments, total] = await this.paymentRepository.findAndCount({
            relations: ['order'],
            skip: paginationDto.skip,
            take: paginationDto.limit,
            order: { createdAt: 'DESC' },
        });

        return paginate(payments, total, paginationDto.page, paginationDto.limit);
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['order'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async findByOrder(orderId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: { orderId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByTransactionId(transactionId: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { transactionId },
            relations: ['order'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    private async processWithProvider(
        payment: Payment,
        processDto: ProcessPaymentDto,
    ): Promise<boolean> {
        // This is a mock implementation
        // In production, integrate with actual payment providers

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulate 95% success rate
        return Math.random() > 0.05;
    }

    async handleWebhook(
        provider: string,
        payload: Record<string, unknown>,
    ): Promise<void> {
        // Handle webhook events from payment providers
        this.logger.log(`Received webhook from ${provider}`);

        // Implementation depends on the payment provider
        // Stripe: Handle checkout.session.completed, payment_intent.succeeded, etc.
        // PayPal: Handle PAYMENT.CAPTURE.COMPLETED, etc.
    }
}
