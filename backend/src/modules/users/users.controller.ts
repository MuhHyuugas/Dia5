import { Controller, Get, Post, Put, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGuestUserDto } from './dto/create-guest.dto';
import { LinkShadowUserDto } from './dto/link-shadow.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('me')
  async updateProfile(@Request() req: any, @Body() body: { nome?: string; fotoUrl?: string }) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  @Post('guests')
  @HttpCode(HttpStatus.CREATED)
  async createGuest(@Request() req: any, @Body() dto: CreateGuestUserDto) {
    return this.usersService.createGuest(req.user.userId, dto);
  }

  @Post('link-shadow')
  @HttpCode(HttpStatus.OK)
  async linkShadowUser(@Request() req: any, @Body() dto: LinkShadowUserDto) {
    return this.usersService.linkShadowUser(req.user.userId, dto);
  }
}
