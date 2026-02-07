import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1707219600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extensions
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Create enums for Tier 1
    await queryRunner.query(`
      CREATE TYPE "user_role" AS ENUM ('site_engineer', 'approver', 'finance_officer', 'admin');
      CREATE TYPE "project_status" AS ENUM ('planning', 'active', 'complete', 'paused');
      CREATE TYPE "request_status" AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'converted_to_po', 'cancelled');
      CREATE TYPE "quote_status" AS ENUM ('sent', 'received', 'accepted', 'rejected');
      CREATE TYPE "po_status" AS ENUM ('draft', 'sent', 'acknowledged', 'in_production', 'shipped', 'delivered', 'cancelled');
      CREATE TYPE "approval_status" AS ENUM ('pending', 'approved', 'rejected');
      CREATE TYPE "verification_status" AS ENUM ('pending', 'verified', 'rejected');
      CREATE TYPE "audit_status" AS ENUM ('success', 'failed');
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(100) UNIQUE NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "first_name" varchar(50),
        "last_name" varchar(50),
        "role" "user_role" DEFAULT 'site_engineer',
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
      CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(200) NOT NULL,
        "description" text,
        "status" "project_status" DEFAULT 'planning',
        "start_date" date,
        "end_date" date,
        "budget" numeric(15, 2),
        "created_by_id" uuid NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("status");
      CREATE INDEX IF NOT EXISTS "idx_projects_created_by" ON "projects"("created_by_id");
    `);

    // Create materials table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "materials" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "material_code" varchar(50) UNIQUE NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text,
        "unit" varchar(20),
        "category" varchar(100),
        "unit_price" numeric(15, 2),
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_materials_code" ON "materials"("material_code");
      CREATE INDEX IF NOT EXISTS "idx_materials_category" ON "materials"("category");
    `);

    // Create vendors table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "vendor_name" varchar(200) NOT NULL,
        "contact_person" varchar(100),
        "email" varchar(100),
        "phone" varchar(20),
        "address" text,
        "rating" numeric(3, 2) DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_vendors_name" ON "vendors"("vendor_name");
      CREATE INDEX IF NOT EXISTS "idx_vendors_email" ON "vendors"("email");
    `);

    // Create requests table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "request_number" varchar(100) UNIQUE NOT NULL,
        "project_id" uuid NOT NULL,
        "status" "request_status" DEFAULT 'draft',
        "materials" jsonb NOT NULL DEFAULT '[]',
        "submitted_by_id" uuid,
        "submitted_at" timestamp,
        "reviewed_by_id" uuid,
        "reviewed_at" timestamp,
        "approved_by_id" uuid,
        "approved_at" timestamp,
        "approval_status" "approval_status" DEFAULT 'pending',
        "approval_notes" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_requests_number" ON "requests"("request_number");
      CREATE INDEX IF NOT EXISTS "idx_requests_project_id" ON "requests"("project_id");
      CREATE INDEX IF NOT EXISTS "idx_requests_status" ON "requests"("status");
    `);

    // Create quotes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quote_number" varchar(100) UNIQUE NOT NULL,
        "request_id" uuid NOT NULL,
        "vendor_id" uuid NOT NULL,
        "status" "quote_status" DEFAULT 'sent',
        "quote_date" date NOT NULL,
        "valid_until" date NOT NULL,
        "line_items" jsonb NOT NULL DEFAULT '[]',
        "total_amount" numeric(15, 2),
        "notes" text,
        "submitted_by_id" uuid,
        "submitted_at" timestamp,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_quotes_number" ON "quotes"("quote_number");
      CREATE INDEX IF NOT EXISTS "idx_quotes_request_id" ON "quotes"("request_id");
      CREATE INDEX IF NOT EXISTS "idx_quotes_vendor_id" ON "quotes"("vendor_id");
      CREATE INDEX IF NOT EXISTS "idx_quotes_status" ON "quotes"("status");
    `);

    // Create purchase_orders table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "purchase_orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "po_number" varchar(100) UNIQUE NOT NULL,
        "project_id" uuid NOT NULL,
        "request_id" uuid NOT NULL,
        "vendor_id" uuid NOT NULL,
        "quote_id" uuid NOT NULL,
        "order_date" date NOT NULL,
        "required_delivery_date" date NOT NULL,
        "status" "po_status" DEFAULT 'draft',
        "total_amount" numeric(15, 2),
        "line_items" jsonb NOT NULL DEFAULT '[]',
        "approval_status" "approval_status" DEFAULT 'pending',
        "first_approver_id" uuid,
        "first_approver_notes" text,
        "first_approved_at" timestamp,
        "final_approver_id" uuid,
        "final_approver_notes" text,
        "final_approved_at" timestamp,
        "delivery_status" varchar(50) DEFAULT 'PENDING',
        "notes" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_po_number" ON "purchase_orders"("po_number");
      CREATE INDEX IF NOT EXISTS "idx_po_project_id" ON "purchase_orders"("project_id");
      CREATE INDEX IF NOT EXISTS "idx_po_vendor_id" ON "purchase_orders"("vendor_id");
      CREATE INDEX IF NOT EXISTS "idx_po_status" ON "purchase_orders"("status");
      CREATE INDEX IF NOT EXISTS "idx_po_approval_status" ON "purchase_orders"("approval_status");
    `);

    // Create vendor_rate_history table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_rate_history" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "material_id" uuid NOT NULL,
        "old_rate" numeric(15, 2),
        "new_rate" numeric(15, 2) NOT NULL,
        "changed_by_id" uuid,
        "change_reason" text,
        "effective_date" date NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_rate_history_vendor" ON "vendor_rate_history"("vendor_id");
      CREATE INDEX IF NOT EXISTS "idx_rate_history_material" ON "vendor_rate_history"("material_id");
      CREATE INDEX IF NOT EXISTS "idx_rate_history_date" ON "vendor_rate_history"("effective_date");
    `);

    // Create brands table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "brands" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "material_id" uuid NOT NULL,
        "brand_name" varchar(100) NOT NULL,
        "supplier" varchar(100),
        "specifications" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT NOW(),
        "updated_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_brands_material" ON "brands"("material_id");
      CREATE INDEX IF NOT EXISTS "idx_brands_name" ON "brands"("brand_name");
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" varchar(50) NOT NULL,
        "entity_type" varchar(50) NOT NULL,
        "entity_id" uuid,
        "user_id" uuid,
        "status" "audit_status" DEFAULT 'success',
        "changes" jsonb,
        "ip_address" varchar(50),
        "created_at" timestamp NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "audit_logs"("entity_type", "entity_id");
      CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "audit_logs"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "audit_logs"("action");
      CREATE INDEX IF NOT EXISTS "idx_audit_date" ON "audit_logs"("created_at" DESC);
    `);

    console.log('Initial schema migration created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendor_rate_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "materials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop types in reverse order
    await queryRunner.query(`DROP TYPE IF EXISTS "audit_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "verification_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "approval_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "po_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "quote_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "request_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "project_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
