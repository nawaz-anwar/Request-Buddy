import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Get()
  async getRequests(@Query('workspaceId') workspaceId: string) {
    return this.requestService.getRequests(workspaceId);
  }

  @Get(':id')
  async getRequest(@Param('id') id: string) {
    return this.requestService.getRequest(id);
  }

  @Post()
  async createRequest(@Body() data: any) {
    return this.requestService.createRequest(data);
  }

  @Put(':id')
  async updateRequest(@Param('id') id: string, @Body() updates: any) {
    return this.requestService.updateRequest(id, updates);
  }

  @Delete(':id')
  async deleteRequest(@Param('id') id: string) {
    return this.requestService.deleteRequest(id);
  }
}
