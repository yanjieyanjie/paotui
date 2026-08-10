import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  userId: number;

  @IsInt()
  fromUserId: number;

  @IsOptional()
  @IsInt()
  orderId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000000)
  content: string;

  @IsOptional()
  @IsIn(['text', 'image', 'location', 'audio'])
  type?: string;
}