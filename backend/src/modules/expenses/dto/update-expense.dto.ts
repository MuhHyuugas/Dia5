import { IsOptional, IsString, IsNumber, IsPositive, IsArray, ValidateNested, ArrayMinSize, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ParticipantDto } from './create-expense.dto';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString({ message: 'A descrição da despesa deve ser um texto.' })
  descricao?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O valor total deve ser um número.' })
  @IsPositive({ message: 'O valor total deve ser maior que zero.' })
  valorTotal?: number;

  @IsOptional()
  @IsDateString({}, { message: 'A data da compra deve ser uma data válida.' })
  dataCompra?: string;

  @IsOptional()
  @IsArray({ message: 'A lista de participantes deve ser um array.' })
  @ArrayMinSize(1, { message: 'A despesa deve ter pelo menos 1 participante.' })
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participantes?: ParticipantDto[];
}
