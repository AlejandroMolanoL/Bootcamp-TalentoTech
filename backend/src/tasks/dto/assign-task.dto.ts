import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @IsInt({ message: 'El id del usuario asignado debe ser un número entero' })
  @IsNotEmpty({ message: 'El usuario asignado es obligatorio' })
  assignedToId: number;
}
