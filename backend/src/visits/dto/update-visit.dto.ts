import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VisitResult } from '@prisma/client';

export class UpdateVisitDto {
  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsDateString()
  visitTime?: string;

  @IsOptional()
  @IsEnum(VisitResult)
  result?: VisitResult;

  @IsOptional()
  @IsString()
  notes?: string;
}
