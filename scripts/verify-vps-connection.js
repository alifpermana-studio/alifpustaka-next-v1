require('dotenv').config({ path: '.env.local' });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/src/generated/prisma/client');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function verifyVPSConnection() {
  try {
    console.log('Testing VPS PostgreSQL connection...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
    
    const users = await prisma.user.count();
    const posts = await prisma.post.count();
    const gallery = await prisma.gallery.count();
    const tags = await prisma.tag.count();
    const notifications = await prisma.notification.count();
    const auditLogs = await prisma.auditLog.count();
    const discussions = await prisma.discussion.count();
    const sessions = await prisma.session.count();
    const accounts = await prisma.account.count();

    console.log('\n=== VPS PostgreSQL Data Count ===');
    console.log('✅ Users:', users);
    console.log('✅ Accounts:', accounts);
    console.log('✅ Sessions:', sessions);
    console.log('✅ Posts:', posts);
    console.log('✅ Tags:', tags);
    console.log('✅ Gallery:', gallery);
    console.log('✅ Notifications:', notifications);
    console.log('✅ AuditLogs:', auditLogs);
    console.log('✅ Discussions:', discussions);
    console.log('==================================\n');
    
    // Check super admin
    const superAdmin = await prisma.user.findUnique({
      where: { email: process.env.SUPERADMIN_EMAIL },
      include: { accounts: true }
    });
    
    if (superAdmin) {
      console.log('=== Super Admin ===');
      console.log('✅ Email:', superAdmin.email);
      console.log('✅ Username:', superAdmin.username);
      console.log('✅ Role:', superAdmin.role);
      console.log('✅ Status:', superAdmin.status);
      console.log('✅ Has Password:', superAdmin.accounts.some(a => a.password));
      console.log('===================\n');
    }
    
    console.log('🎉 VPS PostgreSQL connection successful!');
  } catch (error) {
    console.error('❌ Error connecting to VPS:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyVPSConnection();
