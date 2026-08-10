import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$executeRawUnsafe('ALTER TABLE `User` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `Order` AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE `Message` AUTO_INCREMENT = 1');

  // 演示账号：ID 固定为 1（对应前端 DEMO_USER_ID / 后端 DEFAULT_USER_ID）
  const demo = await prisma.user.create({
    data: {
      nickname: '校园跑腿君',
      phone: '13800000000',
      major: '计算机科学与技术',
      gender: 'male',
    },
  });

  // 其他学生用户，让接单大厅出现不同发布者
  const zhangSan = await prisma.user.create({
    data: {
      nickname: '张三',
      phone: '13811112222',
      major: '软件工程',
      gender: 'male',
    },
  });
  const liSi = await prisma.user.create({
    data: {
      nickname: '李四',
      phone: '13833334444',
      major: '会计学',
      gender: 'female',
    },
  });
  const wangWu = await prisma.user.create({
    data: {
      nickname: '王五',
      phone: '13855556666',
      major: '机械工程',
      gender: 'male',
    },
  });

  const orders = [
    {
      title: '帮取菜鸟驿站快递 3 件',
      description: '快递较多，需要小推车，送到 3 号宿舍楼下即可',
      type: 'EXPRESS',
      reward: 5,
      pickup: '菜鸟驿站（东门）',
      delivery: '3 号宿舍楼',
      status: 'OPEN',
      creatorId: demo.id,
    },
    {
      title: '带一份二食堂黄焖鸡米饭',
      description: '不要辣，多加汤汁，送到图书馆二楼自习区',
      type: 'FOOD',
      reward: 3,
      gender: 'male',
      pickup: '二食堂',
      delivery: '图书馆二楼',
      status: 'OPEN',
      creatorId: demo.id,
    },
    {
      title: '代买一瓶 1.5L 农夫山泉',
      description: '送到操场看台，扫码支付',
      type: 'SHOPPING',
      reward: 2,
      pickup: '校门口超市',
      delivery: '操场看台',
      status: 'OPEN',
      creatorId: zhangSan.id,
    },
    {
      title: '代取美团外卖',
      description: '校门口外卖架，餐号 88，送到 6 号宿舍',
      type: 'EXPRESS',
      reward: 4,
      gender: 'female',
      pickup: '校门口外卖架',
      delivery: '6 号宿舍楼',
      status: 'OPEN',
      creatorId: liSi.id,
    },
    {
      title: '代取奶茶外卖（待支付示例）',
      description: '校门口奶茶店取餐，送到 1 号宿舍楼下，尚未支付',
      type: 'FOOD',
      reward: 4,
      pickup: '校门口奶茶店',
      delivery: '1 号宿舍楼',
      status: 'PAYMENT_PENDING',
      creatorId: wangWu.id,
    },
    {
      title: '帮忙打印 20 页资料',
      description: 'A4 双面黑白，打印好送到教学楼 B102',
      type: 'OTHER',
      reward: 6,
      pickup: '校内打印店',
      delivery: '教学楼 B102',
      status: 'OPEN',
      creatorId: zhangSan.id,
    },
    {
      title: '带一杯一点点波霸奶茶',
      description: '三分糖去冰，送到宿舍区门口',
      type: 'FOOD',
      reward: 3.5,
      pickup: '一点点奶茶店',
      delivery: '宿舍区门口',
      status: 'OPEN',
      creatorId: liSi.id,
    },
    {
      title: '代取顺丰快递（大件）',
      description: '顺丰站点已通知，大件快递需要帮忙搬运到 8 号楼',
      type: 'EXPRESS',
      reward: 8,
      pickup: '顺丰站点',
      delivery: '8 号宿舍楼',
      status: 'ACCEPTED',
      creatorId: demo.id,
      acceptedById: demo.id,
    },
    {
      title: '买两盒感冒药',
      description: '校医院旁药店，感康或同类感冒药即可',
      type: 'SHOPPING',
      reward: 5,
      gender: 'female',
      pickup: '校医院旁药店',
      delivery: '2 号宿舍楼',
      status: 'ACCEPTED',
      creatorId: wangWu.id,
      acceptedById: demo.id,
    },
    {
      title: '带早饭：豆浆+两个肉包',
      description: '送到教学楼门口，7:50 前到',
      type: 'FOOD',
      reward: 2.5,
      pickup: '一食堂',
      delivery: '教学楼门口',
      status: 'DONE',
      creatorId: zhangSan.id,
      acceptedById: demo.id,
    },
    {
      title: '帮取圆通快递',
      description: '已到快递柜，取件码 123456',
      type: 'EXPRESS',
      reward: 3,
      pickup: '东门快递柜',
      delivery: '4 号宿舍楼',
      status: 'DONE',
      creatorId: demo.id,
      acceptedById: demo.id,
    },
    {
      title: '代购羽毛球一筒',
      description: '体育用品店，尤尼克斯 05 号球',
      type: 'SHOPPING',
      reward: 4,
      pickup: '体育用品店',
      delivery: '体育馆前台',
      status: 'DONE',
      creatorId: liSi.id,
      acceptedById: demo.id,
    },
    {
      title: '帮搬宿舍行李下楼',
      description: '毕业季搬行李，大约 6 个编织袋，送到校门口',
      type: 'OTHER',
      reward: 15,
      gender: 'male',
      pickup: '5 号宿舍楼 3 层',
      delivery: '校门口',
      status: 'CANCELLED',
      creatorId: wangWu.id,
    },
    // 以下为其他用户新发布的订单，让接单大厅发布者更丰富
    {
      title: '代取京东快递',
      description: '东门京东派送点，货号 J-2026，送到 7 号宿舍楼下',
      type: 'EXPRESS',
      reward: 5,
      pickup: '东门京东派送点',
      delivery: '7 号宿舍楼',
      status: 'OPEN',
      creatorId: zhangSan.id,
    },
    {
      title: '带一份三食堂麻辣烫',
      description: '微辣，不要香菜，送到图书馆一楼',
      type: 'FOOD',
      reward: 4,
      pickup: '三食堂麻辣烫窗口',
      delivery: '图书馆一楼',
      status: 'OPEN',
      creatorId: liSi.id,
    },
    {
      title: '代买一提抽纸',
      description: '维达 3 层抽纸一提，送到 3 号宿舍楼下',
      type: 'SHOPPING',
      reward: 3,
      pickup: '校内超市',
      delivery: '3 号宿舍楼下',
      status: 'OPEN',
      creatorId: wangWu.id,
    },
    {
      title: '帮忙寄个快递',
      description: '顺丰到付，文件袋已装好，送到顺丰站点并下单',
      type: 'OTHER',
      reward: 6,
      pickup: '2 号宿舍楼 402',
      delivery: '顺丰站点',
      status: 'OPEN',
      creatorId: zhangSan.id,
    },
  ];

  const orderIdByTitle = new Map<string, number>();
  for (const order of orders) {
    const created = await prisma.order.create({
      data: order,
    });
    orderIdByTitle.set(created.title, created.id);
  }

  const messages = [
    {
      content: '欢迎使用校园跑腿！发布任务或接单前，请先完善个人资料。',
      isRead: false,
      orderTitle: null,
    },
    {
      content:
        '你的任务「帮取菜鸟驿站快递 3 件」已被接单，跑腿员正在前往取件。',
      isRead: false,
      orderTitle: '帮取菜鸟驿站快递 3 件',
    },
    {
      content: '任务「带一份二食堂黄焖鸡米饭」已完成，记得给跑腿员好评哦。',
      isRead: true,
      orderTitle: '带一份二食堂黄焖鸡米饭',
    },
    {
      content: '系统通知：本周五 22:00 将进行服务维护，期间暂停接单。',
      isRead: true,
      orderTitle: null,
    },
    {
      content:
        '你发布的任务「代取顺丰快递（大件）」正在进行中，可随时查看进度。',
      isRead: true,
      orderTitle: '代取顺丰快递（大件）',
    },
    {
      content: '恭喜！你的任务「帮取圆通快递」已完成，赏金已发放。',
      isRead: true,
      orderTitle: '帮取圆通快递',
    },
  ];

  for (const message of messages) {
    await prisma.message.create({
      data: {
        content: message.content,
        isRead: message.isRead,
        userId: demo.id,
        orderId: message.orderTitle
          ? (orderIdByTitle.get(message.orderTitle) ?? null)
          : null,
      },
    });
  }

  console.log(
    `Seed 完成：用户 4 个（demo id=${demo.id}），订单 ${orders.length} 条，消息 ${messages.length} 条`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());