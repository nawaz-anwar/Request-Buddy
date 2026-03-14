import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('invitations')
@UseGuards(AuthGuard)
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Get()
  async getInvitations(@Query('email') email: string) {
    return this.invitationService.getInvitations(email);
  }

  @Post()
  async createInvitation(@Body() data: any, @Request() req) {
    return this.invitationService.createInvitation(data, req.user.uid);
  }

  @Put(':id/accept')
  async acceptInvitation(@Param('id') id: string, @Request() req) {
    return this.invitationService.acceptInvitation(id, req.user.uid);
  }

  @Put(':id/decline')
  async declineInvitation(@Param('id') id: string) {
    return this.invitationService.declineInvitation(id);
  }

  @Delete(':id')
  async deleteInvitation(@Param('id') id: string) {
    return this.invitationService.deleteInvitation(id);
  }
}
