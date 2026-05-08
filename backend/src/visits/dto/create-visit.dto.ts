import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VisitResult } from '@prisma/client';

export class CreateVisitDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsOptional()
  @IsDateString()
  visitTime?: string;

  @IsEnum(VisitResult)
  result: VisitResult;

  @IsOptional()
  @IsString()
  notes?: string;
}
