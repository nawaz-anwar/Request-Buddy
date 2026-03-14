import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { AuthGuard } from '../firebase/auth.guard';

@Controller('collections')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  @Get()
  async getCollections(@Query('workspaceId') workspaceId: string) {
    return this.collectionService.getCollections(workspaceId);
  }

  @Get(':id')
  async getCollection(@Param('id') id: string) {
    return this.collectionService.getCollection(id);
  }

  @Post()
  async createCollection(@Body() data: { name: string; workspaceId: string; description?: string }) {
    return this.collectionService.createCollection(data);
  }

  @Put(':id')
  async updateCollection(@Param('id') id: string, @Body() updates: any) {
    return this.collectionService.updateCollection(id, updates);
  }

  @Delete(':id')
  async deleteCollection(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }

  @Get('folders/list')
  async getFolders(@Query('workspaceId') workspaceId: string) {
    return this.collectionService.getFolders(workspaceId);
  }

  @Post('folders')
  async createFolder(@Body() data: { name: string; collectionId: string; workspaceId: string }) {
    return this.collectionService.createFolder(data);
  }

  @Put('folders/:id')
  async updateFolder(@Param('id') id: string, @Body() updates: any) {
    return this.collectionService.updateFolder(id, updates);
  }

  @Delete('folders/:id')
  async deleteFolder(@Param('id') id: string) {
    return this.collectionService.deleteFolder(id);
  }
}
