import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tier2Schema1707305400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Tier 2 specific enums
    await queryRunner.query(`
      CREATE TYPE "delivery_status" AS ENUM ('pending', 'partial', 'complete');
      CREATE TYPE "invoice_status" AS ENUM ('submitted', 'matched', 'approved', 'rejected', 'paid');
      CREATE TYPE "invoice_matching_status" AS ENUM ('unmatched', 'partial_matched', 'fully_matched', 'mismatched');
      CREATE TYPE "discrepancy_type" AS ENUM ('quantity_mismatch', 'price_mismatch', 'brand_mismatch', 'timing_mismatch', 'quality_issue');
      CREATE TYPE "discrepancy_severity" AS ENUM ('critical', 'warning', 'info');
      CREATE TYPE "discrepancy_status" AS ENUM ('open', 'reviewed', 'resolved', 'waived');
    `);

    // Create deliveries table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id" uuid PRIMARY KEY,
        "delivery_number" varchar(50) NOT NULL,
        "po_id" uuid NOT NULL,
        "delivery_date" date NOT NULL,
        "received_by_id" uuid NOT NULL,
        "received_at" timestamp NOT NULL,
        "status" "delivery_status" NOT NULL DEFAULT 'pending',
        "delivery_location" varchar(200),
        "location_details" jsonb,
        "notes" text,
        "photos" jsonb,
        "line_items" jsonb NOT NULL,
        "match_analysis" jsonb,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for deliveries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_delivery_po_id" ON "deliveries"("po_id");
      CREATE INDEX IF NOT EXISTS "idx_delivery_status" ON "deliveries"("status");
      CREATE INDEX IF NOT EXISTS "idx_delivery_date" ON "deliveries"("delivery_date");
      CREATE INDEX IF NOT EXISTS "idx_delivery_received_by" ON "deliveries"("received_by_id");
      CREATE INDEX IF NOT EXISTS "idx_delivery_po_date" ON "deliveries"("po_id", "delivery_date" DESC);
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid PRIMARY KEY,
        "invoice_number" varchar(100) UNIQUE NOT NULL,
        "po_id" uuid NOT NULL,
        "vendor_id" uuid NOT NULL,
        "invoice_date" date NOT NULL,
        "due_date" date NOT NULL,
        "total_amount" numeric(15, 2) NOT NULL,
        "line_items" jsonb NOT NULL,
        "status" "invoice_status" NOT NULL DEFAULT 'submitted',
        "matching_status" "invoice_matching_status" NOT NULL DEFAULT 'unmatched',
        "match_analysis" jsonb,
        "notes" text,
        "submitted_by_id" uuid NOT NULL,
        "submitted_at" timestamp NOT NULL,
        "approved_by_id" uuid,
        "approved_at" timestamp,
        "approval_notes" text,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for invoices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoice_number" ON "invoices"("invoice_number");
      CREATE INDEX IF NOT EXISTS "idx_invoice_po_id" ON "invoices"("po_id");
      CREATE INDEX IF NOT EXISTS "idx_invoice_vendor_id" ON "invoices"("vendor_id");
      CREATE INDEX IF NOT EXISTS "idx_invoice_status" ON "invoices"("status");
      CREATE INDEX IF NOT EXISTS "idx_invoice_matching_status" ON "invoices"("matching_status");
      CREATE INDEX IF NOT EXISTS "idx_invoice_date" ON "invoices"("invoice_date");
      CREATE INDEX IF NOT EXISTS "idx_invoice_po_status" ON "invoices"("po_id", "status", "matching_status");
    `);

    // Create discrepancy_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "discrepancy_logs" (
        "id" uuid PRIMARY KEY,
        "po_id" uuid NOT NULL,
        "delivery_id" uuid,
        "invoice_id" uuid,
        "type" "discrepancy_type" NOT NULL,
        "severity" "discrepancy_severity" NOT NULL,
        "description" text NOT NULL,
        "flagged_by_id" uuid NOT NULL,
        "flagged_at" timestamp NOT NULL,
        "status" "discrepancy_status" NOT NULL DEFAULT 'open',
        "resolution_notes" text,
        "resolved_by_id" uuid,
        "resolved_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for discrepancy_logs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_po_id" ON "discrepancy_logs"("po_id");
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_status" ON "discrepancy_logs"("status");
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_severity" ON "discrepancy_logs"("severity");
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_type" ON "discrepancy_logs"("type");
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_flagged_at" ON "discrepancy_logs"("flagged_at");
      CREATE INDEX IF NOT EXISTS "idx_discrepancy_po_invoice" ON "discrepancy_logs"("po_id", "invoice_id", "status", "severity");
    `);

    // Add delivery_status column to purchase_orders table
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "delivery_status" varchar(50) DEFAULT 'PENDING'
    `);

    // Create index for PO delivery status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_po_delivery_status" ON "purchase_orders"("delivery_status")
    `);

    console.log('Tier 2 schema migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_po_delivery_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_po_invoice"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_flagged_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_severity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_discrepancy_po_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_po_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_matching_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_vendor_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_po_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_po_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_received_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_delivery_po_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "discrepancy_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deliveries"`);

    // Drop column from purchase_orders
    await queryRunner.query(`
      ALTER TABLE "purchase_orders" DROP COLUMN IF EXISTS "delivery_status"
    `);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "discrepancy_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "discrepancy_severity"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "discrepancy_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_matching_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "delivery_status"`);
  }
}
