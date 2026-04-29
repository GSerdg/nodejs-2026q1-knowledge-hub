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
    data: { login: 'admin', password: passwordHash, role: Role.admin },
  });
  const editor = await prisma.user.create({
    data: { login: 'editor', password: passwordHash, role: Role.editor },
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
      title: 'Bitcoin: Digital Gold or Financial Bubble?',
      content:
        'Cryptocurrencies have become one of the most discussed financial phenomena of the 21st century. Bitcoin, which emerged in 2009 as a decentralized alternative to traditional money, has evolved from a hobby for programmers into an asset purchased by the world is largest investment funds. Proponents of blockchain technology argue that Bitcoin is an ideal tool for capital preservation. Unlike the US dollar or the Euro, its supply is strictly limited to 21 million coins, making it hedge-resistant against inflation. Thanks to the distributed ledger, transactions cannot be forged, and the absence of a central bank makes the system resistant to censorship. However, critics point to extreme price volatility. An asset is price can rise or fall by 10-20% in a single day, making it risky for use as a daily means of payment. Furthermore, the massive amount of electricity required for mining raises serious concerns among environmentalists. Despite the controversy, Bitcoin has already changed the perception of finance. Many countries are beginning to implement regulations for digital assets, and corporations such as Tesla and MicroStrategy hold part of their reserves in cryptocurrency. Whether this is the beginning of a new financial era or a temporary trend, only time will tell.',
      status: Status.published,
      authorId: admin.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'The Future of Edge Computing in IoT Networks',
      content:
        'Edge computing is rapidly transforming how data is processed in the Internet of Things (IoT). Traditionally, IoT devices collected raw data and sent it to a centralized cloud server for analysis. However, as the number of connected devices reaches billions, this model faces critical bottlenecks: high latency, bandwidth congestion, and privacy concerns. By shifting computation from the cloud to the "edge" of the network—closer to the data source—organizations can achieve near-instantaneous processing. For instance, an autonomous vehicle cannot afford the 200ms delay required to send sensor data to a remote server and wait for a braking command. Edge nodes process this data locally, ensuring safety and reliability. Despite its benefits, implementing edge computing is not without challenges. Resource constraints are a primary issue; edge nodes often have limited CPU power and memory compared to cloud data centers. Additionally, securing a distributed network of thousands of edge devices is significantly more complex than securing a single data center. Developers must find a balance between performance and security to prevent the network from becoming a massive botnet.',
      status: Status.published,
      authorId: editor.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[3].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Old UI Trends',
      content: 'Flash and skeuomorphism were popular in 2010...',
      status: Status.archived,
      authorId: admin.id,
      categoryId: catDesign.id,
      tags: { connect: [{ id: tags[4].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Future of NestJS',
      content: 'This article is still a draft and not visible to viewers...',
      status: Status.draft,
      authorId: editor.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  const art5 = await prisma.article.create({
    data: {
      title: 'New Knowledge Hub Release',
      content: 'Version 2.0 with PostgreSQL is finally here!',
      status: Status.published,
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
