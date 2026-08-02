const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/src/generated/prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function exportData() {
  try {
    console.log('Exporting data from Supabase...');
    
    // Export all tables
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const sessions = await prisma.session.findMany();
    const posts = await prisma.post.findMany();
    const tags = await prisma.tag.findMany();
    const postTags = await prisma.postTag.findMany();
    const gallery = await prisma.gallery.findMany();
    const notifications = await prisma.notification.findMany();
    const auditLogs = await prisma.auditLog.findMany();
    const discussions = await prisma.discussion.findMany();
    const verifications = await prisma.verification.findMany();

    const data = {
      users,
      accounts,
      sessions,
      posts,
      tags,
      postTags,
      gallery,
      notifications,
      auditLogs,
      discussions,
      verifications
    };

    // Save to JSON file
    fs.writeFileSync(
      'scripts/supabase-export.json',
      JSON.stringify(data, null, 2)
    );

    console.log('✅ Data exported successfully!');
    console.log('   Users:', users.length);
    console.log('   Accounts:', accounts.length);
    console.log('   Sessions:', sessions.length);
    console.log('   Posts:', posts.length);
    console.log('   Tags:', tags.length);
    console.log('   PostTags:', postTags.length);
    console.log('   Gallery:', gallery.length);
    console.log('   Notifications:', notifications.length);
    console.log('   AuditLogs:', auditLogs.length);
    console.log('   Discussions:', discussions.length);
    console.log('   Verifications:', verifications.length);
    console.log('   File: scripts/supabase-export.json');
  } catch (error) {
    console.error('❌ Error exporting data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
