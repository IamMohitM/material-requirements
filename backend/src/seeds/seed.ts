import bcrypt from 'bcrypt';
import { AppDataSource, withDatabaseConnection } from '../config/database';
import { User, Project, Material, Vendor, Request } from '../entities/index';
import { generateId } from '../utils/helpers';
import { UserRole, ProjectStatus, RequestStatus, VerificationStatus, ApprovalStatus } from '../types/index';

async function seed() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      console.log('Initializing database connection...');
      await AppDataSource.initialize();
      console.log('✓ Database connection established\n');
    }

    // Wrap all database operations with connection retry logic
    await withDatabaseConnection(async () => {
      const userRepository = AppDataSource.getRepository(User);
      const projectRepository = AppDataSource.getRepository(Project);
      const materialRepository = AppDataSource.getRepository(Material);
      const vendorRepository = AppDataSource.getRepository(Vendor);
      const requestRepository = AppDataSource.getRepository(Request);

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

      console.log('📝 DEMO LOGIN CREDENTIALS');
      console.log('═══════════════════════════════════════════════════════════');

      for (const userData of demoUsers) {
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (existingUser) {
          console.log(`⊘ ${userData.role.padEnd(20)} | ${userData.email.padEnd(25)} | (Already exists)`);
          continue;
        }

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
        // Check if project already exists
        const existingProject = await projectRepository.findOne({ where: { name: projectData.name } });
        if (existingProject) {
          console.log(`⊘ ${projectData.name} (Already exists)`);
          continue;
        }

        const adminUser = await userRepository.findOne({ where: { email: 'admin@demo.com' } });
        const project = projectRepository.create({
          id: generateId(),
          ...projectData,
          created_by_id: adminUser?.id || '',
          is_active: true,
        });
        await projectRepository.save(project);
        console.log(`✓ ${projectData.name}`);
      }

      // Create demo materials
      console.log('\n🔨 CREATING DEMO MATERIALS');
      console.log('═══════════════════════════════════════════════════════════');

      const demoMaterials = [
        // Concrete Materials
        {
          material_code: 'MAT-CEMENT-001',
          name: 'Portland Cement 50kg',
          unit: 'bag',
          category: 'Concrete Materials',
          description: 'Standard Portland cement for concrete work',
        },
        {
          material_code: 'MAT-CEMENT-002',
          name: 'Portland Cement 25kg',
          unit: 'bag',
          category: 'Concrete Materials',
          description: 'Smaller bag Portland cement',
        },
        // Steel Materials
        {
          material_code: 'MAT-STEEL-001',
          name: 'Steel Rebar 16mm',
          unit: 'kg',
          category: 'Steel',
          description: 'High strength steel reinforcement bars 16mm',
        },
        {
          material_code: 'MAT-STEEL-002',
          name: 'Steel Rebar 12mm',
          unit: 'kg',
          category: 'Steel',
          description: 'High strength steel reinforcement bars 12mm',
        },
        {
          material_code: 'MAT-STEEL-003',
          name: 'Steel Rebar 25mm',
          unit: 'kg',
          category: 'Steel',
          description: 'High strength steel reinforcement bars 25mm',
        },
        // Aggregates
        {
          material_code: 'MAT-SAND-001',
          name: 'Construction Sand',
          unit: 'cubic_meter',
          category: 'Aggregates',
          description: 'Fine sand for concrete and mortar',
        },
        {
          material_code: 'MAT-GRAVEL-001',
          name: 'Gravel 20mm',
          unit: 'cubic_meter',
          category: 'Aggregates',
          description: 'Coarse gravel for concrete base',
        },
        // Masonry
        {
          material_code: 'MAT-BRICK-001',
          name: 'Red Bricks',
          unit: 'piece',
          category: 'Masonry',
          description: 'Standard red clay bricks 210x100x70mm',
        },
        {
          material_code: 'MAT-TILE-001',
          name: 'Ceramic Floor Tiles 600x600',
          unit: 'piece',
          category: 'Masonry',
          description: 'Ceramic floor tiles 600x600mm',
        },
        // Finishing
        {
          material_code: 'MAT-PAINT-001',
          name: 'Exterior Paint 20L',
          unit: 'bucket',
          category: 'Finishing',
          description: 'Premium exterior paint 20 liter bucket',
        },
        {
          material_code: 'MAT-WIRE-001',
          name: 'Copper Wire 2.5mm',
          unit: 'kg',
          category: 'Electrical',
          description: 'Copper electrical wire 2.5mm diameter',
        },
      ];

      const materialMap = new Map<string, string>();
      for (const materialData of demoMaterials) {
        // Check if material already exists
        const existingMaterial = await materialRepository.findOne({ where: { material_code: materialData.material_code } });
        if (existingMaterial) {
          materialMap.set(materialData.material_code, existingMaterial.id);
          console.log(`⊘ ${materialData.name} (Already exists)`);
          continue;
        }

        const material = materialRepository.create({
          id: generateId(),
          ...materialData,
          is_active: true,
        });
        await materialRepository.save(material);
        materialMap.set(materialData.material_code, material.id);
        console.log(`✓ ${materialData.name}`);
      }

      // Create demo vendors
      console.log('\n🏭 CREATING DEMO VENDORS');
      console.log('═══════════════════════════════════════════════════════════');

      const demoVendors = [
        {
          name: 'BuildRight Supplies',
          contact_person: 'Rajesh Kumar',
          email: 'rajesh@buildright.com',
          phone: '+91-9876543210',
          address: JSON.stringify({
            street: '123 Industrial Area',
            city: 'Delhi',
            state: 'Delhi',
            zip: '110001',
          }),
        },
        {
          name: 'ConcreteMaster India',
          contact_person: 'Priya Singh',
          email: 'priya@concretemaster.in',
          phone: '+91-9123456789',
          address: JSON.stringify({
            street: '456 Commerce Park',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400101',
          }),
        },
        {
          name: 'Steel Solutions Ltd',
          contact_person: 'Arjun Patel',
          email: 'arjun@steelsolutions.in',
          phone: '+91-9987654321',
          address: JSON.stringify({
            street: '789 Industrial Complex',
            city: 'Bangalore',
            state: 'Karnataka',
            zip: '560001',
          }),
        },
        {
          name: 'Premium Materials Co.',
          contact_person: 'Neha Gupta',
          email: 'neha@premiummaterials.co',
          phone: '+91-9555666777',
          address: JSON.stringify({
            street: '321 Trade Center',
            city: 'Hyderabad',
            state: 'Telangana',
            zip: '500001',
          }),
        },
        {
          name: 'QuickDeliver Materials',
          contact_person: 'Vikram Reddy',
          email: 'vikram@quickdeliver.in',
          phone: '+91-9111222333',
          address: JSON.stringify({
            street: '654 Logistics Hub',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411001',
          }),
        },
      ];

      const vendorMap = new Map<string, string>();
      for (const vendorData of demoVendors) {
        // Check if vendor already exists
        const existingVendor = await vendorRepository.findOne({ where: { email: vendorData.email } });
        if (existingVendor) {
          vendorMap.set(vendorData.name, existingVendor.id);
          console.log(`⊘ ${vendorData.name} (Already exists)`);
          continue;
        }

        const vendor = vendorRepository.create({
          id: generateId(),
          ...vendorData,
          rating: 4.5,
          is_active: true,
        });
        await vendorRepository.save(vendor);
        vendorMap.set(vendorData.name, vendor.id);
        console.log(`✓ ${vendorData.name} (${vendorData.contact_person})`);
      }

      // Create demo requests
      console.log('\n📋 CREATING DEMO REQUESTS');
      console.log('═══════════════════════════════════════════════════════════');

      const adminUser = await userRepository.findOne({ where: { email: 'admin@demo.com' } });
      const engineerUser = await userRepository.findOne({ where: { email: 'engineer@demo.com' } });
      const projects = await projectRepository.find();

      if (projects.length > 0 && adminUser && engineerUser) {
        const demoRequests = [
          {
            request_number: 'REQ-2026-001',
            project_id: projects[0].id,
            status: RequestStatus.DRAFT,
            materials: [
              { material_id: materialMap.get('MAT-CEMENT-001') || '', quantity: 100 },
              { material_id: materialMap.get('MAT-SAND-001') || '', quantity: 50 },
            ],
            submitted_by_id: engineerUser.id,
          },
          {
            request_number: 'REQ-2026-002',
            project_id: projects[0].id,
            status: RequestStatus.SUBMITTED,
            materials: [
              { material_id: materialMap.get('MAT-STEEL-001') || '', quantity: 500 },
              { material_id: materialMap.get('MAT-STEEL-002') || '', quantity: 300 },
            ],
            submitted_by_id: engineerUser.id,
            submitted_at: new Date(),
          },
          {
            request_number: 'REQ-2026-003',
            project_id: projects[0].id,
            status: RequestStatus.APPROVED,
            materials: [
              { material_id: materialMap.get('MAT-BRICK-001') || '', quantity: 10000 },
              { material_id: materialMap.get('MAT-GRAVEL-001') || '', quantity: 20 },
            ],
            submitted_by_id: engineerUser.id,
            submitted_at: new Date(Date.now() - 86400000),
            approved_by_id: adminUser.id,
            approved_at: new Date(),
            approval_status: ApprovalStatus.APPROVED,
          },
        ];

        for (const requestData of demoRequests) {
          // Check if request already exists
          const existingRequest = await requestRepository.findOne({ where: { request_number: requestData.request_number } });
          if (existingRequest) {
            console.log(`⊘ ${requestData.request_number} (Already exists)`);
            continue;
          }

          const request = requestRepository.create({
            id: generateId(),
            ...requestData,
            is_active: true,
          });
          await requestRepository.save(request);
          console.log(`✓ ${requestData.request_number} - ${requestData.materials.length} materials`);
        }
      }

      console.log('\n✓ Database seeding completed successfully');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
