const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/src/generated/prisma/client');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function checkData() {
  try {
    const users = await prisma.user.count();
    const posts = await prisma.post.count();
    const gallery = await prisma.gallery.count();
    const tags = await prisma.tag.count();
    const notifications = await prisma.notification.count();
    const auditLogs = await prisma.auditLog.count();
    const discussions = await prisma.discussion.count();
    const sessions = await prisma.session.count();
    const accounts = await prisma.account.count();

    console.log('=== Supabase Data Count ===');
    console.log('Users:', users);
    console.log('Accounts:', accounts);
    console.log('Sessions:', sessions);
    console.log('Posts:', posts);
    console.log('Tags:', tags);
    console.log('Gallery:', gallery);
    console.log('Notifications:', notifications);
    console.log('AuditLogs:', auditLogs);
    console.log('Discussions:', discussions);
    console.log('==========================');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
