import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDemoUser() {
    const user = await this.prisma.user.findFirst({ orderBy: { id: 'asc' } });
    if (!user) {
      throw new NotFoundException('尚未初始化用户数据，请先执行种子命令');
    }
    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async getStats(id: number) {
    await this.findOne(id);
    const group = await this.prisma.order.groupBy({
      by: ['status'],
      where: { creatorId: id },
      _count: { _all: true },
    });
    const countOf = (status: string) =>
      group.find((item) => item.status === status)?._count._all ?? 0;

    const published = await this.prisma.order.findMany({
      where: { creatorId: id },
      select: { status: true, reward: true },
    });
    const sumReward = (list: { reward: unknown }[]) =>
      list.reduce((sum, item) => sum + Number(item.reward), 0);
    const donePublished = published.filter((o) => o.status === 'DONE');
    const paidPublished = published.filter(
      (o) => o.status !== 'PAYMENT_PENDING' && o.status !== 'CANCELLED',
    );

    const runner = await this.prisma.order.findMany({
      where: { acceptedById: id, status: 'DONE' },
      select: { reward: true, updatedAt: true },
    });
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const doneToday = runner.filter((o) => o.updatedAt >= startOfToday);
    const doneThisMonth = runner.filter((o) => o.updatedAt >= startOfMonth);
    const fmt = (n: number) => n.toFixed(2);
    const totalDone = runner.length;
    const onTimeRate =
      totalDone > 0
        ? `${Math.round((doneThisMonth.length / totalDone) * 100)}%`
        : '0%';

    return {
      total:
        countOf('OPEN') +
        countOf('PAYMENT_PENDING') +
        countOf('ACCEPTED') +
        countOf('DONE') +
        countOf('CANCELLED'),
      open: countOf('OPEN'),
      accepted: countOf('ACCEPTED'),
      done: countOf('DONE'),
      wallet: {
        points: donePublished.length,
        coupons: 0,
        balance: fmt(sumReward(paidPublished)),
      },
      runner: {
        todayCommission: fmt(sumReward(doneToday)),
        todayOrders: doneToday.length,
        monthOnTime: doneThisMonth.length,
        totalCommission: fmt(sumReward(runner)),
        totalOrders: totalDone,
        onTimeRate,
      },
    };
  }
}
