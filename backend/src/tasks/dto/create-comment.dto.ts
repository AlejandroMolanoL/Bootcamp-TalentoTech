import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'El comentario debe ser texto' })
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  content: string;
}
