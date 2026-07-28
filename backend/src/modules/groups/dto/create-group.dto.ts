import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString({ message: 'O nome do grupo deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do grupo é obrigatório.' })
  nome: string;
}
