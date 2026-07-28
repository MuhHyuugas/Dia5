import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('balance/global/:friendId')
  async getGlobalBalance(@Request() req: any, @Param('friendId') friendId: string) {
    return this.paymentsService.getGlobalBalance(req.user.userId, friendId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async settleDebt(@Request() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.settleDebt(req.user.userId, dto);
  }
}
