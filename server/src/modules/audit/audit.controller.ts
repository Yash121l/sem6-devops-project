import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLogFilterDto } from './dto/audit.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('audit')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ResponseMessage('Audit logs retrieved successfully')
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto, @Query() filterDto: AuditLogFilterDto) {
    return this.auditService.findAll(paginationDto, filterDto);
  }
}
