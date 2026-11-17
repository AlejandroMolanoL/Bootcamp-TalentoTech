import { IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'El id del usuario asignado debe ser un número entero' })
  @IsNotEmpty({ message: 'El usuario asignado es obligatorio' })
  assignedToId: number;

  @IsInt({ message: 'El id del estado debe ser un número entero' })
  @IsOptional()
  statusId?: number;
}
