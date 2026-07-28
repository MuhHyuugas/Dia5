import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFriendDto } from './dto/add-friend.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async addFriend(@Request() req: any, @Body() dto: AddFriendDto) {
    return this.friendshipsService.addFriend(req.user.userId, dto);
  }

  @Get()
  async listFriends(@Request() req: any) {
    return this.friendshipsService.listFriends(req.user.userId);
  }

  @Delete(':friendId')
  @HttpCode(HttpStatus.OK)
  async removeFriend(@Request() req: any, @Param('friendId') friendId: string) {
    return this.friendshipsService.removeFriend(req.user.userId, friendId);
  }
}
