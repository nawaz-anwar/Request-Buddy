import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  async getHistory(
    @Query('workspaceId') workspaceId: string,
    @Query('limit') limit?: number
  ) {
    return this.historyService.getHistory(workspaceId, limit);
  }

  @Post()
  async addHistory(@Body() data: any) {
    return this.historyService.addHistory(data);
  }

  @Delete(':id')
  async deleteHistory(@Param('id') id: string) {
    return this.historyService.deleteHistory(id);
  }

  @Delete('clear/:workspaceId')
  async clearHistory(@Param('workspaceId') workspaceId: string) {
    return this.historyService.clearHistory(workspaceId);
  }
}
