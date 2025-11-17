import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async create(@Body() dto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(dto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query, @Request() req) {
    return this.tasksService.findAll(query, req.user.userId);
  }

  @Get('stats')
  async stats(@Request() req) {
    return this.tasksService.stats(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaskDto>,
    @Request() req,
  ) {
    return this.tasksService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.userId);
  }
}
