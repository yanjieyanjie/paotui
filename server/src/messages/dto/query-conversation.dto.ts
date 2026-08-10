import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class QueryConversationDto {
  @Type(() => Number)
  @IsInt()
  userId: number;

  @Type(() => Number)
  @IsInt()
  orderId: number;

  @Type(() => Number)
  @IsInt()
  otherUserId: number;
}