import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query() query: QueryMessagesDto) {
    return this.messagesService.findAll(query);
  }

  @Get('unread-count')
  unreadCount(@Query() query: QueryMessagesDto) {
    return this.messagesService.unreadCount(query.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markRead(id);
  }
}
