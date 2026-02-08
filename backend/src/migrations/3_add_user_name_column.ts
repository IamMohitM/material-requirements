import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNameColumn1707334400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add name column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "name" varchar(255);
    `);

    // Migrate data from first_name + last_name to name (if those columns exist)
    await queryRunner.query(`
      UPDATE "users"
      SET "name" = COALESCE("first_name", '') || ' ' || COALESCE("last_name", '')
      WHERE "name" IS NULL;
    `);

    // Add other missing columns
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "project_ids" uuid[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "permissions" jsonb,
      ADD COLUMN IF NOT EXISTS "phone" varchar(20),
      ADD COLUMN IF NOT EXISTS "department" varchar(100),
      ADD COLUMN IF NOT EXISTS "last_login" timestamp;
    `);

    // Drop old columns if they exist
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "first_name",
      DROP COLUMN IF EXISTS "last_name";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: restore old columns
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "first_name" varchar(50),
      ADD COLUMN "last_name" varchar(50);
    `);

    // Copy data back
    await queryRunner.query(`
      UPDATE "users"
      SET "first_name" = SPLIT_PART("name", ' ', 1),
          "last_name" = SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
      WHERE "name" IS NOT NULL;
    `);

    // Drop name column
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "name",
      DROP COLUMN IF EXISTS "project_ids",
      DROP COLUMN IF EXISTS "permissions",
      DROP COLUMN IF EXISTS "phone",
      DROP COLUMN IF EXISTS "department",
      DROP COLUMN IF EXISTS "last_login";
    `);
  }
}
