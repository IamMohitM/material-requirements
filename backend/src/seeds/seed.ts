import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, Project, Material, Vendor } from '../entities/index';
import { generateId } from '../utils/helpers';
import { UserRole, ProjectStatus } from '../types/index';

async function seed() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    const materialRepository = AppDataSource.getRepository(Material);
    const vendorRepository = AppDataSource.getRepository(Vendor);

    // Create demo users for all roles
    const demoPassword = await bcrypt.hash('demo123456', 10);
    const demoUsers = [
      {
        email: 'admin@demo.com',
        name: 'Admin Demo',
        role: UserRole.ADMIN,
        description: 'Full system access, user management, all features',
      },
      {
        email: 'engineer@demo.com',
        name: 'Site Engineer Demo',
        role: UserRole.SITE_ENGINEER,
        description: 'Create material requests, view quotes and POs',
      },
      {
        email: 'approver@demo.com',
        name: 'Approver Demo',
        role: UserRole.APPROVER,
        description: 'Review and approve material requests',
      },
      {
        email: 'finance@demo.com',
        name: 'Finance Officer Demo',
        role: UserRole.FINANCE_OFFICER,
        description: 'Manage vendors, invoices, procurement oversight',
      },
    ];

    console.log('\n📝 DEMO LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');

    for (const userData of demoUsers) {
      const userId = generateId();
      const user = userRepository.create({
        id: userId,
        email: userData.email,
        name: userData.name,
        password_hash: demoPassword,
        role: userData.role,
        project_ids: [],
        is_active: true,
      });

      await userRepository.save(user);
      console.log(`✓ ${userData.role.padEnd(20)} | ${userData.email.padEnd(25)} | Password: demo123456`);
      console.log(`  └─ ${userData.description}`);
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Demo users created successfully!
    console.log('✓ Demo users created successfully!')
    console.log('\nYou can now use these credentials to login to the frontend at http://localhost:3001\n');

    console.log('\n✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
