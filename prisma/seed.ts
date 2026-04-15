import { PrismaClient, Role, Status } from '@prisma/client';
import { PasswordService } from 'src/common/password.service';

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();

  if (usersCount > 0) {
    console.log('--- Database already has data. Skipping seed. ---');
    return;
  }

  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await PasswordService.hash('password123');

  const admin = await prisma.user.create({
    data: { login: 'admin', password: passwordHash, role: Role.ADMIN },
  });
  const editor = await prisma.user.create({
    data: { login: 'editor', password: passwordHash, role: Role.EDITOR },
  });

  const catDev = await prisma.category.create({
    data: { name: 'Development', description: 'Tech' },
  });
  const catDesign = await prisma.category.create({
    data: { name: 'Design', description: 'UI/UX' },
  });
  const catNews = await prisma.category.create({
    data: { name: 'News', description: 'General' },
  });

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'typescript' } }),
    prisma.tag.create({ data: { name: 'nest' } }),
    prisma.tag.create({ data: { name: 'prisma' } }),
    prisma.tag.create({ data: { name: 'docker' } }),
    prisma.tag.create({ data: { name: 'backend' } }),
  ]);

  const art1 = await prisma.article.create({
    data: {
      title: 'NestJS Guide',
      content: 'Long content about Nest...',
      status: Status.PUBLISHED,
      authorId: admin.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Dockerize Apps',
      content: 'How to use docker...',
      status: Status.PUBLISHED,
      authorId: editor.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[3].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Old UI Trends',
      content: 'Flash and skeuomorphism were popular in 2010...',
      status: Status.ARCHIVED,
      authorId: admin.id,
      categoryId: catDesign.id,
      tags: { connect: [{ id: tags[4].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Future of NestJS',
      content: 'This article is still a draft and not visible to viewers...',
      status: Status.DRAFT,
      authorId: editor.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  const art5 = await prisma.article.create({
    data: {
      title: 'New Knowledge Hub Release',
      content: 'Version 2.0 with PostgreSQL is finally here!',
      status: Status.PUBLISHED,
      authorId: admin.id,
      categoryId: catNews.id,
      tags: { connect: [{ id: tags[2].id }, { id: tags[3].id }] },
    },
  });

  await prisma.comment.create({
    data: { content: 'Very helpful!', authorId: editor.id, articleId: art1.id },
  });
  await prisma.comment.create({
    data: {
      content: 'Great write-up, thanks!',
      authorId: admin.id,
      articleId: art5.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: 'Looking forward to more content.',
      authorId: editor.id,
      articleId: art5.id,
    },
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
