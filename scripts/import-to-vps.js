const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/src/generated/prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function importData() {
  try {
    console.log('Reading exported data...');
    const data = JSON.parse(
      fs.readFileSync('scripts/supabase-export.json', 'utf8')
    );

    console.log('Importing data to VPS PostgreSQL...\n');

    // Import in correct order (respecting foreign keys)
    
    // 1. Users (no dependencies)
    console.log('Importing Users...');
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
    console.log(`✅ ${data.users.length} users imported`);

    // 2. Accounts (depends on Users)
    console.log('Importing Accounts...');
    for (const account of data.accounts) {
      await prisma.account.create({ data: account });
    }
    console.log(`✅ ${data.accounts.length} accounts imported`);

    // 3. Sessions (depends on Users)
    console.log('Importing Sessions...');
    for (const session of data.sessions) {
      await prisma.session.create({ data: session });
    }
    console.log(`✅ ${data.sessions.length} sessions imported`);

    // 4. Posts (depends on Users)
    console.log('Importing Posts...');
    for (const post of data.posts) {
      await prisma.post.create({ data: post });
    }
    console.log(`✅ ${data.posts.length} posts imported`);

    // 5. Tags (no dependencies)
    console.log('Importing Tags...');
    for (const tag of data.tags) {
      await prisma.tag.create({ data: tag });
    }
    console.log(`✅ ${data.tags.length} tags imported`);

    // 6. PostTags (depends on Posts and Tags)
    console.log('Importing PostTags...');
    for (const postTag of data.postTags) {
      await prisma.postTag.create({ data: postTag });
    }
    console.log(`✅ ${data.postTags.length} post-tag relations imported`);

    // 7. Gallery (depends on Users)
    console.log('Importing Gallery...');
    for (const gallery of data.gallery) {
      await prisma.gallery.create({ data: gallery });
    }
    console.log(`✅ ${data.gallery.length} gallery items imported`);

    // 8. Notifications (depends on Users)
    console.log('Importing Notifications...');
    for (const notification of data.notifications) {
      await prisma.notification.create({ data: notification });
    }
    console.log(`✅ ${data.notifications.length} notifications imported`);

    // 9. AuditLogs (no dependencies)
    console.log('Importing AuditLogs...');
    for (const auditLog of data.auditLogs) {
      await prisma.auditLog.create({ data: auditLog });
    }
    console.log(`✅ ${data.auditLogs.length} audit logs imported`);

    // 10. Discussions (depends on Users, can have self-reference)
    console.log('Importing Discussions...');
    for (const discussion of data.discussions) {
      await prisma.discussion.create({ data: discussion });
    }
    console.log(`✅ ${data.discussions.length} discussions imported`);

    // 11. Verifications (if any)
    if (data.verifications && data.verifications.length > 0) {
      console.log('Importing Verifications...');
      for (const verification of data.verifications) {
        await prisma.verification.create({ data: verification });
      }
      console.log(`✅ ${data.verifications.length} verifications imported`);
    }

    console.log('\n🎉 All data imported successfully to VPS PostgreSQL!');
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
