import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import {
    CreateUserDto,
    UpdateUserDto,
    UpdatePasswordDto,
    AdminUpdateUserDto,
} from './dto/user.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { paginate, PaginatedResult } from '@common/utils/pagination.util';
import { UserRole } from '@common/enums';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
        const passwordHash = await bcrypt.hash(createUserDto.password, bcryptRounds);

        const user = this.userRepository.create({
            ...createUserDto,
            email: createUserDto.email.toLowerCase(),
            passwordHash,
            role: createUserDto.role || UserRole.CUSTOMER,
        });

        return this.userRepository.save(user);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
        const [users, total] = await this.userRepository.findAndCount({
            skip: paginationDto.skip,
            take: paginationDto.limit,
            order: { createdAt: 'DESC' },
        });

        return paginate(users, total, paginationDto.page, paginationDto.limit);
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        Object.assign(user, updateUserDto);

        return this.userRepository.save(user);
    }

    async adminUpdate(id: string, adminUpdateDto: AdminUpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        Object.assign(user, adminUpdateDto);

        return this.userRepository.save(user);
    }

    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'passwordHash'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            updatePasswordDto.currentPassword,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        const bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
        const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, bcryptRounds);

        await this.userRepository.update(id, { passwordHash: newPasswordHash });
    }

    async updateLastLogin(id: string): Promise<void> {
        await this.userRepository.update(id, { lastLoginAt: new Date() });
    }

    async verifyEmail(id: string): Promise<void> {
        await this.userRepository.update(id, {
            isVerified: true,
            emailVerifiedAt: new Date(),
        });
    }

    async deactivate(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.softRemove(user);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            select: ['id', 'email', 'passwordHash', 'role', 'isActive', 'firstName', 'lastName'],
        });

        if (!user || !user.isActive) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }
}
