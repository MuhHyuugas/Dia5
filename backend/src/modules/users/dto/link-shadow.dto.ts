import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LinkShadowUserDto {
  @IsString({ message: 'O ID do usuário convidado deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do usuário convidado é obrigatório.' })
  shadowUserId: string;

  @IsString({ message: 'O código de perfil deve ser um texto.' })
  @IsNotEmpty({ message: 'O código de perfil é obrigatório.' })
  @Length(6, 6, { message: 'O código de perfil deve ter exatamente 6 caracteres.' })
  codigoPerfil: string;
}
