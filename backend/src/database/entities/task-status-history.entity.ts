import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';
import { TaskStatus } from './task-status.entity';

@Entity('task_status_history')
export class TaskStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'changed_by_id' })
  changedById: number;

  @ManyToOne(() => User, (user) => user.statusChanges, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column({ name: 'previous_status_id', nullable: true })
  previousStatusId: number;

  @ManyToOne(() => TaskStatus, { eager: true, nullable: true })
  @JoinColumn({ name: 'previous_status_id' })
  previousStatus: TaskStatus;

  @Column({ name: 'new_status_id' })
  newStatusId: number;

  @ManyToOne(() => TaskStatus, { eager: true })
  @JoinColumn({ name: 'new_status_id' })
  newStatus: TaskStatus;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamptz' })
  changedAt: Date;
}
