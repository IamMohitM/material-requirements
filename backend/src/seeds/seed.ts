import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, Project, Material, Vendor } from '../entities/index';
import { generateId } from '../utils/helpers';
import { UserRole, ProjectStatus } from '../types/index';

async function seed() {
  try {
    // Create a fresh connection for seeding
    const seedConnection = AppDataSource.isInitialized ? AppDataSource : await AppDataSource.initialize();

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

    // Create demo projects
    console.log('\n📦 CREATING DEMO PROJECTS');
    console.log('═══════════════════════════════════════════════════════════');

    const demoProjects = [
      {
        name: 'Downtown Plaza',
        description: 'Modern commercial development in downtown area',
        start_date: new Date('2026-01-15'),
        end_date: new Date('2026-12-31'),
        budget: 500000,
        status: ProjectStatus.ACTIVE,
      },
      {
        name: 'Riverside Apartments',
        description: 'Residential apartment complex near river',
        start_date: new Date('2026-02-01'),
        end_date: new Date('2027-06-30'),
        budget: 750000,
        status: ProjectStatus.PLANNING,
      },
      {
        name: 'Tech Park Office',
        description: 'Corporate office building',
        start_date: new Date('2026-03-01'),
        end_date: new Date('2027-03-31'),
        budget: 1000000,
        status: ProjectStatus.PLANNING,
      },
    ];

    for (const projectData of demoProjects) {
      const project = projectRepository.create({
        id: generateId(),
        ...projectData,
        created_by_id: (await userRepository.findOne({ where: { email: 'admin@demo.com' } }))?.id || '',
        is_active: true,
      });
      await projectRepository.save(project);
      console.log(`✓ ${projectData.name}`);
    }

    // Create demo materials
    console.log('\n🔨 CREATING DEMO MATERIALS');
    console.log('═══════════════════════════════════════════════════════════');

    const demoMaterials = [
      {
        material_code: 'MAT-CEMENT-001',
        name: 'Portland Cement 50kg',
        unit: 'bag',
        category: 'Concrete Materials',
        description: 'Standard Portland cement for concrete work',
      },
      {
        material_code: 'MAT-STEEL-001',
        name: 'Steel Rebar 16mm',
        unit: 'kg',
        category: 'Steel',
        description: 'High strength steel reinforcement bars',
      },
      {
        material_code: 'MAT-SAND-001',
        name: 'Construction Sand',
        unit: 'cubic_meter',
        category: 'Aggregates',
        description: 'Fine sand for concrete and mortar',
      },
      {
        material_code: 'MAT-BRICK-001',
        name: 'Red Bricks',
        unit: 'piece',
        category: 'Masonry',
        description: 'Standard red clay bricks',
      },
    ];

    for (const materialData of demoMaterials) {
      const material = materialRepository.create({
        id: generateId(),
        ...materialData,
        is_active: true,
      });
      await materialRepository.save(material);
      console.log(`✓ ${materialData.name}`);
    }

    console.log('\n✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
