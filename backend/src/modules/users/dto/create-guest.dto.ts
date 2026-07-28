import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGuestUserDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do usuário convidado é obrigatório.' })
  nome: string;
}
