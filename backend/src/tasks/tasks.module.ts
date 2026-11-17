import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../database/entities/task.entity';
import { TaskStatus } from '../database/entities/task-status.entity';
import { TaskComment } from '../database/entities/task-comment.entity';
import { TaskStatusHistory } from '../database/entities/task-status-history.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskStatus,
      TaskComment,
      TaskStatusHistory,
      User,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
