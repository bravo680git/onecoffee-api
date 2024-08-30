import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  return Promise.allSettled([
    prisma.user.upsert({
      create: {
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!,
      },
      update: {
        password: process.env.ADMIN_PASSWORD!,
      },
      where: {
        email: process.env.ADMIN_EMAIL!,
      },
    }),
    prisma.category.upsert({
      create: {
        name: 'Blogs',
      },
      update: { name: 'Blogs', parentId: null },
      where: {
        id: 1,
      },
    }),
    prisma.category.upsert({
      create: {
        name: 'Products',
      },
      update: { name: 'Products', parentId: null },
      where: {
        id: 2,
      },
    }),
    prisma.category.upsert({
      create: {
        name: 'About',
      },
      update: { name: 'About', parentId: null },
      where: {
        id: 3,
      },
    }),
    prisma.blog.upsert({
      create: {
        title: 'Chính sách quyền riêng tư',
        content: 'Chính sách quyền riêng tư',
        slug: 'quyen-rieng-tu',
        createdAt: null,
      },
      update: { createdAt: null },
      where: { slug: 'quyen-rieng-tu' },
    }),
    prisma.blog.upsert({
      create: {
        title: 'Điều khoản sử dụng',
        content: 'Điều khoản sử dụng',
        slug: 'dieu-khoan',
        createdAt: null,
      },
      update: { createdAt: null },
      where: { slug: 'quyen-rieng-tu' },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
