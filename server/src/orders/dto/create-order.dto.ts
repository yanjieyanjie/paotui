import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ORDER_TYPES } from '../../common/constants';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsIn(ORDER_TYPES)
  type: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  reward: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  pickup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  delivery?: string;

  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @IsOptional()
  @IsInt()
  creatorId?: number;
}
