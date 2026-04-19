import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartseason.com' },
    update: {},
    create: {
      email: 'admin@smartseason.com',
      password: adminPassword,
      name: 'Admin Coordinator',
      role: 'ADMIN'
    }
  });
  console.log('Created admin:', admin.email);
  
  // Create field agents
  const agentPassword = await bcrypt.hash('agent123', 10);
  
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@smartseason.com' },
    update: {},
    create: {
      email: 'agent1@smartseason.com',
      password: agentPassword,
      name: 'John Field Agent',
      role: 'FIELD_AGENT'
    }
  });
  
  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@smartseason.com' },
    update: {},
    create: {
      email: 'agent2@smartseason.com',
      password: agentPassword,
      name: 'Sarah Crop Monitor',
      role: 'FIELD_AGENT'
    }
  });
  
  console.log('Created agents:', agent1.email, agent2.email);
  
  // Create sample fields
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const fields = [
    {
      name: 'North Corn Field',
      cropType: 'Corn',
      plantingDate: sixtyDaysAgo,
      stage: 'GROWING',
      location: 'North Sector, Plot A',
      size: 12.5,
      agentId: agent1.id
    },
    {
      name: 'East Wheat Field',
      cropType: 'Wheat',
      plantingDate: thirtyDaysAgo,
      stage: 'GROWING',
      location: 'East Sector, Plot B',
      size: 8.3,
      agentId: agent1.id
    },
    {
      name: 'South Soybean Field',
      cropType: 'Soybean',
      plantingDate: fiveDaysAgo,
      stage: 'PLANTED',
      location: 'South Sector, Plot C',
      size: 15.0,
      agentId: agent2.id
    },
    {
      name: 'West Tomato Field',
      cropType: 'Tomato',
      plantingDate: ninetyDaysAgo,
      stage: 'READY',
      location: 'West Sector, Plot D',
      size: 5.5,
      agentId: agent2.id
    }
  ];
  
  for (const fieldData of fields) {
    const existing = await prisma.field.findFirst({ where: { name: fieldData.name } });
    if (!existing) {
      const field = await prisma.field.create({ data: fieldData });
      console.log('Created field:', field.name);
    } else {
      console.log('Field already exists:', fieldData.name);
    }
  }
  
  console.log('Seeding completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@smartseason.com / admin123');
  console.log('Agent 1: agent1@smartseason.com / agent123');
  console.log('Agent 2: agent2@smartseason.com / agent123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
