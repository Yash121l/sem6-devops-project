import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
    CreateUserDto,
    UpdateUserDto,
    UpdatePasswordDto,
    AdminUpdateUserDto,
    UpdateUserRoleDto,
} from './dto/user.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ResponseMessage('User created successfully')
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ResponseMessage('Users retrieved successfully')
    @ApiOperation({ summary: 'Get all users with pagination' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.usersService.findAll(paginationDto);
    }

    @Get('me')
    @ResponseMessage('Profile retrieved successfully')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.findOne(user.id);
    }

    @Put('me')
    @ResponseMessage('Profile updated successfully')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(user.id, updateUserDto);
    }

    @Put('me/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Password updated successfully')
    @ApiOperation({ summary: 'Update current user password' })
    @ApiResponse({ status: 204, description: 'Password updated successfully' })
    async updatePassword(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        await this.usersService.updatePassword(user.id, updatePasswordDto);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ResponseMessage('User retrieved successfully')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ResponseMessage('User updated successfully')
    @ApiOperation({ summary: 'Update user (Admin only)' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() adminUpdateDto: AdminUpdateUserDto,
    ) {
        return this.usersService.adminUpdate(id, adminUpdateDto);
    }

    @Put(':id/role')
    @Roles(UserRole.SUPER_ADMIN)
    @ResponseMessage('User role updated successfully')
    @ApiOperation({ summary: 'Update user role (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'User role updated successfully' })
    async updateRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateRoleDto: UpdateUserRoleDto,
    ) {
        return this.usersService.adminUpdate(id, { role: updateRoleDto.role });
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('User deleted successfully')
    @ApiOperation({ summary: 'Delete user (soft delete)' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.usersService.remove(id);
    }

    @Post(':id/deactivate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('User deactivated successfully')
    @ApiOperation({ summary: 'Deactivate user account' })
    @ApiResponse({ status: 204, description: 'User deactivated successfully' })
    async deactivate(@Param('id', ParseUUIDPipe) id: string) {
        await this.usersService.deactivate(id);
    }
}
