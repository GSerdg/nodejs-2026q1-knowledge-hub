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
      title: ' Why Edge Computing is the Future of the Internet',
      content:
        'For years, cloud computing has been the backbone of the digital world. However, as the number of IoT devices grows, a new paradigm called Edge Computing is taking over. Unlike cloud computing, where data is processed in distant data centers, edge computing brings computation and data storage closer to the sources of data. This shift is crucial for applications that require real-time processing, such as autonomous vehicles and industrial automation. By reducing the distance data must travel, edge computing significantly lowers latency and saves bandwidth. Moreover, it enhances security by keeping sensitive information local rather than transmitting it across the global network. As 5G technology rolls out, we can expect edge computing to become an invisible but essential part of our daily infrastructure.',
      status: Status.archived,
      authorId: admin.id,
      categoryId: catDesign.id,
      tags: { connect: [{ id: tags[4].id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Less is More: How Minimalism Can Improve Mental Health',
      content:
        'Minimalism is often misunderstood as just an aesthetic trend or a way to decorate a house with white furniture. In reality, it is a conscious lifestyle choice focused on removing distractions to make room for what truly matters. In an era of constant information overload and aggressive consumerism, minimalism offers a psychological sanctuary. Research suggests that physical clutter in our surroundings can lead to mental fatigue and increased levels of cortisol, the stress hormone. By simplifying our possessions and commitments, we regain control over our attention and time. Minimalism is not about owning nothing; it is about making sure that the things you do own serve a purpose or bring genuine joy. Adopting this mindset helps individuals focus on personal growth, relationships, and experiences rather than material accumulation.',
      status: Status.draft,
      authorId: editor.id,
      categoryId: catDev.id,
      tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
    },
  });

  const art5 = await prisma.article.create({
    data: {
      title: 'Glowing in the Dark: The Secret Language of the Deep Ocean',
      content:
        'The deep ocean is one of the least explored places on Earth, characterized by extreme pressure and total darkness. Yet, in this void, life has found a spectacular way to communicate: bioluminescence. Over 75% of deep-sea creatures are estimated to produce their own light through complex chemical reactions. Marine biologists have discovered that this biological light serves multiple purposes. Some species use it as a flashlight to find prey, while others use glowing lures to attract a meal. Some even use "burglar alarms"—flashes of light that expose their predators to even larger hunters. The chemical process, involving a molecule called luciferin and an enzyme called luciferase, is incredibly efficient, producing almost no heat. Studying these organisms not only reveals the secrets of evolution but also inspires new medical technologies and sustainable lighting solutions for humans.',
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
