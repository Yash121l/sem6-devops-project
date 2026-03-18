import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto, AdjustInventoryDto } from './dto/inventory.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { InventoryTrackingType } from '@common/enums';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Inventory>> {
    const [items, total] = await this.inventoryRepository.findAndCount({
      relations: ['variant', 'variant.product'],
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { updatedAt: 'DESC' },
    });

    return paginate(items, total, paginationDto.page, paginationDto.limit);
  }

  async findByVariant(variantId: string): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { variantId },
      relations: ['variant', 'variant.product'],
    });

    if (!inventory) {
      // Create inventory record if it doesn't exist
      inventory = this.inventoryRepository.create({
        variantId,
        quantity: 0,
        reservedQuantity: 0,
      });
      inventory = await this.inventoryRepository.save(inventory);
    }

    return inventory;
  }

  async update(variantId: string, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVariant(variantId);

    Object.assign(inventory, updateDto);

    if (updateDto.quantity !== undefined) {
      inventory.lastRestockedAt = new Date();
    }

    return this.inventoryRepository.save(inventory);
  }

  async adjust(variantId: string, adjustDto: AdjustInventoryDto): Promise<Inventory> {
    const inventory = await this.findByVariant(variantId);

    const newQuantity = inventory.quantity + adjustDto.adjustment;

    if (newQuantity < 0) {
      throw new BadRequestException('Adjustment would result in negative inventory');
    }

    inventory.quantity = newQuantity;

    if (adjustDto.adjustment > 0) {
      inventory.lastRestockedAt = new Date();
    }

    this.logger.log(
      `Inventory adjusted for variant ${variantId}: ${adjustDto.adjustment} (${adjustDto.reason})`,
    );

    return this.inventoryRepository.save(inventory);
  }

  async reserve(variantId: string, quantity: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { variantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      if (inventory.trackingType === InventoryTrackingType.NO_TRACK) {
        await queryRunner.commitTransaction();
        return true;
      }

      const availableQuantity = inventory.quantity - inventory.reservedQuantity;

      if (availableQuantity < quantity && !inventory.allowBackorder) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      inventory.reservedQuantity += quantity;
      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async release(variantId: string, quantity: number): Promise<void> {
    const inventory = await this.findByVariant(variantId);

    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

    await this.inventoryRepository.save(inventory);
  }

  async commit(variantId: string, quantity: number): Promise<void> {
    const inventory = await this.findByVariant(variantId);

    if (inventory.trackingType === InventoryTrackingType.TRACK) {
      inventory.quantity = Math.max(0, inventory.quantity - quantity);
    }
    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

    await this.inventoryRepository.save(inventory);
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.variant', 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('inventory.tracking_type = :trackingType', {
        trackingType: InventoryTrackingType.TRACK,
      })
      .andWhere('inventory.quantity - inventory.reserved_quantity <= inventory.low_stock_threshold')
      .getMany();
  }

  async checkAvailability(variantId: string, quantity: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    });

    if (!inventory) {
      return false;
    }

    if (inventory.trackingType === InventoryTrackingType.NO_TRACK) {
      return true;
    }

    const availableQuantity = inventory.quantity - inventory.reservedQuantity;

    return availableQuantity >= quantity || inventory.allowBackorder;
  }
}
