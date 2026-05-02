import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewsApprovalWorkflow1000000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to news_approval
    await queryRunner.query(`
      ALTER TABLE "news_approval"
        ADD COLUMN IF NOT EXISTS "submitted_to_admin_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS "admin_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS "seen_by_admin_at" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "seen_by_editor_at" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    `);

    // Change reviewed_at to nullable (it was auto-set before, now it's optional)
    await queryRunner.query(`
      ALTER TABLE "news_approval"
        ALTER COLUMN "reviewed_at" DROP NOT NULL
    `);

    // Indexes for badge count queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_news_approval_status_submitted"
        ON "news_approval"("status", "submitted_to_admin_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_news_approval_editor_status"
        ON "news_approval"("editor_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_news_approval_editor_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_news_approval_status_submitted"`);
    await queryRunner.query(`
      ALTER TABLE "news_approval"
        DROP COLUMN IF EXISTS "submitted_to_admin_id",
        DROP COLUMN IF EXISTS "admin_id",
        DROP COLUMN IF EXISTS "seen_by_admin_at",
        DROP COLUMN IF EXISTS "seen_by_editor_at",
        DROP COLUMN IF EXISTS "created_at"
    `);
  }
}
