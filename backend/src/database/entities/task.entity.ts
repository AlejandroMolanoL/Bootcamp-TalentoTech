import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TaskStatus } from './task-status.entity';
import { TaskComment } from './task-comment.entity';
import { TaskStatusHistory } from './task-status-history.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => TaskStatus, (status) => status.tasks, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: TaskStatus;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, (user) => user.createdTasks, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'assigned_to_id' })
  assignedToId: number;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];

  @OneToMany(() => TaskStatusHistory, (history) => history.task)
  history: TaskStatusHistory[];
}
