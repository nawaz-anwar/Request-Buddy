import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('environments')
@UseGuards(AuthGuard)
export class EnvironmentController {
  constructor(private environmentService: EnvironmentService) {}

  @Get()
  async getEnvironments(@Query('workspaceId') workspaceId: string) {
    return this.environmentService.getEnvironments(workspaceId);
  }

  @Get(':id')
  async getEnvironment(@Param('id') id: string) {
    return this.environmentService.getEnvironment(id);
  }

  @Post()
  async createEnvironment(@Body() data: { name: string; workspaceId: string; variables: any }) {
    return this.environmentService.createEnvironment(data);
  }

  @Put(':id')
  async updateEnvironment(@Param('id') id: string, @Body() updates: any) {
    return this.environmentService.updateEnvironment(id, updates);
  }

  @Delete(':id')
  async deleteEnvironment(@Param('id') id: string) {
    return this.environmentService.deleteEnvironment(id);
  }
}
