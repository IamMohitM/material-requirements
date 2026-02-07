import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Material } from '../entities/Material';
import { Vendor } from '../entities/Vendor';
import { Request } from '../entities/Request';
import { Quote } from '../entities/Quote';
import { PurchaseOrder } from '../entities/PurchaseOrder';
import { Delivery } from '../entities/Delivery';
import { Invoice } from '../entities/Invoice';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seedTier2TestData() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connection established');

    // Create test user
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = userRepo.create({
      id: uuidv4(),
      email: 'test@example.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      role: 'finance_officer',
    });
    await userRepo.save(user);
    console.log('✓ Test user created');

    // Create project
    const projectRepo = AppDataSource.getRepository(Project);
    const project = projectRepo.create({
      id: uuidv4(),
      name: 'Test Construction Project',
      description: 'Testing Tier 2 delivery and invoice functionality',
      status: 'active',
      created_by_id: user.id,
    });
    await projectRepo.save(project);
    console.log('✓ Project created');

    // Create material
    const materialRepo = AppDataSource.getRepository(Material);
    const material = materialRepo.create({
      id: uuidv4(),
      material_code: 'STEEL-001',
      name: 'Steel Beam',
      category: 'Structural',
      unit: 'meters',
      unit_price: 100.00,
    });
    await materialRepo.save(material);
    console.log('✓ Material created');

    // Create vendor
    const vendorRepo = AppDataSource.getRepository(Vendor);
    const vendor = vendorRepo.create({
      id: uuidv4(),
      vendor_name: 'Steel Suppliers Inc',
      contact_person: 'John Doe',
      email: 'sales@steelsuppliers.com',
      rating: 4.5,
    });
    await vendorRepo.save(vendor);
    console.log('✓ Vendor created');

    // Create request
    const requestRepo = AppDataSource.getRepository(Request);
    const request = requestRepo.create({
      id: uuidv4(),
      request_number: 'REQ-001',
      project_id: project.id,
      status: 'submitted',
      materials: [
        {
          material_id: material.id,
          quantity: 100,
          notes: 'For structural support',
        },
      ],
      submitted_by_id: user.id,
      submitted_at: new Date(),
      approval_status: 'approved',
      approved_by_id: user.id,
      approved_at: new Date(),
    });
    await requestRepo.save(request);
    console.log('✓ Request created');

    // Create quote
    const quoteRepo = AppDataSource.getRepository(Quote);
    const quote = quoteRepo.create({
      id: uuidv4(),
      quote_number: 'QTE-001',
      request_id: request.id,
      vendor_id: vendor.id,
      status: 'accepted',
      quote_date: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      line_items: [
        {
          material_id: material.id,
          quantity: 100,
          unit_price: 100.00,
          total: 10000.00,
        },
      ],
      total_amount: 10000.00,
      submitted_by_id: user.id,
      submitted_at: new Date(),
    });
    await quoteRepo.save(quote);
    console.log('✓ Quote created');

    // Create PO
    const poRepo = AppDataSource.getRepository(PurchaseOrder);
    const po = poRepo.create({
      id: uuidv4(),
      po_number: 'PO-001',
      project_id: project.id,
      request_id: request.id,
      vendor_id: vendor.id,
      quote_id: quote.id,
      order_date: new Date(),
      required_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'delivered',
      delivery_status: 'PENDING',
      total_amount: 10000.00,
      line_items: [
        {
          material_id: material.id,
          quantity: 100,
          unit_price: 100.00,
          total: 10000.00,
        },
      ],
      approval_status: 'approved',
      first_approver_id: user.id,
      first_approved_at: new Date(),
      final_approver_id: user.id,
      final_approved_at: new Date(),
    });
    await poRepo.save(po);
    console.log('✓ PO created');

    // Create delivery
    const deliveryRepo = AppDataSource.getRepository(Delivery);
    const delivery = deliveryRepo.create({
      id: uuidv4(),
      delivery_number: 'DL-001',
      po_id: po.id,
      delivery_date: new Date(),
      received_by_id: user.id,
      received_at: new Date(),
      status: 'complete',
      delivery_location: 'Site A',
      notes: 'All items received in good condition',
      line_items: [
        {
          material_id: material.id,
          quantity_ordered: 100,
          quantity_good: 100,
          quantity_damaged: 0,
          quality_score: 100.0,
          brand_ordered: 'Standard',
          brand_received: 'Standard',
          notes: 'Perfect condition',
        },
      ],
    });
    await deliveryRepo.save(delivery);
    console.log('✓ Delivery created');

    // Create invoice
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const invoice = invoiceRepo.create({
      id: uuidv4(),
      invoice_number: 'INV-001',
      po_id: po.id,
      vendor_id: vendor.id,
      invoice_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      total_amount: 10000.00,
      status: 'approved',
      matching_status: 'fully_matched',
      line_items: [
        {
          material_id: material.id,
          quantity: 100,
          unit_price: 100.00,
          total: 10000.00,
          brand_invoiced: 'Standard',
        },
      ],
      submitted_by_id: user.id,
      submitted_at: new Date(),
      approved_by_id: user.id,
      approved_at: new Date(),
      match_analysis: {
        critical_count: 0,
        warning_count: 0,
        info_count: 0,
        unmatched_qty: 0,
      },
    });
    await invoiceRepo.save(invoice);
    console.log('✓ Invoice created');

    console.log('\n✓✓✓ Tier 2 Test Data Seeded Successfully ✓✓✓\n');
    console.log('You can now test the Tier 2 endpoints:');
    console.log('- POST /api/v1/deliveries');
    console.log('- GET  /api/v1/deliveries');
    console.log('- POST /api/v1/invoices');
    console.log('- GET  /api/v1/invoices');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedTier2TestData();
