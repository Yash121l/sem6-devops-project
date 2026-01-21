import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { DiscountType } from '@common/enums';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private readonly couponRepository: Repository<Coupon>,
    ) { }

    async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
        const existingCoupon = await this.couponRepository.findOne({
            where: { code: createCouponDto.code.toUpperCase() },
        });

        if (existingCoupon) {
            throw new ConflictException('Coupon with this code already exists');
        }

        const coupon = this.couponRepository.create({
            ...createCouponDto,
            code: createCouponDto.code.toUpperCase(),
        });

        return this.couponRepository.save(coupon);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Coupon>> {
        const [coupons, total] = await this.couponRepository.findAndCount({
            skip: paginationDto.skip,
            take: paginationDto.limit,
            order: { createdAt: 'DESC' },
        });

        return paginate(coupons, total, paginationDto.page, paginationDto.limit);
    }

    async findOne(id: string): Promise<Coupon> {
        const coupon = await this.couponRepository.findOne({ where: { id } });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async findByCode(code: string): Promise<Coupon> {
        const coupon = await this.couponRepository.findOne({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        return coupon;
    }

    async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
        const coupon = await this.findOne(id);

        if (updateCouponDto.code && updateCouponDto.code !== coupon.code) {
            const existingCoupon = await this.couponRepository.findOne({
                where: { code: updateCouponDto.code.toUpperCase() },
            });

            if (existingCoupon) {
                throw new ConflictException('Coupon with this code already exists');
            }

            updateCouponDto.code = updateCouponDto.code.toUpperCase();
        }

        Object.assign(coupon, updateCouponDto);

        return this.couponRepository.save(coupon);
    }

    async remove(id: string): Promise<void> {
        const coupon = await this.findOne(id);
        await this.couponRepository.softRemove(coupon);
    }

    async validateAndGet(
        code: string,
        subtotal: number,
        userId?: string,
    ): Promise<Coupon> {
        const coupon = await this.findByCode(code);

        // Check if active
        if (!coupon.isActive) {
            throw new BadRequestException('This coupon is no longer active');
        }

        // Check date validity
        const now = new Date();

        if (coupon.startsAt && coupon.startsAt > now) {
            throw new BadRequestException('This coupon is not yet valid');
        }

        if (coupon.expiresAt && coupon.expiresAt < now) {
            throw new BadRequestException('This coupon has expired');
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('This coupon has reached its usage limit');
        }

        // Check minimum purchase
        if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
            throw new BadRequestException(
                `Minimum purchase of $${coupon.minPurchaseAmount} required for this coupon`,
            );
        }

        // TODO: Check per-user limit if userId provided
        // This would require tracking coupon usage per user

        return coupon;
    }

    calculateDiscount(coupon: Coupon, subtotal: number): number {
        let discount: number;

        if (coupon.discountType === DiscountType.PERCENTAGE) {
            discount = (subtotal * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        // Apply max discount cap
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }

        // Ensure discount doesn't exceed subtotal
        if (discount > subtotal) {
            discount = subtotal;
        }

        return Math.round(discount * 100) / 100;
    }

    async incrementUsage(couponId: string): Promise<void> {
        await this.couponRepository.increment({ id: couponId }, 'usageCount', 1);
    }
}
