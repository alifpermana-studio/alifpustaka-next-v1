require('dotenv').config({ path: '.env.local' });
const { prisma } = require('../src/lib/prisma');

async function testConnection() {
  try {
    console.log('Testing connection to VPS PostgreSQL...\n');
    
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    
    console.log('✅ Connection successful!');
    console.log('✅ Users in database:', userCount);
    console.log('✅ Posts in database:', postCount);
    
    // Test super admin
    const superAdmin = await prisma.user.findUnique({
      where: { email: process.env.SUPERADMIN_EMAIL }
    });
    
    if (superAdmin) {
      console.log('\n✅ Super Admin found:');
      console.log('   Email:', superAdmin.email);
      console.log('   Role:', superAdmin.role);
    }
    
    console.log('\n🎉 Migration successful! VPS PostgreSQL is working correctly.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
