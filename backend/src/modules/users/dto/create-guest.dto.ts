import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGuestUserDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do usuário convidado é obrigatório.' })
  nome: string;

  /** Se informado, o convidado é adicionado automaticamente como membro do grupo (UC07). */
  @IsOptional()
  @IsUUID('4', { message: 'grupoId deve ser um UUID válido.' })
  grupoId?: string;
}

