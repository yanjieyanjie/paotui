import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { DEFAULT_USER_ID, ORDER_STATUSES } from '../common/constants';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryOrdersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const statuses = query.statuses
      ? query.statuses.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    if (statuses.some((s) => !(ORDER_STATUSES as readonly string[]).includes(s))) {
      throw new BadRequestException('statuses 包含非法状态');
    }
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(statuses.length > 0 ? { status: { in: statuses } } : {}),
      ...(query.gender ? { gender: query.gender } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.keyword ? { title: { contains: query.keyword } } : {}),
      ...(query.acceptedById ? { acceptedById: query.acceptedById } : {}),
      ...(query.involvedUserId
        ? {
            OR: [
              { creatorId: query.involvedUserId },
              { acceptedById: query.involvedUserId },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { creator: true },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { creator: true },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        reward: dto.reward,
        pickup: dto.pickup,
        delivery: dto.delivery,
        gender: dto.gender,
        status: 'PAYMENT_PENDING',
        creatorId: dto.creatorId ?? (await this.resolveDemoUserId()),
      },
      include: { creator: true },
    });
  }

  async pay(id: number) {
    const order = await this.findOne(id);
    if (order.status !== 'PAYMENT_PENDING') {
      throw new ConflictException('只有待支付订单可以支付');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'OPEN' },
      include: { creator: true },
    });
  }

  async cancel(id: number) {
    const order = await this.findOne(id);
    if (order.status !== 'PAYMENT_PENDING' && order.status !== 'OPEN') {
      throw new ConflictException('只有待支付或待接单的任务可以撤回');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { creator: true },
    });
  }

  async accept(id: number, userId?: number) {
    const order = await this.findOne(id);
    if (order.status !== 'OPEN') {
      throw new ConflictException('只有待接单的任务可以接单');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedById: userId ?? DEFAULT_USER_ID },
      include: { creator: true },
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

  async done(id: number) {
    const order = await this.findOne(id);
    if (order.status !== 'ACCEPTED') {
      throw new ConflictException('只有进行中的任务可以标记完成');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'COMPLETION_PENDING' },
      include: { creator: true },
    });
  }

  async confirm(id: number) {
    const order = await this.findOne(id);
    if (order.status !== 'ACCEPTED' && order.status !== 'COMPLETION_PENDING') {
      throw new ConflictException('只有进行中或待确认的任务可以确认完成');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'DONE' },
      include: { creator: true },
    });
  }
}
