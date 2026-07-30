import { IsNotEmpty, IsString, IsNumber, IsPositive, IsArray, ValidateNested, ArrayMinSize, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantDto {
  @IsString({ message: 'O ID do participante deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do participante é obrigatório.' })
  usuarioId: string;

  @IsNumber({}, { message: 'O valor devido deve ser um número.' })
  @IsPositive({ message: 'O valor devido deve ser maior que zero.' })
  valorDevido: number;
}

export class CreateExpenseDto {
  @IsString({ message: 'O ID do grupo deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do grupo é obrigatório.' })
  grupoId: string;

  @IsString({ message: 'O ID do pagador deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do pagador é obrigatório.' })
  pagadorId: string;

  @IsString({ message: 'A descrição da despesa deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição da despesa é obrigatória.' })
  descricao: string;

  @IsNumber({}, { message: 'O valor total deve ser um número.' })
  @IsPositive({ message: 'O valor total deve ser maior que zero.' })
  valorTotal: number;

  @IsDateString({}, { message: 'A data da compra deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data da compra é obrigatória.' })
  dataCompra: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoria?: string;

  @IsArray({ message: 'A lista de participantes deve ser um array.' })
  @ArrayMinSize(1, { message: 'A despesa deve ter pelo menos 1 participante.' })
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participantes: ParticipantDto[];
}
