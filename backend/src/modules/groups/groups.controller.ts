import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@Request() req: any, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(req.user.userId, dto);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinGroup(@Request() req: any, @Body() dto: JoinGroupDto) {
    return this.groupsService.joinGroup(req.user.userId, dto);
  }

  @Get()
  async listUserGroups(@Request() req: any) {
    return this.groupsService.listUserGroups(req.user.userId);
  }

  @Delete(':groupId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.groupsService.removeMember(req.user.userId, groupId, memberId);
  }

  @Get(':groupId/activity')
  async getGroupActivity(@Request() req: any, @Param('groupId') groupId: string) {
    return this.groupsService.getGroupActivity(req.user.userId, groupId);
  }
}
