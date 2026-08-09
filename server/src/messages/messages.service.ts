import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryMessagesDto) {
    const userId = query.userId ?? (await this.resolveDemoUserId());
    const where = {
      userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };
    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { order: true },
    });
  }

  async unreadCount(userId?: number) {
    const resolved = userId ?? (await this.resolveDemoUserId());
    return this.prisma.message.count({
      where: { userId: resolved, isRead: false },
    });
  }

  private async resolveDemoUserId(): Promise<number> {
    const user = await this.prisma.user.findFirst({
      orderBy: { id: 'asc' },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('尚未初始化用户数据，请先执行种子命令');
    }
    return user.id;
  }

  async markRead(id: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('消息不存在');
    }
    return this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
