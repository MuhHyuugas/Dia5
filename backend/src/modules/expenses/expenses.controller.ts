import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createExpense(@Request() req: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(req.user.userId, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateExpense(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.updateExpense(req.user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteExpense(@Request() req: any, @Param('id') id: string) {
    return this.expensesService.deleteExpense(req.user.userId, id);
  }

  @Get('group/:groupId/balance')
  async getGroupBalance(@Request() req: any, @Param('groupId') groupId: string) {
    return this.expensesService.getGroupBalance(req.user.userId, groupId);
  }
}
