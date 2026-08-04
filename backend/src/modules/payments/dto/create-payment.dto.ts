import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsString({ message: 'O ID do pagador deve ser um texto.' })
  pagadorId?: string;

  @IsString({ message: 'O ID do recebedor deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do recebedor é obrigatório.' })
  recebedorId: string;

  @IsOptional()
  @IsString({ message: 'O ID do grupo deve ser um texto.' })
  grupoId?: string;

  @IsNumber({}, { message: 'O valor pago deve ser um número.' })
  @IsPositive({ message: 'O valor pago deve ser maior que zero.' })
  valorPago: number;
}
