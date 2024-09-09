import { PrismaClient } from '@prisma/client';
import { CATEGORY_TYPE_ID } from 'src/lib/utils/constant';

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  return Promise.allSettled([
    prisma.category.upsert({
      create: {
        name: 'Blogs',
      },
      update: { name: 'Blogs', parentId: null },
      where: {
        id: CATEGORY_TYPE_ID.BLOG,
      },
    }),
    prisma.category.upsert({
      create: {
        name: 'Products',
      },
      update: { name: 'Products', parentId: null },
      where: {
        id: CATEGORY_TYPE_ID.PRODUCT,
      },
    }),
    prisma.category.upsert({
      create: {
        name: 'About',
      },
      update: { name: 'About', parentId: null },
      where: {
        id: CATEGORY_TYPE_ID.ABOUT,
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
      where: { slug: 'dieu-khoan' },
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
