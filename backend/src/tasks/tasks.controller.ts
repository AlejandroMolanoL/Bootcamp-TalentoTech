import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Listar estados de tareas
  @Get('statuses')
  async getStatuses() {
    return this.tasksService.getStatuses();
  }

  // Crear tarea
  @Post()
  async createTask(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(req.user.id, createTaskDto);
  }

  // Listar tareas (con filtro opcional: all, assigned, created)
  @Get()
  async findAll(
    @Request() req: any,
    @Query('filter') filter?: 'all' | 'assigned' | 'created',
  ) {
    return this.tasksService.findAll(req.user.id, filter || 'all');
  }

  // Obtener detalle de tarea por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  // Cambiar estado de una tarea
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, req.user.id, updateStatusDto);
  }

  // Asignar o reasignar tarea
  @Patch(':id/assign')
  async assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() assignTaskDto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(id, req.user.id, assignTaskDto);
  }

  // Añadir comentario a una tarea
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.tasksService.addComment(id, req.user.id, createCommentDto);
  }

  // Listar comentarios de una tarea
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getComments(id);
  }
}
