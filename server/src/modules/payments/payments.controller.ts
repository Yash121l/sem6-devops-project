import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
    RawBodyRequest,
    Req,
    Headers,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
    CreatePaymentDto,
    ProcessPaymentDto,
    RefundPaymentDto,
} from './dto/payment.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { UserRole } from '@common/enums';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Payment initiated')
    @ApiOperation({ summary: 'Create payment for order' })
    @ApiResponse({ status: 201, description: 'Payment initiated' })
    async create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }

    @Post(':id/process')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Payment processed')
    @ApiOperation({ summary: 'Process payment' })
    @ApiResponse({ status: 200, description: 'Payment processed' })
    async process(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() processDto: ProcessPaymentDto,
    ) {
        return this.paymentsService.process(id, processDto);
    }

    @Post(':id/refund')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Payment refunded')
    @ApiOperation({ summary: 'Refund payment (Admin)' })
    @ApiResponse({ status: 200, description: 'Payment refunded' })
    async refund(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() refundDto: RefundPaymentDto,
    ) {
        return this.paymentsService.refund(id, refundDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Payments retrieved successfully')
    @ApiOperation({ summary: 'Get all payments (Admin)' })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.paymentsService.findAll(paginationDto);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ResponseMessage('Payment retrieved successfully')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.findOne(id);
    }

    @Post('webhook/:provider')
    @Public()
    @ApiOperation({ summary: 'Payment provider webhook' })
    @ApiResponse({ status: 200, description: 'Webhook processed' })
    async handleWebhook(
        @Param('provider') provider: string,
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') stripeSignature: string,
    ) {
        const payload = req.body;
        await this.paymentsService.handleWebhook(provider, payload as Record<string, unknown>);
        return { received: true };
    }
}
