import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { QueryConversationDto } from './dto/query-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

type MessageWithOrder = Prisma.MessageGetPayload<{
  include: { order: true };
}>;

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryMessagesDto) {
    const userId = query.userId ?? (await this.resolveDemoUserId());
    const where = {
      userId,
      fromUserId: null,
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

  async conversations(userId?: number) {
    const resolved = userId ?? (await this.resolveDemoUserId());
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ userId: resolved }, { fromUserId: resolved }],
        fromUserId: { not: null },
      },
      include: { order: true },
      orderBy: { createdAt: 'asc' },
    });
    const groups = new Map<string, MessageWithOrder[]>();
    for (const message of messages) {
      const otherId =
        message.userId === resolved
          ? (message.fromUserId as number)
          : message.userId;
      const key = `${message.orderId ?? 0}:${otherId}`;
      const list = groups.get(key);
      if (list) {
        list.push(message);
      } else {
        groups.set(key, [message]);
      }
    }
    const otherIds = Array.from(
      new Set(
        Array.from(groups.values()).flatMap((list) =>
          list.map((m) =>
            m.userId === resolved ? (m.fromUserId as number) : m.userId,
          ),
        ),
      ),
    );
    const users = await this.prisma.user.findMany({
      where: { id: { in: otherIds } },
      select: { id: true, nickname: true, avatar: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const result = Array.from(groups.entries()).map(([key, list]) => {
      const sorted = [...list].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      const last = sorted[sorted.length - 1];
      const otherId =
        last.userId === resolved ? (last.fromUserId as number) : last.userId;
      const other = userMap.get(otherId);
      return {
        key,
        orderId: last.orderId ?? 0,
        orderTitle: last.order?.title ?? '',
        otherUserId: otherId,
        otherNickname: other?.nickname ?? '',
        otherAvatar: other?.avatar ?? null,
        lastContent: last.content,
        lastTime: last.createdAt,
        unreadCount: list.filter(
          (m) => m.userId === resolved && !m.isRead,
        ).length,
      };
    });
    result.sort(
      (a, b) => b.lastTime.getTime() - a.lastTime.getTime(),
    );
    return result;
  }

  async conversationMessages(dto: QueryConversationDto) {
    return this.prisma.message.findMany({
      where: {
        orderId: dto.orderId,
        OR: [
          { userId: dto.userId, fromUserId: dto.otherUserId },
          { userId: dto.otherUserId, fromUserId: dto.userId },
        ],
      },
      include: {
        fromUser: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async send(dto: SendMessageDto) {
    if (dto.fromUserId === dto.userId) {
      throw new BadRequestException('不能给自己发消息');
    }
    const [sender, receiver, order] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.fromUserId } }),
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      dto.orderId
        ? this.prisma.order.findUnique({ where: { id: dto.orderId } })
        : Promise.resolve(null),
    ]);
    if (!sender) {
      throw new NotFoundException('发送者不存在');
    }
    if (!receiver) {
      throw new NotFoundException('接收者不存在');
    }
    if (dto.orderId && !order) {
      throw new NotFoundException('订单不存在');
    }
    return this.prisma.message.create({
      data: {
        userId: dto.userId,
        fromUserId: dto.fromUserId,
        orderId: dto.orderId ?? null,
        content: dto.content.trim(),
        type: dto.type ?? 'text',
      },
      include: {
        fromUser: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  async markConversationRead(dto: QueryConversationDto) {
    const result = await this.prisma.message.updateMany({
      where: {
        userId: dto.userId,
        orderId: dto.orderId,
        fromUserId: dto.otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { count: result.count };
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
}