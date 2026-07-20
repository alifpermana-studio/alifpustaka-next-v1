// Audit Log Cleanup Script
// Purpose: Delete audit logs older than 1 year
// Usage: node scripts/cleanup-audit-logs.js

import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function cleanupOldAuditLogs() {
  try {
    console.log('Starting audit log cleanup...');
    
    // Calculate date 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    console.log(`Deleting audit logs older than: ${oneYearAgo.toISOString()}`);
    
    // Delete old audit logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: oneYearAgo
        }
      }
    });
    
    console.log(`✅ Successfully deleted ${result.count} audit log(s)`);
    console.log('Cleanup completed at:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error during audit log cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupOldAuditLogs();
