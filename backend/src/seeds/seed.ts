import bcrypt from 'bcrypt';
import { AppDataSource } from '@config/database';
import { User, Project, Material, Vendor } from '@entities/index';
import { generateId } from '@utils/helpers';
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

    // Create default users
    const adminId = generateId();
    const adminPassword = await bcrypt.hash('password123', 10);

    const admin = userRepository.create({
      id: adminId,
      email: 'admin@company.com',
      name: 'Admin User',
      password_hash: adminPassword,
      role: UserRole.ADMIN,
      project_ids: [],
      is_active: true,
    });

    await userRepository.save(admin);
    console.log('✓ Created admin user: admin@company.com');

    // Create a sample project
    const projectId = generateId();
    const project = projectRepository.create({
      id: projectId,
      name: 'Downtown Plaza Construction',
      description: 'High-rise commercial building project',
      location: 'New York, NY',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2025-12-31'),
      budget: 5000000,
      status: ProjectStatus.ACTIVE,
      company_id: 'company-001',
      created_by: adminId,
    });

    await projectRepository.save(project);
    console.log('✓ Created sample project');

    // Create materials
    const materials = [
      { name: 'Steel Reinforcement Bars', unit: 'kg', category: 'Steel' },
      { name: 'Concrete (M25)', unit: 'm3', category: 'Concrete' },
      { name: 'Cement Bags (50kg)', unit: 'bags', category: 'Cement' },
      { name: 'Brick (Common Red)', unit: 'numbers', category: 'Bricks' },
      { name: 'Sand (River)', unit: 'ton', category: 'Aggregates' },
      { name: 'Gravel', unit: 'ton', category: 'Aggregates' },
      { name: 'Paint (Interior)', unit: 'liters', category: 'Paint' },
      { name: 'Tiles (Ceramic)', unit: 'sqft', category: 'Finishing' },
    ];

    for (const materialData of materials) {
      const material = materialRepository.create({
        id: generateId(),
        name: materialData.name,
        unit_of_measure: materialData.unit,
        category: materialData.category,
        is_active: true,
      });
      await materialRepository.save(material);
    }
    console.log(`✓ Created ${materials.length} materials`);

    // Create vendors
    const vendors = [
      {
        name: 'Steel Traders Inc',
        contact: 'Mr. Rajesh Kumar',
        email: 'rajesh@steeltraders.com',
      },
      {
        name: 'Concrete Solutions Ltd',
        contact: 'Ms. Priya Sharma',
        email: 'priya@concretesolutions.com',
      },
      {
        name: 'Premier Bricks Company',
        contact: 'Mr. Vikram Singh',
        email: 'vikram@premierbricks.com',
      },
      {
        name: 'Quality Paints & Coatings',
        contact: 'Mr. Arjun Patel',
        email: 'arjun@qualitypaints.com',
      },
    ];

    for (const vendorData of vendors) {
      const vendor = vendorRepository.create({
        id: generateId(),
        name: vendorData.name,
        contact_person: vendorData.contact,
        email: vendorData.email,
        phone: '+91-9876543210',
        address: { city: 'Mumbai', state: 'Maharashtra' },
        payment_terms: 'Net 30',
        is_active: true,
      });
      await vendorRepository.save(vendor);
    }
    console.log(`✓ Created ${vendors.length} vendors`);

    console.log('\n✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
