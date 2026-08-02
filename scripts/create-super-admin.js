require('dotenv').config({ path: '.env.local' });
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../prisma/src/generated/prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function createSuperAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      console.error('❌ SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env.local');
      return;
    }

    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`✅ Super admin already exists: ${email}`);
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Status: ${existingUser.status}`);
      return;
    }

    // Create super admin user
    console.log('Creating super admin user...');
    const user = await prisma.user.create({
      data: {
        name: 'Super Admin',
        username: 'superadmin',
        email: email,
        emailVerified: true,
        role: 'super_admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ User created: ${user.email}`);

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account with password
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountId: email,
        providerId: 'credential',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Account created with credential provider`);
    console.log('\n🎉 Super admin created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Username: superadmin`);
    console.log(`   Role: super_admin`);
    console.log(`   Status: active`);

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
