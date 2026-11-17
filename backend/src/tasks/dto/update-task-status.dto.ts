import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsInt({ message: 'El id del estado debe ser un número entero' })
  @IsNotEmpty({ message: 'El id del estado es obligatorio' })
  statusId: number;
}
