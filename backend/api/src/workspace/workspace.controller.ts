import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Get()
  async getWorkspaces(@Request() req) {
    return this.workspaceService.getWorkspaces(req.user.uid);
  }

  @Get(':id')
  async getWorkspace(@Param('id') id: string, @Request() req) {
    return this.workspaceService.getWorkspace(id, req.user.uid);
  }

  @Post()
  async createWorkspace(@Body() body: { name: string }, @Request() req) {
    return this.workspaceService.createWorkspace(body.name, req.user.uid);
  }

  @Put(':id')
  async updateWorkspace(@Param('id') id: string, @Body() updates: any, @Request() req) {
    return this.workspaceService.updateWorkspace(id, req.user.uid, updates);
  }

  @Delete(':id')
  async deleteWorkspace(@Param('id') id: string, @Request() req) {
    return this.workspaceService.deleteWorkspace(id, req.user.uid);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
    @Request() req
  ) {
    return this.workspaceService.addMember(id, req.user.uid, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ) {
    return this.workspaceService.removeMember(id, req.user.uid, userId);
  }

  @Put(':id/members/:userId/role')
  async changeUserRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { role: string },
    @Request() req
  ) {
    return this.workspaceService.changeUserRole(id, req.user.uid, userId, body.role);
  }
}
