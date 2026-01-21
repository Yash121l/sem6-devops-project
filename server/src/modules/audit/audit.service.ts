import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogFilterDto } from './dto/audit.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { AuditAction } from '@common/enums';

export interface CreateAuditLogDto {
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    async log(data: CreateAuditLogDto): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            userId: data.userId || null,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId || null,
            oldValues: data.oldValues || null,
            newValues: data.newValues || null,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent?.substring(0, 500) || null,
            requestId: data.requestId || null,
        });

        const saved = await this.auditLogRepository.save(auditLog);

        this.logger.debug(
            `Audit: ${data.action} on ${data.entityType} by user ${data.userId || 'anonymous'}`,
        );

        return saved;
    }

    async findAll(
        paginationDto: PaginationDto,
        filterDto?: AuditLogFilterDto,
    ): Promise<PaginatedResult<AuditLog>> {
        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user');

        if (filterDto?.userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId: filterDto.userId });
        }

        if (filterDto?.action) {
            queryBuilder.andWhere('audit.action = :action', { action: filterDto.action });
        }

        if (filterDto?.entityType) {
            queryBuilder.andWhere('audit.entityType = :entityType', {
                entityType: filterDto.entityType,
            });
        }

        if (filterDto?.entityId) {
            queryBuilder.andWhere('audit.entityId = :entityId', {
                entityId: filterDto.entityId,
            });
        }

        if (filterDto?.startDate && filterDto?.endDate) {
            queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
                startDate: filterDto.startDate,
                endDate: filterDto.endDate,
            });
        } else if (filterDto?.startDate) {
            queryBuilder.andWhere('audit.createdAt >= :startDate', {
                startDate: filterDto.startDate,
            });
        } else if (filterDto?.endDate) {
            queryBuilder.andWhere('audit.createdAt <= :endDate', {
                endDate: filterDto.endDate,
            });
        }

        queryBuilder
            .orderBy('audit.createdAt', 'DESC')
            .skip(paginationDto.skip)
            .take(paginationDto.limit);

        const [logs, total] = await queryBuilder.getManyAndCount();

        return paginate(logs, total, paginationDto.page, paginationDto.limit);
    }

    async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}
