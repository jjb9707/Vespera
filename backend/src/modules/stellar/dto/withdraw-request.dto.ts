import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class WithdrawRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.0000001)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
