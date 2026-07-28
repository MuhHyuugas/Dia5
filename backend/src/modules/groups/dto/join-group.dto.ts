import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @IsString({ message: 'O código do grupo deve ser um texto.' })
  @IsNotEmpty({ message: 'O código de convite do grupo é obrigatório.' })
  @Length(6, 6, { message: 'O código de convite deve ter exatamente 6 caracteres.' })
  codigoConvite: string;
}
