import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { QueryConversationDto } from './dto/query-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query() query: QueryMessagesDto) {
    return this.messagesService.findAll(query);
  }

  @Get('conversations')
  conversations(@Query() query: QueryMessagesDto) {
    return this.messagesService.conversations(query.userId);
  }

  @Get('conversation')
  conversation(@Query() query: QueryConversationDto) {
    return this.messagesService.conversationMessages(query);
  }

  @Get('unread-count')
  unreadCount(@Query() query: QueryMessagesDto) {
    return this.messagesService.unreadCount(query.userId);
  }

  @Post()
  send(@Body() dto: SendMessageDto) {
    return this.messagesService.send(dto);
  }

  @Patch('read')
  markConversationRead(@Body() dto: QueryConversationDto) {
    return this.messagesService.markConversationRead(dto);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markRead(id);
  }
}